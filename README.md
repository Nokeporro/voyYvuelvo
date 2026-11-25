# Voy y Vuelvo

Aplicación académica de turismo: interfaz React y backend Java con microservicios, MySQL y autenticación JWT. Documentación actualizada el 21 de noviembre de 2026 para el flujo de EP3.

## Requisitos

- Docker Desktop iniciado, con Docker Compose y contenedores Linux.
- Node.js 22.12 o superior compatible con Vite 8, y npm. Se recomienda Node 24.
- Puertos disponibles: 5173 (web), 8080 (API), 8761 (registro Eureka) y 3306 (MySQL).
- Java 21 solo si vas a compilar Java fuera de Docker. Maven Wrapper está incluido.

## Inicio paso a paso en Windows

Descarga el repositorio completo y abre una terminal PowerShell en la carpeta que contiene `frontend` y `voyYvuelvo`. Los comandos siguientes parten de esa carpeta.

### 1. Configurar la clave del backend

```powershell
Set-Location voyYvuelvo
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Copia la clave generada y edita `.env` para dejar `JWT_SECRET_BASE64=tu_clave_generada`, sin espacios ni comillas. Ejecuta la copia solo en la primera instalación: si ya tienes `.env`, conserva su contenido. No publiques este archivo ni reutilices una clave de ejemplo. La plantilla se puede publicar porque no contiene una clave real.

Compose exige esta variable antes de iniciar cualquier servicio. El Gateway decodifica Base64 y requiere al menos 32 bytes. Cambiar la clave invalida los tokens emitidos con la anterior.

### 2. Iniciar el backend

Desde `voyYvuelvo`:

```powershell
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail 80 api-gateway
```

La primera compilación descarga dependencias y puede tardar varios minutos. `depends_on` establece el orden de inicio, pero no garantiza que MySQL ya acepte conexiones. Si un servicio termina mientras la base arranca, revisa sus registros y vuelve a ejecutar `docker compose up -d`.

Abre [Eureka](http://localhost:8761). Deben registrarse el Gateway y los cinco microservicios como `UP`. Prueba el catálogo público en [rutas](http://localhost:8080/api/rutas). Puede devolver JSON con estructura HAL; eso es normal.

### 3. Configurar e iniciar el frontend

En otra terminal, desde la carpeta del repositorio:

```powershell
Set-Location frontend
npm ci
Copy-Item .env.example .env
```

Edita `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:8080
```

Si ya existe el archivo, edítalo sin sobrescribir otras configuraciones. Revisa también `.env.local`, `.env.development` y `.env.development.local` si existen: las variables específicas del modo pueden prevalecer sobre `.env`. No pongas la clave JWT del backend en ninguna variable `VITE_`: esas variables se incluyen en el navegador.

```powershell
npm run dev
```

Abre [la aplicación](http://127.0.0.1:5173). Reinicia Vite después de cambiar sus variables. El puerto **8080 sirve una API**, no la página web: que su raíz no muestre la interfaz no significa que el frontend esté fallando.

### 4. Crear una cuenta y verificar una reserva

1. Abre `/registro` y crea una cuenta con un nombre de usuario nuevo y datos propios de prueba.
2. El registro crea la cuenta, obtiene un JWT temporal y vincula el perfil personal. Si termina correctamente, inicia sesión desde `/login`.
3. Entra a una ruta con cupos, completa una fecha futura y los datos solicitados, y confirma la reserva.
4. Esta acción **sí crea datos** y consume cupos. Usa una base de desarrollo para las pruebas manuales.

El registro público siempre asigna `CLIENTE`. No hay una cuenta administrativa de demostración garantizada en MySQL. El panel conserva un editor de usuarios locales de demostración separado de las cuentas reales; modificarlo no cambia el acceso al backend. Consulta [la guía del backend](voyYvuelvo/docs/GUIA-BACKEND.md) para habilitar un administrador en un entorno local controlado.

La sesión actual vive en memoria: al recargar o cerrar la pestaña hay que iniciar sesión de nuevo. El JWT dura una hora y no hay renovación automática. Una cuenta creada cuyo perfil no llegó a vincularse necesita recuperación; repetir el registro con el mismo usuario producirá conflicto.

## Comprobaciones

Desde `frontend`:

```powershell
npm run check:architecture
npm test -- --maxWorkers=1
npm run build
npm run test:integration
```

Las tres primeras comprobaciones no necesitan Docker. La última necesita el backend y Vite iniciados: consulta catálogos, Eureka, CORS y bloqueos de acceso sin token. No crea ni borra datos; el antiguo argumento `--write-test` se retiró. Para verificar también un acceso autenticado se puede proporcionar `INTEGRATION_TOKEN` mediante el entorno. No compartas el token ni lo guardes en el repositorio. Consulta [el recorrido de revisión](frontend/docs/RECORRIDO-DE-REVISION.md).

Las pruebas de React usan respuestas simuladas: no demuestran por sí solas que MySQL y los contenedores estén funcionando. `npm run format:check` comprueba estilo; una advertencia de formato no equivale a una prueba funcional fallida.

Para revisar la compilación web:

```powershell
npm run preview -- --host 127.0.0.1
```

Abre la dirección que muestre Vite, normalmente el puerto 4173. Las URL antiguas terminadas en `.html` se conservan mediante aliases generados desde la aplicación React.

## Detener y conservar los datos

Desde `voyYvuelvo`:

```powershell
docker compose down
```

El volumen `mysql_data` conserva las bases. No uses `down -v` si necesitas mantener cuentas, reservas y pagos. MySQL se configura localmente sin contraseña de root: esta configuración está destinada al desarrollo académico y requiere adaptación antes de publicar servicios en Internet.

## Qué persiste y dónde

| Información                                                                | Persistencia actual                      |
| -------------------------------------------------------------------------- | ---------------------------------------- |
| Cuentas, roles y vínculo al perfil                                         | MySQL del Gateway                        |
| Perfiles, rutas, equipamiento, reservas y pagos                            | MySQL de cada microservicio              |
| Sesión y JWT del navegador                                                 | Memoria de React; se pierden al recargar |
| Carrito, catálogo de productos local y usuarios del editor de demostración | Almacenamiento local del navegador       |
| Mensajes del formulario de contacto                                        | Almacenamiento local; no se envía correo |

Con `VITE_API_URL` vacío hay funciones locales de demostración, pero no registro, login ni reservas reales. La confirmación de pago del backend representa un cambio de estado; no hay una pasarela bancaria integrada.

## Organización y documentación

```text
frontend/                    React, estilos, imágenes, pruebas y documentación web
  src/components/            Atomic Design
  src/services/              HTTP, autenticación y persistencia local
  src/routes/                Compatibilidad de URL antiguas
  scripts/                   Comprobaciones y generación de aliases
voyYvuelvo/
  infrastructure/            Gateway y Eureka
  services/                  Cinco microservicios de dominio
  docs/                      Guía técnica del backend y entregas históricas
```

- [Frontend](frontend/README.md).
- [Backend](voyYvuelvo/README.md).
- [Integración detallada de frontend y backend](frontend/docs/INTEGRACION-FRONTEND-BACKEND.md).
- [Atomic Design](frontend/docs/ATOMIC-DESIGN.md).
- [Recorrido para verificar la aplicación](frontend/docs/RECORRIDO-DE-REVISION.md).
- [Requisitos históricos de EP2](frontend/docs/requisitos/ERS-EP2.md) y [EP1](frontend/docs/requisitos/ERS-EP1-HISTORICA.md).

Los documentos Word/PDF de entregas anteriores se conservan como antecedentes. Pueden describir comportamientos anteriores; para iniciar el proyecto y entender JWT usa las guías actuales enlazadas aquí.

## Problemas habituales

| Síntoma                                     | Revisión                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Compose exige `JWT_SECRET_BASE64`           | Crear y completar `voyYvuelvo/.env` antes de ejecutar Compose                                |
| 8080 no muestra una página                  | Abrir la web en 5173 y probar `/api/rutas` en 8080                                           |
| Error de conexión                           | Revisar `docker compose ps`, registros, `VITE_API_URL` y reiniciar Vite                      |
| HTTP 401                                    | Iniciar sesión; el token puede haber expirado o haberse perdido al recargar                  |
| HTTP 403                                    | La cuenta no tiene el rol necesario para ese recurso                                         |
| HTTP 409 al reservar                        | Revisar perfil vinculado, cupos y reservas duplicadas; consultar registros                   |
| Login funciona pero no hay perfil           | La creación de cuenta y perfil son pasos separados; requiere recuperación del perfil         |
| CORS                                        | Usar localhost o 127.0.0.1 en el puerto 5173; otros orígenes requieren configurar el Gateway |
| Un puerto interno no responde desde Windows | Los microservicios no publican 8081, 8083, 8084, 8085 ni 8086; entrar por 8080               |
