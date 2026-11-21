# Conexión con el backend

Actualizado el 21 de noviembre de 2026. Sigue primero la [instalación completa](../../README.md).

En `frontend/.env`, configura `VITE_API_URL=http://localhost:8080` y reinicia Vite. La aplicación usa `fetch`; no necesita un proxy de Vite. La URL es pública y se incluye en la compilación. La clave `JWT_SECRET_BASE64` pertenece exclusivamente al backend.

| Operación                        | Método y dirección del Gateway                   |
| -------------------------------- | ------------------------------------------------ |
| Catálogo de rutas                | `GET /api/rutas`                                 |
| Equipamiento                     | `GET /api/equipamiento`                          |
| Registro                         | `POST /auth/register`                            |
| Login                            | `POST /auth/login`                               |
| Perfil propio de cliente         | `POST /auth/perfil` y `GET /auth/perfil` con JWT |
| Reserva del cliente              | `POST /auth/reservas` con JWT                    |
| Cuentas reales del administrador | `GET /auth/cuentas` con JWT de administrador     |

`src/services/auth.js` obtiene el token. `registration.js` coordina cuenta, login y perfil. `api.js` añade `Authorization: Bearer <token>` cuando se lo entrega el componente. El Gateway valida firma, caducidad y rol antes de permitir la operación.

Los puertos de los microservicios son internos de Docker: todas las peticiones del navegador pasan por 8080. El frontend conserva algunos datos locales de demostración; no todo lo visible está sincronizado con MySQL.

Consulta la [explicación completa](INTEGRACION-FRONTEND-BACKEND.md) para ver cuerpos JSON, secuencias, roles, persistencia y límites de recuperación.
