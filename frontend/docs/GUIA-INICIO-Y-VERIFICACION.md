# Guía para descargar iniciar y verificar Voy y Vuelvo

Actualizada el 12 de noviembre de 2026. Instrucciones para PowerShell en Windows.

El [README principal](../../README.md) contiene el recorrido de instalación desde cero. La [guía técnica de integración](INTEGRACION-FRONTEND-BACKEND.md) explica cómo se comunican los componentes y qué métodos utilizan.

Esta guía permite descargar el proyecto, iniciar los microservicios y la página, verificar la comunicación entre ambos y ejecutar las pruebas. Sigue los comandos de uno en uno y comprueba el resultado antes de avanzar. No copies el indicador `PS C:\...>` ni los símbolos `>>` de la terminal.

## 1 Descargar el proyecto desde GitHub

Necesitas Git instalado. Abre una terminal en la carpeta donde quieras guardar el proyecto. Por ejemplo, desde Documentos:

```powershell
cd "$env:USERPROFILE\Documents"
git clone --branch main https://github.com/Nokeporro/voyYvuelvo.git voy-vuelvo
cd voy-vuelvo
Get-ChildItem
```

`git clone` descarga los archivos y el historial publicados en GitHub. Si el repositorio es privado, necesitas acceso y autenticarte. No clones encima de otra carpeta existente con el mismo nombre.

La estructura esperada para trabajar con ambos componentes es:

```text
voy-vuelvo/                 Raíz del repositorio descargado
  frontend/                 React, Vite y Vitest
    package.json
  voyYvuelvo/               Backend Spring Boot con microservicios
    docker-compose.yml
```

Comprueba que tienes ambos:

```powershell
Test-Path .\frontend\package.json
Test-Path .\voyYvuelvo\docker-compose.yml
```

Ambos deben devolver `True`. Si alguno devuelve `False`, revisa la carpeta y la rama descargada: solo se recibe lo que el equipo haya publicado. No continúes con rutas que no existen.

En el equipo de desarrollo, la ubicación encontrada al actualizar esta guía es:

```text
C:\Users\nokep\Documents\1_PROYECTOS_code\HTML_PROYECTS\Fullstack2
```

Dentro están `frontend` y `voyYvuelvo`. La antigua ruta `C:\Users\nokep\Documents\1_PROYECTOS_code\backend\voyYvuelvo` ya no se encontró en esta revisión. No mezcles copias de carpetas diferentes.

### Si ya tienes una copia descargada

Desde la raíz Git, revisa primero tu trabajo:

```powershell
git status
git branch --show-current
```

Con el trabajo local guardado y sin una fusión pendiente:

```powershell
git switch main
git pull --ff-only origin main
```

Si aparecen cambios propios, conflictos o errores, resuélvelos antes de continuar. `git pull` no instala dependencias npm ni recrea imágenes Docker automáticamente.

## 2 Preparar las herramientas

Instala Git, Node.js con npm y Docker Desktop. Se verificó anteriormente el frontend con Node 24; usa esa versión para reproducir el entorno. Docker Desktop debe utilizar contenedores Linux y estar iniciado.

```powershell
git --version
node --version
npm --version
docker --version
docker compose version
docker info
```

`docker info` debe mostrar un servidor disponible. Si informa que no puede conectar con el motor, abre Docker Desktop y espera a que termine de iniciar.

No necesitas Maven ni Java instalados en Windows para levantar el backend mediante los Dockerfile del proyecto. Para ejecutar pruebas Java locales sí necesitas JDK 21 y la configuración correspondiente.

## 3 Organizar las terminales

Abre VS Code en la raíz del proyecto o en `frontend`. Usa las terminales así:

| Terminal | Carpeta | Uso |
| --- | --- | --- |
| A | `voyYvuelvo` | Docker, estado y logs del backend |
| B | `frontend` | Servidor Vite; dejarlo abierto |
| C | `frontend` | Pruebas, cobertura y compilación |

Los comandos `npm ...` deben ejecutarse donde está `package.json`. Los comandos `docker compose ...` deben ejecutarse donde está `docker-compose.yml`.

Las siguientes secciones parten de la raíz descargada `voy-vuelvo`. Si usas la copia del equipo de desarrollo, sustituye la raíz por `Fullstack2`. No ejecutes `cd frontend` si ya estás dentro de `frontend`.

## 4 Iniciar el backend

En la terminal A, desde la raíz del repositorio:

```powershell
cd .\voyYvuelvo
docker compose up -d mysql
docker compose logs --tail 40 mysql
```

Espera que MySQL termine de arrancar y muestre `ready for connections`. Luego ejecuta:

```powershell
docker compose up -d --build
docker compose ps
```

La primera construcción descarga imágenes y dependencias y puede tardar varios minutos. La opción `-d` deja los contenedores en segundo plano. La opción `--build` reconstruye las imágenes cuando corresponde.

| Servicio | Puerto publicado |
| --- | --- |
| MySQL | 3306 |
| Eureka | 8761 |
| Gateway | 8080 |
| Usuarios | 8084 |
| Equipamiento | 8081 |
| Rutas | 8086 |
| Reservas | 8083 |
| Pagos | 8085 |

El Compose debe mostrar sus servicios en ejecución. `Up` indica que un contenedor está encendido, pero debes comprobar también las respuestas HTTP: `depends_on` no garantiza que todas las dependencias estén listas.

Si hay fallos de arranque:

```powershell
docker compose logs --tail 80 api-gateway ms-ruta ms-reserva
```

Si los logs muestran que una aplicación falló porque MySQL o Eureka aún no estaban disponibles, espera a que estén listos y reinicia las aplicaciones afectadas:

```powershell
docker compose restart api-gateway ms-usuario ms-equipamiento ms-ruta ms-reserva ms-pago
```

Comprueba después los logs y los endpoints; no uses el reinicio como sustituto de revisar un error de configuración.

## 5 Comprobar el backend antes de abrir React

En una terminal libre, ejecuta:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/rutas" | ConvertTo-Json -Depth 8
Invoke-RestMethod -Uri "http://localhost:8080/api/equipamiento" | ConvertTo-Json -Depth 8
Invoke-RestMethod -Uri "http://localhost:8080/api/reservas" | ConvertTo-Json -Depth 8
```

También puedes abrir estos enlaces en el navegador:

- Rutas: <http://localhost:8080/api/rutas>
- Equipamiento: <http://localhost:8080/api/equipamiento>
- Reservas: <http://localhost:8080/api/reservas>
- Eureka: <http://localhost:8761>

Las APIs muestran JSON, no la página visual. Una lista `[]` significa que la consulta respondió sin registros. No es un error y tampoco demuestra que React haya enviado una reserva.

Para la demostración de la ruta 1 deben responder también:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/rutas/1" | ConvertTo-Json -Depth 8
Invoke-RestMethod -Uri "http://localhost:8080/api/equipamiento/recomendacion/1" | ConvertTo-Json -Depth 8
```

En una base nueva, el arranque de los servicios carga tres rutas y siete equipamientos cuando sus tablas están vacías. Clonar el código no descarga la base MySQL del otro equipo ni sus reservas. Si reutilizas una base existente cuyos IDs fueron modificados, comprueba qué rutas hay: el ID 1 no está garantizado para todas las bases y el listado actual de React parte de su catálogo local.

## 6 Configurar el frontend para conectarse

En la terminal B, desde la raíz del repositorio:

```powershell
cd .\frontend
npm ci
```

Espera a que termine sin errores. `npm ci` instala las versiones exactas del lockfile; no necesitas ejecutarlo en cada arranque, solo en la primera instalación o cuando cambian las dependencias.

Comprueba si existe tu configuración local:

```powershell
Test-Path .env
```

Si devuelve `False`, crea el archivo con la dirección de tu Gateway:

```powershell
Set-Content -LiteralPath .env -Value 'VITE_API_URL=http://localhost:8080' -Encoding utf8
```

Si ya existe, ábrelo y comprueba que incluya esa línea, conservando otras variables que necesites. No ejecutes `Set-Content` sobre un archivo con configuración que quieras conservar, porque reemplaza su contenido.

`.env` está ignorado por Git: cada compañero debe crearlo. `.env.example` es una plantilla y no activa por sí sola la conexión. `.env.test` mantiene `VITE_API_URL` vacía para la suite simulada; no cambies ese valor para probar la integración real.

## 7 Abrir la página

En la terminal B:

```powershell
npm run dev
```

Cuando aparezca `Local: http://127.0.0.1:5173/`, abre:

**<http://127.0.0.1:5173/>**

La terminal no abre necesariamente un navegador de forma automática. Puedes pulsar el enlace o copiarlo. Déjala abierta mientras uses la aplicación.

| Dirección | Qué muestra |
| --- | --- |
| `http://127.0.0.1:5173/` | Sitio React |
| `http://localhost:8080/api/...` | Datos JSON del backend |
| `http://localhost:8761/` | Panel de Eureka |

`http://localhost:8080/` no es la portada del sitio. Si modificas `.env`, detén Vite con Ctrl+C y vuelve a ejecutar `npm run dev`.

Para Show Preview en VS Code, inicia primero Vite y luego usa Show Preview sobre `index.html`. La entrada del proyecto redirige al puerto 5173.

## 8 Verificar que React recibe datos del backend

1. Mantén Docker y Vite ejecutándose.
2. Abre <http://127.0.0.1:5173/rutas/1>.
3. Espera el mensaje **Datos consultados al servicio**.
4. Abre las herramientas de desarrollo del navegador con F12 o Ctrl+Shift+I.
5. Entra en **Network** o **Red** y selecciona Fetch/XHR.
6. Recarga la página para capturar las consultas.
7. Localiza `http://localhost:8080/api/rutas/1` y `http://localhost:8080/api/equipamiento/recomendacion/1`.
8. Comprueba estado **200** y revisa la pestaña **Response** o **Respuesta** para ver el JSON.
9. Compara el nombre, precio y equipamiento mostrado con esas respuestas. Los valores pueden cambiar con los datos del backend.

Estas señales juntas demuestran que React está recibiendo datos del Gateway. Abrir directamente la API solo verifica el backend; abrir la portada solo verifica que la interfaz carga.

Si aparece **No pudimos consultar el servicio. Mostramos datos de demostración**, la consulta falló. No interpretes esos datos como cupos confirmados ni continúes el envío hasta resolver el problema. Revisa el estado de Network, `.env`, los IDs y los contenedores.

El navegador integrado puede tener un acceso diferente a las herramientas de desarrollo. Si no ofrece F12, abre la misma URL en Chrome o Edge para seguir este procedimiento.

## 9 Verificar que una reserva se guarda

Esta es una prueba manual con efectos reales: crea datos, descuenta cupos y activa la coordinación de pagos. Utiliza datos académicos y una ruta con disponibilidad. No repitas el envío mientras esperas una respuesta.

### Antes del envío

1. Consulta <http://localhost:8080/api/reservas> y anota los IDs existentes.
2. Consulta <http://localhost:8080/api/rutas/1> y anota `cupoMaximo`.
3. En React, comprueba que aparece el mensaje de datos consultados al servicio.
4. En Network, activa **Preserve log** o **Conservar registro** si está disponible.

### Enviar desde la página

1. Completa nombre, correo de prueba y teléfono válido; por ejemplo `Ana Prueba`, `ana.prueba@example.com`, `+56912345678`.
2. Elige una fecha futura y una persona, siempre que exista al menos un cupo.
3. Selecciona solo equipamiento disponible, o deja la selección vacía para comprobar primero la reserva sin arriendo.
4. Pulsa **Confirmar reserva** una vez.
5. En Network comprueba las consultas de usuarios y el POST a `/api/reservas`. Si el contacto no existía, también habrá un POST a `/api/usuarios`.
6. El POST de reserva debe responder **201** y devolver un objeto con `id`.
7. React debe mostrar **Reserva #... creada** y el estado de pago devuelto.

Un mensaje **Borrador guardado** no significa que la reserva se haya guardado en MySQL. Si no aparece el POST, comprueba que el formulario no tenga errores y que `.env` esté cargado.

### Confirmar desde el backend

Recarga <http://localhost:8080/api/reservas>. Debe aparecer el mismo ID. Para comprobar un registro concreto, sustituye `123` por el ID recibido:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/reservas/123" | ConvertTo-Json -Depth 8
```

Comprueba `rutaId`, `cantidadPersonas`, `fechaReserva` y `equipamientos`. Verifica también el cupo de la ruta y el pago asociado en <http://localhost:8080/api/pagos>. El estado `PROCESANDO` o `PENDIENTE` no equivale a un pago cobrado.

Si ya existe una reserva para el mismo usuario y ruta, el backend la rechaza, aunque elijas otra fecha: esa es la regla actual. No repitas el envío como solución a un error.

Si el POST falla, consulta primero reservas, cupos y pagos antes de volver a intentar. La coordinación actual entre microservicios no es una transacción atómica: un error en un servicio posterior podría dejar un registro creado o un cupo descontado. Conserva el mensaje y consulta los logs:

```powershell
docker compose logs --tail 100 ms-reserva ms-ruta ms-pago ms-usuario
```

Ejecuta ese comando desde `voyYvuelvo`. Esta guía no borra reservas ni restablece cupos automáticamente.

## 10 Qué está conectado y qué sigue local

| Función | Situación actual |
| --- | --- |
| Consulta real de una ruta en la reserva | Backend mediante Gateway |
| Equipamiento recomendado de la reserva | Backend mediante Gateway |
| Contacto y envío de reserva | Implementado contra el backend; verificar con el procedimiento anterior |
| Listado inicial de rutas | Datos locales del frontend |
| Registro con RUT o pasaporte | Almacenamiento local del navegador |
| Login y roles de la interfaz | Almacenamiento local del navegador |
| Catálogo, administración y carrito | Estado React y almacenamiento local |
| Formulario de contacto | Simulación local; no envía correo |
| Pagos en la web | Sin pantalla de pago integrada; el backend coordina el pago de reservas |

Las cuentas locales no se convierten automáticamente en las cuentas de autenticación del Gateway. Un compañero no recibe tu localStorage al clonar el proyecto. Las rutas remotas deben coincidir con los IDs admitidos por la pantalla actual, que usa los datos locales como base.

## 11 Ejecutar las pruebas del frontend

En la terminal C, dentro de `frontend`, ejecuta los comandos de uno en uno. No necesitas Docker ni Vite para las pruebas simuladas de Vitest.

### Suite completa

```powershell
npm test
```

La última ejecución verificada antes de esta guía aprobó **97 pruebas en 8 archivos**. Comprueba el resultado de tu propia ejecución: los números pueden cambiar al modificar código.

### Un archivo o un caso específico

```powershell
npm test -- src/test/cart.test.js
```

```powershell
npm test -- src/test/cart.test.js -t "calcula el descuento y el total en CLP"
```

`--` pasa argumentos a Vitest. `-t` filtra por el nombre del caso. Los casos omitidos por el filtro no son fallos.

### Modo continuo

```powershell
npm run test:watch
```

Guarda un cambio y observa la repetición. Sal con `q` o Ctrl+C.

### Cobertura

```powershell
npm run test:coverage
Start-Process .\coverage\index.html
```

El primer comando ejecuta los tests y genera el reporte; el segundo lo abre. Consulta también `coverage/coverage-summary.json`. Las métricas muestran sentencias, ramas, funciones y líneas alcanzadas, no el porcentaje de requisitos cumplidos.

La última cobertura documentada fue 88,88 % de líneas; es una referencia histórica, no una nueva medición de esta guía. Vuelve a generarla para obtener el dato actual.

### Arquitectura formato y compilación

```powershell
npm run check:architecture
npm run format:check
npm run build
```

El comprobador revisa reglas Atomic Design y ciclos. Prettier revisa formato. El build genera `dist/`. Para visualizar esa compilación:

```powershell
npm run preview
```

Abre la URL que indique esa terminal, habitualmente el puerto 4173. Esta vista usa el build existente: si cambias código, vuelve a compilar. No reemplaza la verificación del entorno de desarrollo ni los permisos CORS de un origen diferente.

`npm run format` modifica el formato de los archivos; úsalo solo si quieres aplicar los cambios que `format:check` detectó.

## 12 Dónde están las pruebas y la configuración

| Archivo dentro de frontend | Qué comprueba |
| --- | --- |
| `src/test/validation.test.js` | RUT, pasaporte, correo, registro, fechas y cupos |
| `src/test/cart.test.js` | Cantidades, stock, descuento y totales |
| `src/test/services.test.js` | Persistencia, cuentas y peticiones HTTP simuladas |
| `src/test/components.test.jsx` | Formularios, filtros, carrito, navegación y borrador |
| `src/test/admin.test.jsx` | Acceso, roles y operaciones administrativas |
| `src/test/pages.test.jsx` | Páginas editoriales y búsqueda |
| `src/test/preview.test.js` | Compatibilidad de Show Preview |
| `src/test/atomic-design.test.jsx` | Componentes base y reglas de arquitectura |
| `src/test/setup.js` | Preparación y limpieza del entorno de pruebas |
| `vite.config.js` | Configuración de Vite y Vitest con jsdom y cobertura V8 |
| `.env.test` | Configuración de API vacía para el modo de pruebas |

Vitest reemplaza Jasmine y Karma en este proyecto. Testing Library monta componentes y simula interacciones. Las pruebas HTTP utilizan mocks y no prueban por sí mismas la conexión real a MySQL. La suite contiene pruebas unitarias y pruebas de integración local entre componentes.

El código de conexión se encuentra en `src/services/api.js`; la pantalla que lo consume, en `src/pages/Reservation.jsx`; su formulario, en `src/components/organisms/ReservationForm.jsx`.

## 13 Prueba unitaria opcional del backend

Esta sección es independiente de Vitest. Requiere JDK 21; Maven Wrapper descarga Maven si hace falta. Desde la raíz del repositorio:

```powershell
cd .\voyYvuelvo\services\ms-reserva
..\..\mvnw.cmd "-Dtest=ReservaServiceTest" test
```

Ejecuta únicamente la clase `src/test/java/com/voy/velvo/ms_reserva/service/ReservaServiceTest.java`. Utiliza JUnit y Mockito; no equivale a probar los siete contenedores completos. Comprueba `BUILD SUCCESS` y el resumen de tests.

No actives otros perfiles de prueba ni ejecutes indiscriminadamente toda la suite contra una base con datos que quieras conservar: el README del backend advierte que el perfil `test` de reservas configura `create-drop`. La construcción Docker omite pruebas y no demuestra que hayan pasado.

## 14 Fallos frecuentes y cómo seguir

| Síntoma | Qué revisar |
| --- | --- |
| Abro 8080 y no veo la página | El sitio está en 5173; 8080 es el Gateway |
| La API devuelve `[]` | No hay registros; comprueba datos antes de reservar |
| HTTP 404 al consultar ruta | ID inexistente o ruta del Gateway incorrecta |
| HTTP 502 o 503 | Microservicio no disponible o arranque incompleto |
| Error de CORS | Revisa origen, puerto y encabezados en Network; no desactives la protección del navegador |
| Aparece guardar borrador | `.env` ausente/vacío o Vite sin reiniciar |
| Aparecen datos de demostración | Falló la carga remota; revisa las solicitudes 8080 |
| EPERM al instalar npm | Un proceso puede tener Rolldown abierto; detén Vite y tests antes de reinstalar |
| Vite o Vitest no se reconoce | Termina `npm ci` correctamente en `frontend` |
| Puerto 5173 ocupado | Detén la instancia anterior; Vite usa puerto estricto |
| El compañero no ve mis cuentas | Son locales al navegador; no se comparten por Git |

Si persiste EPERM, cierra VS Code y vuelve a instalar desde PowerShell. Si hace falta, reinicia el equipo y ejecuta `npm ci` antes de iniciar Vite. No borres el lockfile para solucionar un bloqueo de archivo.

## 15 Detener y volver a iniciar

Para detener React, Ctrl+C en la terminal Vite. Para detener el backend conservando los contenedores, desde `voyYvuelvo`:

```powershell
docker compose stop
```

Para volver a trabajar con la configuración existente:

```powershell
docker compose up -d
```

Después, desde `frontend`, ejecuta `npm run dev`. No necesitas clonar otra vez ni ejecutar `npm ci` en cada sesión. Si cambió el código Java, reconstruye con `docker compose up -d --build`.

MySQL guarda sus datos en el volumen `mysql_data`. No uses `docker compose down -v` para apagar una sesión que quieras conservar: elimina los volúmenes del proyecto.

## 16 Lista de comprobación para una presentación

- [ ] Se descargó la rama correcta y existen `frontend` y `voyYvuelvo`.
- [ ] Docker Desktop está iniciado y los servicios responden por el Gateway.
- [ ] Hay datos reales de rutas y equipamiento y se conocen sus IDs.
- [ ] `npm ci` terminó sin errores.
- [ ] `.env` define la URL local del Gateway y Vite se reinició después de configurarla.
- [ ] La página abre en 5173.
- [ ] La reserva muestra datos consultados al servicio y Network confirma HTTP 200.
- [ ] Un envío controlado devuelve ID y ese ID aparece en la API de reservas.
- [ ] Se revisó la coherencia de cupos y pago asociado tras el envío.
- [ ] Vitest, arquitectura y build se ejecutaron y se revisaron sus resultados.
- [ ] Se distingue el flujo conectado de las funciones todavía locales.

Esta guía reúne instrucciones reproducibles; escribirla no crea reservas ni certifica una nueva ejecución completa. Conserva como evidencia la salida de tus pruebas y las respuestas de tu propia verificación manual.
