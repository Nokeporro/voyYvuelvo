# Backend de Voy y Vuelvo

Java 25, Spring Boot, Spring Cloud Gateway, Eureka y MySQL. Actualizado para autenticación JWT de EP3 el 21 de noviembre de 2026.

La [instalación completa](../README.md) explica los pasos desde una descarga limpia. Antes de usar Compose copia `.env.example` como `.env` y configura `JWT_SECRET_BASE64` con al menos 32 bytes aleatorios codificados en Base64. No sobrescribas un `.env` existente ni publiques la clave real.

Desde esta carpeta:

```powershell
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail 80 api-gateway
```

El Gateway publica 8080; Eureka 8761 y MySQL 3306. Los cinco microservicios son accesibles internamente en Docker y no publican sus puertos en el equipo anfitrión. Consulta el catálogo público en [rutas](http://localhost:8080/api/rutas) y el registro en [Eureka](http://localhost:8761).

El mismo Compose inicia el frontend React en un contenedor Nginx independiente: abre [la web](http://127.0.0.1:5173). Su contexto de compilación es `../frontend`, por lo que ambas carpetas deben estar presentes. No hace falta iniciar Vite para usar la aplicación en Docker. Los servicios esperan a que el chequeo de MySQL indique que está disponible. Consulta la [guía de Docker](../frontend/docs/DOCKER.md) para verificar el proxy y desarrollar con Vite.

```text
infrastructure/api-gateway/     Autenticación, roles, perfiles y entrada HTTP
infrastructure/eureka-server/   Registro de servicios
services/ms-usuario/            Datos personales
services/ms-ruta/               Rutas y cupos
services/ms-equipamiento/       Equipamiento y recomendaciones
services/ms-reserva/            Coordinación de reservas
services/ms-pago/               Estado de pagos
```

Para compilar sin Docker necesitas Java 25. Desde esta carpeta puedes ejecutar `./mvnw.cmd -DskipTests package`. Esa opción compila sin ejecutar pruebas; no demuestra el funcionamiento de las bases ni la red. Para ejecutar las pruebas usa `./mvnw.cmd test` y configura la variable JWT en el entorno cuando se levante el contexto del Gateway.

Consulta la [guía técnica actual](docs/GUIA-BACKEND.md) y la [integración con React](../frontend/docs/INTEGRACION-FRONTEND-BACKEND.md). Los PDF y Word de `docs` son antecedentes de entregas anteriores y no reemplazan estas guías.

`docker compose down` detiene los servicios y conserva el volumen de MySQL. Eliminar el volumen destruye los datos. La configuración MySQL sin contraseña es para desarrollo local; no publiques estos servicios con esa configuración.
