# Voy y Vuelvo

Aplicación académica de turismo aventura y equipamiento de trekking. Incluye un frontend React y un backend Spring Boot con cinco microservicios, API Gateway, Eureka y MySQL.

**La página web se abre en `http://127.0.0.1:5173/`. El puerto `8080` corresponde a la API del backend.**

## Documentación

- [Explicación detallada de la conexión frontend–backend](frontend/docs/INTEGRACION-FRONTEND-BACKEND.md): arquitectura, funciones JavaScript, HTTP, JSON, CORS, Feign, persistencia y flujo de reserva.
- [Guía de descarga, inicio y verificación](frontend/docs/GUIA-INICIO-Y-VERIFICACION.md): instrucciones ampliadas para PowerShell y comprobación manual.
- [Frontend](frontend/README.md): funciones de React, estructura Atomic Design y comandos npm.
- [Backend](voyYvuelvo/README.md): servicios, puertos y Maven.
- [Endpoints y CRUD del backend](voyYvuelvo/docs/GUIA-BACKEND.md).
- [Requisitos actuales](frontend/docs/requisitos/ERS-EP2.md) y [ERS histórica de la primera entrega](frontend/docs/requisitos/ERS-EP1-HISTORICA.md).

## 1. Qué necesitas instalar

| Herramienta                           | Uso                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Git                                   | Descargar y actualizar el repositorio                                                                                        |
| Node.js con npm                       | Instalar y ejecutar el frontend; se verificó con Node 24 y el proyecto requiere Node 22.12 o una versión compatible superior |
| Docker Desktop con contenedores Linux | Construir y ejecutar el backend y MySQL; en Linux también puedes usar Docker Engine con Compose                              |
| Navegador                             | Abrir la aplicación y revisar las llamadas HTTP                                                                              |

Docker debe estar iniciado. También necesitas conexión a internet para la primera descarga de imágenes y dependencias, y tener disponibles los puertos `5173`, `8080`, `8081`, `8083`, `8084`, `8085`, `8086`, `8761` y `3306`.

**Para ejecutar el backend con Docker no necesitas instalar Java ni Maven en tu equipo.** Los Dockerfile incluyen las herramientas de compilación y Java 21. JDK 21 solo se requiere si vas a compilar o ejecutar las pruebas Java fuera de Docker.

En una terminal comprueba:

```powershell
git --version
node --version
npm --version
docker --version
docker compose version
docker info
```

`docker info` debe mostrar información del servidor. Si no conecta al motor, abre Docker Desktop y espera a que termine de iniciar.

## 2. Descargar la rama main

Desde la carpeta donde quieras guardar el proyecto:

```powershell
git clone --branch main https://github.com/Nokeporro/voyYvuelvo.git voy-vuelvo
cd voy-vuelvo
```

La carpeta descargada se llama `voy-vuelvo` porque el comando la nombra explícitamente. Dentro hay otra carpeta `voyYvuelvo`, que contiene el backend. Evita confundir la raíz del repositorio con esa carpeta interna.

```text
voy-vuelvo/                       Raíz del repositorio descargado
  README.md                       Esta guía
  frontend/
    index.html                    Única entrada HTML fuente
    package.json                  Dependencias y comandos npm
    package-lock.json             Versiones de instalación reproducibles
    .env.example                  Plantilla de conexión local
    public/img/                   Imágenes activas
    src/                          React, componentes, páginas y servicios
    scripts/                      Arquitectura, integración y empaquetado
    docs/                         Manuales, requisitos y evaluación
  voyYvuelvo/
    docker-compose.yml            Despliegue completo del backend
    pom.xml                       Agregador Maven de siete módulos
    .mvn/                         Configuración del wrapper
    mvnw, mvnw.cmd                Maven Wrapper compartido
    infrastructure/
      api-gateway/                Entrada de las API y autenticación
      eureka-server/              Registro de servicios
    services/
      ms-usuario/
      ms-ruta/
      ms-equipamiento/
      ms-reserva/
      ms-pago/
    docs/                         Guía backend, documentos y diagramas C4
```

También puedes descargar el ZIP de la rama `main` desde GitHub. En ese caso descomprímelo y entra en la carpeta que contiene a la vez `frontend`, `voyYvuelvo` y este README. El ZIP no incluye el historial de Git.

## 3. Iniciar MySQL y el backend — terminal A

Abre una terminal en la raíz descargada y entra al backend:

```powershell
cd voyYvuelvo
docker compose up -d mysql
docker compose logs --tail 40 mysql
```

Espera a que MySQL indique `ready for connections`. Después construye e inicia las aplicaciones Java:

```powershell
docker compose up -d --build
docker compose ps
```

La primera compilación descarga dependencias y puede tardar varios minutos. Los Dockerfile comparten una caché Maven de BuildKit para reutilizarlas entre servicios y reintentos. Docker utiliza los contextos de `infrastructure/` y `services/`; no es necesario generar JAR manualmente antes de construir.

Debes ver ocho contenedores: MySQL, Eureka, Gateway y cinco microservicios. El estado `Up` indica que el proceso está iniciado; las aplicaciones Java todavía pueden estar cargando. Revisa el arranque y comprueba las API:

```powershell
docker compose logs --tail 60 eureka api-gateway ms-ruta ms-equipamiento ms-usuario ms-reserva ms-pago
Invoke-RestMethod -Uri "http://localhost:8080/api/rutas" | ConvertTo-Json -Depth 8
Invoke-RestMethod -Uri "http://localhost:8080/api/equipamiento" | ConvertTo-Json -Depth 8
```

En Linux/macOS puedes consultar estas mismas direcciones con `curl` o desde el navegador. Una respuesta JSON válida demuestra que la API atiende la consulta.

Compose ordena el inicio mediante `depends_on`, pero no tiene comprobaciones de salud que esperen a la disponibilidad completa. Si un servicio se detuvo por arrancar antes de su dependencia, comprueba que MySQL y Eureka estén disponibles, revisa el error y reinicia las aplicaciones afectadas:

```powershell
docker compose restart api-gateway ms-usuario ms-equipamiento ms-ruta ms-reserva ms-pago
```

## 4. Instalar y configurar el frontend — terminal B

Abre una segunda terminal en la raíz del repositorio. No la abras dentro de `voyYvuelvo` para ejecutar este primer `cd`:

```powershell
cd frontend
npm ci
```

`npm ci` instala las versiones fijadas en `package-lock.json`. No se sube `node_modules` a GitHub: cada equipo instala sus dependencias con este comando.

Crea tu archivo local de entorno si aún no existe:

```powershell
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item -LiteralPath .env.example -Destination .env
}
```

En Linux/macOS, el equivalente para copiar la plantilla sin reemplazar un archivo existente es:

```sh
test -f .env || cp .env.example .env
```

Abre `frontend/.env` con tu editor y configura esta línea:

```dotenv
VITE_API_URL=http://localhost:8080
```

La plantilla deja la URL vacía para permitir la demostración local. **Para conectar los microservicios debes completar la dirección anterior.** Si el archivo ya contiene otras variables, consérvalas.

`.env` está ignorado por Git y cada persona debe crearlo. `.env.example` y `.env.test` sí se versionan. No cambies `.env.test`: mantiene aisladas las pruebas Vitest del backend real.

## 5. Iniciar y abrir la página

En la terminal B, dentro de `frontend`:

```powershell
npm run dev
```

Cuando aparezca `Local: http://127.0.0.1:5173/`, abre **[la página web](http://127.0.0.1:5173/)**. Deja esa terminal abierta mientras utilizas el proyecto.

| Dirección                                                                      | Qué encontrarás                                      |
| ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| [http://127.0.0.1:5173/](http://127.0.0.1:5173/)                               | Sitio React: esta es la vista previa de la página    |
| [http://127.0.0.1:5173/rutas/1](http://127.0.0.1:5173/rutas/1)                 | Reserva de la ruta 1, si ese ID existe en tu backend |
| [http://localhost:8080/api/rutas](http://localhost:8080/api/rutas)             | Datos JSON de rutas mediante el Gateway              |
| [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Documentación y pruebas de las API                   |
| [http://localhost:8761/](http://localhost:8761/)                               | Registro de servicios Eureka                         |

`http://localhost:8080/` no sirve la página React y su ruta raíz puede responder `401`. El Gateway está funcionando si las rutas `/api/...` responden correctamente. Para ver la aplicación utiliza `5173`.

Vite transforma los módulos JSX. No abras `index.html` directamente desde el explorador de archivos. Para usar Show Preview en VS Code, inicia Vite y abre la vista previa sobre `frontend/index.html`. Los antiguos accesos `.html` siguen funcionando mediante las redirecciones de React y los alias generados al compilar.

Si modificas `.env`, detén Vite con `Ctrl+C` y vuelve a ejecutar `npm run dev`.

## 6. Comprobar la conexión entre ambos proyectos

### Desde la interfaz

1. Abre la pantalla de una ruta disponible, por ejemplo `/rutas/1` en una base nueva.
2. Espera el mensaje **Datos consultados al servicio**.
3. En las herramientas de desarrollo del navegador, abre **Network / Red → Fetch/XHR** y recarga.
4. Comprueba HTTP `200` en `/api/rutas/1` y `/api/equipamiento/recomendacion/1`, ambas en el puerto `8080`.
5. Compara los datos recibidos con lo presentado en pantalla.

Si ves un mensaje de datos de demostración o de consulta fallida, revisa `.env`, los contenedores, los IDs y CORS antes de enviar una reserva. La portada puede abrir correctamente aunque el backend esté detenido.

### Comprobación automática real — terminal C

Mantén las terminales A y B como estaban. Abre una tercera terminal dentro de `frontend`:

```powershell
npm run test:integration
```

Este comando consulta las cinco API por el Gateway y sus puertos directos, revisa el registro en Eureka, la recomendación de equipamiento, CORS y la respuesta HTML de Vite. Usa la configuración de desarrollo y solicitudes reales.

Para comprobar también la escritura en los microservicios:

```powershell
npm run test:integration -- --write-test
```

La opción de escritura solo admite una API local. Crea registros propios temporales de equipamiento, usuario, reserva y pago pendiente, comprueba el total y el descuento de cupos, e intenta retirarlos en `finally` para restaurar la disponibilidad. Una ejecución completa termina con **12 comprobaciones aprobadas**. Si falla la conexión durante la limpieza, revisa el error y los registros de prueba antes de repetirla.

No se procesa un cobro real. La guía de [integración frontend–backend](frontend/docs/INTEGRACION-FRONTEND-BACKEND.md) explica cada llamada y sus límites.

## 7. Datos iniciales y alcance de la aplicación

En una base nueva, el backend carga tres rutas y siete equipamientos cuando sus tablas están vacías. Los datos de MySQL del equipo que publica el repositorio no se descargan con GitHub. Tampoco se copian sus usuarios, reservas, pagos ni los datos guardados en su navegador.

Las reservas pueden consultar y guardar datos en el backend. El registro y login de React, sus roles, la administración del catálogo, el carrito y el contacto de demostración continúan utilizando almacenamiento del navegador. Los contactos de reservas y las cuentas locales son modelos diferentes. Consulta el [alcance exacto de la integración](frontend/docs/INTEGRACION-FRONTEND-BACKEND.md#1-qué-funciones-están-conectadas).

Para probar el panel local:

| Perfil        | Correo             | Contraseña de demostración |
| ------------- | ------------------ | -------------------------- |
| Administrador | `admin@duoc.cl`    | `Demo2026!`                |
| Vendedor      | `vendedor@duoc.cl` | `Demo2026!`                |

Para un cliente, crea una cuenta desde `/registro` con datos de prueba. Estas cuentas son académicas y pertenecen al navegador actual.

## 8. Pruebas, compilación y producción local

Desde `frontend`:

```powershell
npm test
npm run check:architecture
npm run format:check
npm run build
```

- `npm test` ejecuta Vitest y React Testing Library con respuestas simuladas; no requiere Docker.
- `npm run test:coverage` ejecuta la misma suite y genera `coverage/index.html`.
- `npm run build` genera `dist/`; puedes servirlo después con `npm run preview` y abrir la dirección que imprima Vite.
- Un hosting de la SPA debe redirigir las rutas de React a `index.html` para que se puedan recargar direcciones como `/rutas/1`.

Para compilar Java sin Docker, instala JDK 21, configura `JAVA_HOME` y ejecuta desde `voyYvuelvo`:

```powershell
.\mvnw.cmd -DskipTests package
.\mvnw.cmd -pl services/ms-reserva "-Dtest=ReservaServiceTest" test
```

En Linux/macOS puedes invocar el wrapper con `sh ./mvnw`. El primer comando compila los siete módulos y omite la ejecución de las pruebas; el segundo ejecuta únicamente las cinco pruebas unitarias de reservas con JUnit y Mockito, sin MySQL.

Las pruebas `*ApplicationTests` cargan Spring y algunas requieren base de datos. El perfil `test` de reservas utiliza `create-drop` sobre su base configurada: no lo actives contra datos que quieras conservar.

La última verificación de la reorganización aprobó 99 pruebas del frontend, cinco pruebas unitarias de reservas, compilación de los siete módulos Java, construcción de las siete imágenes y las 12 comprobaciones de integración con escritura temporal. Esto no sustituye una revisión visual manual de todas las pantallas.

## 9. Detener y volver a iniciar

Para detener React, usa `Ctrl+C` en su terminal. Desde `voyYvuelvo`:

```powershell
docker compose stop
```

En el siguiente uso, con Docker iniciado:

```powershell
docker compose up -d
```

En otra terminal, desde `frontend`, ejecuta `npm run dev`. No necesitas repetir `npm ci` si no cambiaron las dependencias. Si cambió el código Java o los Dockerfile, utiliza `docker compose up -d --build` para actualizar las imágenes.

`docker compose down` retira los contenedores y la red conservando el volumen. No agregues `-v` si quieres conservar MySQL: esa opción elimina los volúmenes de Compose.

## 10. Problemas frecuentes

| Problema                                              | Qué comprobar                                                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| La vista previa de `8080` está vacía o responde `401` | Abre el sitio en `http://127.0.0.1:5173/`; `8080` es el Gateway                                                                            |
| `npm` no encuentra `package.json`                     | Ejecuta los comandos npm dentro de `frontend`                                                                                              |
| Compose no encuentra su configuración                 | Ejecuta Docker Compose dentro de `voyYvuelvo`                                                                                              |
| Docker no conecta al motor                            | Inicia Docker Desktop en modo Linux y comprueba `docker info`                                                                              |
| Un puerto está ocupado                                | Revisa otras aplicaciones o contenedores que utilicen los puertos indicados                                                                |
| Falla una descarga de Maven o de imágenes             | Revisa internet y repite la construcción; la caché Maven permite reutilizar dependencias                                                   |
| La portada abre, pero la reserva solo guarda borrador | Completa `VITE_API_URL` en `.env` y reinicia Vite                                                                                          |
| La reserva muestra datos de demostración              | Revisa Network, la disponibilidad de la API y que exista el ID solicitado                                                                  |
| El navegador bloquea CORS                             | Comprueba el origen y los encabezados del Gateway; consulta la guía técnica                                                                |
| El envío de reserva falla                             | Revisa la respuesta y consulta reservas, cupos y pagos antes de repetirlo; no hay una transacción distribuida que revierta todos los pasos |
| Los datos nuevos del catálogo inicial no aparecen     | El navegador puede conservar un catálogo local; consulta el manual antes de retirar datos guardados                                        |

## 11. Actualizar GitHub manualmente en main

Estos comandos los ejecuta quien publica el proyecto. Parte de la raíz del repositorio, donde está este README, y revisa cada salida antes de avanzar.

Primero comprueba tu rama y tus archivos:

```powershell
git status
git branch --show-current
git switch main
```

Incluye tanto los archivos nuevos como las modificaciones y eliminaciones de la reorganización:

```powershell
git add -A -- README.md frontend voyYvuelvo
git diff --cached --stat
git diff --cached --name-only
git diff --cached --check
```

Verifica que estén las carpetas nuevas `voyYvuelvo/services`, `voyYvuelvo/infrastructure`, el wrapper compartido y los documentos. `.env`, `node_modules`, `target`, `dist`, `coverage` y los temporales no deben formar parte del commit; las plantillas `.env.example` y `.env.test` del frontend sí deben incluirse.

Cuando hayas revisado el contenido:

```powershell
git commit -m "Organiza proyecto y documenta inicio e integracion"
git pull --rebase origin main
git push origin main
git status -sb
git log -1 --oneline
```

Si `pull --rebase` presenta conflictos, resuélvelos y termina el rebase antes de hacer push. Puedes cancelar ese rebase con `git rebase --abort` y revisar la situación manteniendo tu commit local. No utilices un push forzado como solución automática.

El push requiere acceso de escritura al repositorio y autenticación con tu cuenta. Después revisa en GitHub la rama `main`, el último commit y los enlaces de esta documentación.
