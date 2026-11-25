# Ejecutar la aplicación con Docker

Docker Compose está en `voyYvuelvo/docker-compose.yml`. Requiere Docker Desktop iniciado con contenedores Linux y las carpetas `frontend` y `voyYvuelvo` una junto a la otra. Node y Java se ejecutan dentro de las imágenes durante la compilación.

## Primera instalación

Desde `voyYvuelvo`, copia `.env.example` como `.env` únicamente si este último no existe. Configura `JWT_SECRET_BASE64` con al menos 32 bytes aleatorios codificados en Base64, siguiendo el [README del proyecto](../../README.md). Conserva cualquier clave existente y no publiques `.env`.

```powershell
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

La primera compilación descarga imágenes y dependencias. MySQL tiene un chequeo de disponibilidad; los servicios Java esperan a que pase antes de arrancar. Después, espera a que el Gateway y los cinco microservicios aparezcan `UP` en [Eureka](http://localhost:8761).

| Responsabilidad | Contenedores | Acceso desde el equipo |
| --- | --- | --- |
| Frontend | 1: React compilado y servido por Nginx | http://127.0.0.1:5173 |
| Backend | 7: Gateway, Eureka y cinco microservicios | API en http://localhost:8080; Eureka en http://localhost:8761 |
| Base de datos | 1: MySQL, con volumen `mysql_data` | Puerto 3306 |

Son nueve contenedores: se conserva la arquitectura de microservicios. Esta distribución separa frontend, backend y base de datos; no equivale a una arquitectura de exactamente tres contenedores.

## Conexión del frontend

El Dockerfile compila React con `VITE_API_URL=/backend`. El navegador solicita, por ejemplo, `/backend/api/rutas` y Nginx lo reenvía a `http://api-gateway:8080/api/rutas` dentro de Docker. También reenvía login, registro y perfiles bajo `/backend/auth/`, conservando la cabecera `Authorization`.

El `.dockerignore` excluye `.env`, dependencias locales, resultados de compilaciones y otros archivos ajenos a la imagen. La imagen final contiene Nginx y los archivos compilados. React Router admite acceso y recarga directos en rutas como `/rutas/1` y `/admin`.

## Verificación

Comprueba la web y el proxy con estas direcciones:

- http://127.0.0.1:5173/healthz: disponibilidad de Nginx.
- http://127.0.0.1:5173/rutas: catálogo de la aplicación.
- http://127.0.0.1:5173/backend/api/rutas: catálogo JSON del backend.
- http://127.0.0.1:5173/backend/auth/perfil: debe devolver 401 sin JWT.

Desde `frontend`, con las dependencias instaladas, ejecuta la comprobación de integración a través del proxy:

```powershell
$env:INTEGRATION_API_URL='http://127.0.0.1:5173/backend'
try {
    npm run test:integration
} finally {
    Remove-Item Env:INTEGRATION_API_URL -ErrorAction SilentlyContinue
}
```

Comprueba catálogos, detalle de ruta, recomendaciones, protección JWT, CORS, registro en Eureka y acceso directo a la pantalla de reserva. No crea ni elimina datos de negocio. El acceso autenticado requiere un token o credenciales de prueba mediante las variables opcionales descritas en el [README del frontend](../README.md).

## Desarrollo y mantenimiento

Desde `voyYvuelvo`, `docker compose logs --tail 80 frontend api-gateway` muestra los registros y `docker compose up -d --build frontend` reconstruye la web tras editar el código. Los cambios en los archivos fuente no se reflejan en la imagen hasta reconstruirla.

Para usar Vite en 5173, detén primero Nginx con `docker compose stop frontend`. Luego configura el `.env` local del frontend con `VITE_API_URL=http://localhost:8080` y ejecuta `npm run dev` desde `frontend`. Vuelve al contenedor con `docker compose up -d frontend` una vez detenido Vite.

`docker compose down` detiene el proyecto y conserva los datos de MySQL. No añadas `-v` si necesitas conservar cuentas, reservas y pagos.
