# Frontend de Voy y Vuelvo

Interfaz React con Vite. El frontend también se compila y sirve con Nginx en su propio contenedor. Consulta la [guía de Docker](docs/DOCKER.md) para iniciar toda la aplicación sin instalar Node ni Java en el equipo. El [README del proyecto](../README.md) explica la clave JWT y el desarrollo local.

## Inicio con Docker

Con Docker Desktop iniciado y `voyYvuelvo/.env` configurado con `JWT_SECRET_BASE64`, ejecuta desde la carpeta `voyYvuelvo`:

```powershell
docker compose up -d --build
docker compose ps
```

Abre [la web](http://127.0.0.1:5173). Nginx sirve React y reenvía `/backend/` al Gateway por la red interna de Docker. La imagen usa `VITE_API_URL=/backend`; no necesita el `.env` local del frontend. La base conserva su volumen y los servicios esperan a que MySQL esté disponible.

Si vas a ejecutar Vite en el mismo puerto para desarrollar, detén primero el contenedor web con `docker compose stop frontend` desde `voyYvuelvo`.

## Inicio con Vite para desarrollo

Desde esta carpeta, instala con `npm ci`. Copia `.env.example` como `.env` solo si no existe, establece `VITE_API_URL=http://localhost:8080` y ejecuta `npm run dev`. Abre [la web](http://127.0.0.1:5173). Reinicia Vite al cambiar variables de entorno.

El backend debe estar iniciado y configurado según la guía principal. Con la URL vacía se mantienen funciones locales, pero no se puede registrar una cuenta, iniciar sesión ni crear reservas reales.

## Responsabilidades

- `src/components/`: átomos, moléculas, organismos y plantillas.
- `src/pages/`: pantallas públicas y administrativas.
- `src/services/`: peticiones HTTP, login, registro y almacenamiento local.
- `src/routes/legacy.js`: URL HTML anteriores conservadas por el router y el build.
- `src/styles/`: estilos y tokens comunes. `public/img/`: imágenes utilizadas.
- `src/test/`: pruebas de componentes y lógica.
- `scripts/`: comprobación de arquitectura, integración y aliases de HTML.

El login usa JWT del backend. La sesión se guarda en memoria y se pierde al recargar. El registro público crea una cuenta `CLIENTE` y un perfil remoto. El editor administrativo de usuarios locales y los productos locales son demostraciones independientes de las cuentas de MySQL.

## Comandos

```powershell
npm run dev
npm run check:architecture
npm test -- --maxWorkers=1
npm run build
npm run preview -- --host 127.0.0.1
```

Con el backend y el frontend disponibles, `npm run test:integration` comprueba consultas públicas y protección de recursos sin escribir datos de negocio. Para verificar el proxy Docker establece `$env:INTEGRATION_API_URL='http://127.0.0.1:5173/backend'` antes del comando y elimina esa variable al terminar. Opcionalmente acepta `INTEGRATION_TOKEN`, o `INTEGRATION_USERNAME` junto con `INTEGRATION_PASSWORD`, como variables del proceso para verificar acceso autenticado. La segunda alternativa solicita un token mediante login. No imprimas ni publiques estos valores. `--write-test` ya no está disponible.

`npm run format:check` revisa el estilo del código. `npm run test:coverage` genera cobertura de las pruebas locales; no comprueba los contenedores.

## Guías

- [Instalación y verificación](docs/GUIA-INICIO-Y-VERIFICACION.md).
- [Frontend, backend y MySQL con Docker](docs/DOCKER.md).
- [Conexión: referencia rápida](docs/CONEXION-BACKEND.md).
- [Integración detallada, JWT y reservas](docs/INTEGRACION-FRONTEND-BACKEND.md).
- [Atomic Design](docs/ATOMIC-DESIGN.md).
- [Recorrido de revisión](docs/RECORRIDO-DE-REVISION.md).

Los requisitos de [EP2](docs/requisitos/ERS-EP2.md), [EP1](docs/requisitos/ERS-EP1-HISTORICA.md) y el documento Word de requisitos se mantienen como antecedentes históricos. La documentación actual está en las guías anteriores.
