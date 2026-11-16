# Conexión del frontend con los microservicios

Esta guía reúne la configuración y las comprobaciones operativas. Para comprender la implementación paso a paso, consulta [Cómo se conectan el frontend y el backend](INTEGRACION-FRONTEND-BACKEND.md). Para descargar e iniciar todo desde cero, sigue el [README principal](../../README.md).

## Configuración local

El backend está actualmente en `C:\Users\nokep\Documents\1_PROYECTOS_code\HTML_PROYECTS\Fullstack2\voyYvuelvo`, junto a `frontend`. Su Gateway publica los servicios en `http://localhost:8080`. Para la instalación y comprobación completa consulta [la guía paso a paso](GUIA-INICIO-Y-VERIFICACION.md).

En esta copia del frontend se creó `.env` con:

```dotenv
VITE_API_URL=http://localhost:8080
```

El archivo `.env` está ignorado por Git. Cada colaborador debe crear su configuración local. `.env.test` deja la dirección vacía para ejecutar la suite en modo simulado, independientemente de este `.env`. No deben introducirse direcciones reales de producción en la configuración de pruebas.

## Iniciar los dos proyectos

Con Docker Desktop abierto, desde una terminal:

```powershell
cd "C:\Users\nokep\Documents\1_PROYECTOS_code\HTML_PROYECTS\Fullstack2\voyYvuelvo"
docker compose up -d --build
docker compose ps
```

En otra terminal:

```powershell
cd "C:\Users\nokep\Documents\1_PROYECTOS_code\HTML_PROYECTS\Fullstack2\frontend"
npm run dev
```

Si Vite estaba abierto antes de crear o modificar `.env`, detenlo con Ctrl+C y vuelve a iniciarlo. Abre `http://127.0.0.1:5173/rutas/1`.

## Qué está conectado

`src/pages/Reservation.jsx` consulta la ruta y su equipamiento a través de `src/services/api.js`. Al enviar una reserva, el servicio busca el contacto por correo, lo crea si hace falta y envía la reserva. Las respuestas de listas pueden ser directas o HAL.

| Operación                      | Endpoint del Gateway                       |
| ------------------------------ | ------------------------------------------ |
| Consultar ruta                 | `GET /api/rutas/{id}`                      |
| Consultar arriendo recomendado | `GET /api/equipamiento/recomendacion/{id}` |
| Consultar contactos            | `GET /api/usuarios`                        |
| Crear contacto                 | `POST /api/usuarios`                       |
| Crear reserva                  | `POST /api/reservas`                       |

La reserva tiene efectos reales en los microservicios: utiliza identificadores existentes y puede afectar cupos y el flujo de pago. Para probar el envío manual utiliza datos académicos y verifica antes la disponibilidad. No se creó una reserva durante la comprobación inicial de conexión.

## Cómo comprobarlo en el navegador

1. Abre `/rutas/1` y espera la consulta.
2. La página debe mostrar “Datos consultados al servicio”.
3. Abre F12 → Network o Red y filtra por Fetch/XHR.
4. Comprueba respuestas 200 en `/api/rutas/1` y `/api/equipamiento/recomendacion/1` del puerto 8080.
5. La ruta 1 devuelve actualmente equipamiento recomendado con IDs 6 y 7 y valores 6000 y 12000. Estos valores pueden cambiar si el backend se modifica.
6. El botón pasa de guardar borrador a confirmar reserva. Un envío exitoso debe devolver un ID y mostrarlo en la pantalla. Confirma también el registro en el backend para verificar el ciclo completo.

Si aparece el mensaje de datos de demostración, la consulta falló: comprueba Docker, logs, CORS y los IDs. La implementación actual mantiene datos de ejemplo como respaldo; no los interpretes como una disponibilidad confirmada. No envíes una reserva con esa pantalla hasta recuperar la consulta real. Una consulta correcta tampoco garantiza cupos al enviar: el backend debe validarlos nuevamente.

## Alcance pendiente

Activar la API no migra todas las funciones. El registro con RUT o pasaporte, el login, los roles y la administración del catálogo continúan utilizando almacenamiento del navegador. No se integraron los endpoints `/auth/register` y `/auth/login`, ni se agregó una pantalla de pagos.

El microservicio de usuarios conserva nombre, email y teléfono; sus contactos no son todavía el mismo modelo que las cuentas locales con contraseña, RUT o pasaporte. El listado público de rutas también parte del catálogo local; la consulta real ocurre en la pantalla de reserva de cada ruta. Se necesita una adaptación adicional para soportar un catálogo remoto completo y rutas con IDs distintos de los datos iniciales.

## Verificaciones realizadas el 28 de octubre de 2026

Se consultaron por el Gateway las colecciones de rutas y equipamiento, la ruta 1 y sus recomendaciones. Respondieron HTTP 200. Las consultas con origen `http://127.0.0.1:5173` devolvieron el encabezado CORS correspondiente; el preflight OPTIONS para POST de reservas respondió 200.

Estas verificaciones son de lectura y permisos HTTP. No sustituyen una prueba manual completa en navegador ni confirman la creación de una reserva, pago o autenticación.

## Pruebas y build

```powershell
npm test
npm run check:architecture
npm run build
```

Vitest carga el modo `test` y `.env.test`; sus casos conservan respuestas HTTP simuladas. Vite en desarrollo y el build normal utilizan la dirección local de `.env`. Si despliegas `dist` en otro equipo o servidor, recompila con la URL apropiada: `localhost` en el navegador apunta al equipo de quien visita la página, no al servidor remoto.

## Verificación real después de la limpieza: 12 de noviembre de 2026

Se reconstruyeron las siete imágenes desde `infrastructure/` y `services/`, conservando el volumen MySQL. Los ocho contenedores iniciaron correctamente. Las cinco API respondieron por el Gateway y sus puertos directos; Eureka registró las seis aplicaciones cliente como `UP` y se verificaron CORS y el preflight para reservas.

Desde `frontend/`, con Vite y Docker iniciados:

```powershell
# Consultas reales sin modificar datos.
npm run test:integration

# Añade una prueba con datos temporales propios y limpieza al finalizar.
npm run test:integration -- --write-test
```

La segunda opción aprobó 12 comprobaciones. Ejecuta el servicio HTTP real de `src/services/api.js` con el entorno de desarrollo: crea y actualiza un equipamiento, crea un usuario y una reserva con arriendo, comprueba el pago pendiente y su monto, y verifica el descuento de un cupo. Después elimina sus registros temporales y comprueba que los cupos se restauren. No procesa un cobro ni confirma el pago. Los errores producen una salida distinta de cero.

El comprobador está en `scripts/check-integration.mjs`. Esta prueba verifica HTTP, contratos y persistencia; la revisión visual manual en el navegador es complementaria.
