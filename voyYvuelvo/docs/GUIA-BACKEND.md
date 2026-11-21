# Guía del backend

Actualizada el 21 de noviembre de 2026. [Instalación](../../README.md) y [secuencia detallada de integración](../../frontend/docs/INTEGRACION-FRONTEND-BACKEND.md).

## Servicios y persistencia

El proyecto Maven agrupa Gateway y Eureka en `infrastructure`, y los cinco dominios en `services`. Cada módulo tiene su Dockerfile y su configuración Spring. El contenedor MySQL conserva esquemas separados para cuentas, usuarios, rutas, equipamiento, reservas y pagos mediante el volumen `mysql_data`.

Solo se publican MySQL 3306, Eureka 8761 y Gateway 8080. Los servicios de usuario 8084, ruta 8086, equipamiento 8081, reserva 8083 y pago 8085 se comunican por la red de Docker. Las pruebas desde el equipo deben usar el Gateway y sus permisos, no esos puertos internos.

Eureka muestra los clientes registrados. Las rutas actuales y los clientes Feign usan destinos explícitos de Docker. El Gateway usa WebClient para componer la vinculación de perfil y la reserva del cliente.

## Arranque y diagnóstico

Desde `voyYvuelvo`, crea `.env` a partir de `.env.example` solo si no existe y configura `JWT_SECRET_BASE64` según el README principal. Luego:

```powershell
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail 80 api-gateway ms-usuario ms-reserva
```

Espera el arranque de MySQL y el registro de los seis clientes. Si alguno terminó antes de que su dependencia aceptara conexiones, revisa sus registros y vuelve a iniciarlo. `depends_on` no garantiza disponibilidad de la aplicación.

Consulta [rutas](http://localhost:8080/api/rutas), [Eureka](http://localhost:8761) y [Swagger del Gateway](http://localhost:8080/swagger-ui.html). La raíz 8080 no es una página del frontend. Swagger permite explorar contratos, pero los recursos protegidos requieren JWT y el rol correspondiente.

## Autenticación y perfil

- `POST /auth/register`: recibe username/password, crea CLIENTE, responde 201 de texto; 409 si ya existe.
- `POST /auth/login`: comprueba BCrypt y devuelve JSON con token; 401 con credenciales incorrectas.
- `POST /auth/perfil`: cliente autenticado, recibe nombre/email/telefono, crea usuario de dominio y vincula su id a la cuenta.
- `GET /auth/perfil`: recupera el perfil de la cuenta autenticada; 404 si no está disponible.
- `GET /auth/cuentas`: listado de cuentas reservado al administrador.
- `POST /auth/reservas`: cliente autenticado, incorpora en el Gateway su usuarioId real y delega en reservas.

El JWT se firma con HS256 usando `JWT_SECRET_BASE64` y dura una hora. No hay renovación automática. La contraseña no debe guardarse en texto plano ni la clave incluirse en el frontend. Cuenta de autenticación y perfil de dominio son entidades diferentes, unidas por `perfilUsuarioId`.

El registro no es una transacción distribuida. Si la cuenta se creó pero falló el perfil, revisa los registros y el vínculo antes de reintentar. Para recuperar un perfil ausente se puede autenticar a ese cliente y llamar a `POST /auth/perfil` con sus datos, únicamente después de comprobar que no hay ya un vínculo válido ni un perfil huérfano que requiera conciliación. No crees cuentas duplicadas como solución.

## Roles

| Operación                                                 | Permiso                  |
| --------------------------------------------------------- | ------------------------ |
| Lectura de rutas y equipamiento                           | Público                  |
| Perfil propio y creación de reserva propia en `/auth`     | CLIENTE                  |
| Lectura de reservas en `/api/reservas`                    | ADMINISTRADOR o VENDEDOR |
| Escritura directa de reservas y modificación de catálogos | ADMINISTRADOR            |
| Usuarios, pagos y listado de cuentas                      | ADMINISTRADOR            |

No hay administrador inicial garantizado. El registro público no permite elegir rol. Para una base **local de desarrollo**, el responsable puede registrar una cuenta propia por el formulario y luego cambiar su rol directamente en MySQL. Este es un procedimiento administrativo manual, no una función pública.

Abre MySQL desde la carpeta del backend:

```powershell
docker compose exec mysql mysql -u root
```

Dentro del cliente SQL, sustituye `admin_academico` por el username exacto que registraste. Comprueba primero que solo corresponde a la cuenta deseada:

```sql
SELECT id, username, rol FROM bd_gateway.usuarios WHERE username = 'admin_academico';
UPDATE bd_gateway.usuarios SET rol = 'ADMINISTRADOR' WHERE username = 'admin_academico';
SELECT id, username, rol FROM bd_gateway.usuarios WHERE username = 'admin_academico';
```

No cambies contraseñas mediante SQL ni concedas permisos a cuentas ajenas. Sal del cliente con `exit` e inicia sesión de nuevo para obtener un JWT con el rol actualizado. Los usuarios del editor local de React no participan en este procedimiento y no cambian MySQL.

## Contratos de dominio

El Gateway enruta `/api/usuarios`, `/api/rutas`, `/api/equipamiento`, `/api/reservas` y `/api/pagos`. Spring Data REST puede devolver HAL con `_embedded`, mientras los controladores personalizados pueden devolver JSON normal. No deduzcas el formato de todas las respuestas a partir de una sola ruta.

En `/auth/reservas`, el cliente manda rutaId, cantidadPersonas, fechaReserva, necesitaGuia y equipamientos con equipamientoId/cantidad. El Gateway agrega usuarioId desde el perfil vinculado. El frontend no decide la identidad del propietario ni el precio.

Reservas consulta usuarios, rutas y equipamiento con Feign; valida cupos y duplicados, calcula el precio, reduce cupos, guarda la reserva y solicita un pago. No hay transacción distribuida. La operación `/api/pagos/{id}/pagar` cambia el estado del pago, requiere administrador y no realiza un cargo bancario. No garantiza por sí sola una transición del estado de la reserva. Eliminar una reserva no implica eliminar automáticamente su pago.

## Compilación y pruebas

Para trabajar fuera de Docker, instala Java 21. Desde el backend:

```powershell
./mvnw.cmd -DskipTests package
./mvnw.cmd test
```

El primer comando compila sin pruebas. El segundo ejecuta las pruebas disponibles; el contexto del Gateway requiere la variable JWT y algunas comprobaciones pueden necesitar servicios según su configuración. Las pruebas de lógica con Mockito no sustituyen un recorrido completo con MySQL.

Desde `frontend`, `npm run test:integration` hace comprobaciones de lectura compatibles con JWT. Requiere Docker y Vite iniciados. No crea ni borra datos. El anterior `--write-test` fue retirado.

## Conservación de datos y antecedentes

`docker compose down` conserva el volumen. No elimines el volumen para corregir un fallo de autenticación sin antes revisar la causa y respaldar los datos. La configuración MySQL local sin contraseña requiere adaptación antes de exponer el sistema.

Los archivos PDF y Word de esta carpeta pertenecen a entregas anteriores. Pueden contener puertos, diagramas o flujos previos a JWT; para el comportamiento actual utiliza esta guía y la integración enlazada al inicio.
