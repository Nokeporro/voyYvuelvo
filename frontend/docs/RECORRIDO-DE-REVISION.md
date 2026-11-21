# Recorrido de revisión

Actualizado el 21 de noviembre de 2026. Preparación: [README principal](../../README.md).

## Revisión sin escribir datos

Desde `frontend` ejecuta:

```powershell
npm run check:architecture
npm test -- --maxWorkers=1
npm run build
```

Con Docker y Vite iniciados:

```powershell
npm run test:integration
```

El comprobador consulta catálogos, recomendaciones, Eureka y la página de reserva; verifica CORS y respuestas 401 de recursos protegidos sin JWT. No crea ni elimina registros. Para comprobar además permisos autenticados proporciona `INTEGRATION_TOKEN` en el entorno del proceso. También admite credenciales mediante `INTEGRATION_USERNAME` y `INTEGRATION_PASSWORD` para solicitar un token por login. No compartas esas variables.

## Revisión manual con datos de prueba

1. Abre la web en 5173 y comprueba navegación, productos, rutas, contacto y carrito. El contacto y el carrito son locales.
2. Registra una cuenta nueva. Deben completarse los tres pasos: cuenta, login técnico y perfil. No hay credenciales de demostración garantizadas en MySQL.
3. Inicia sesión como cliente y abre una ruta. Comprueba que se recupera tu perfil.
4. Crea una reserva futura con cupos disponibles. Esta prueba crea registros y consume cupos; utilízala solo en una base de desarrollo.
5. Cierra sesión y comprueba que la reserva requiere autenticación. Al recargar también se pierde la sesión actual.
6. Con una cuenta administrativa real, revisa la lista de cuentas remotas. Distingue esta lista del editor de usuarios locales de demostración.
7. Abre `/registro-ep2.html`, `/login.legacy.html`, `/contacto.html` y `/nosotros.html`: deben llevar a las pantallas actuales.

Si el registro creó la cuenta pero falló al vincular el perfil, no repitas el registro con el mismo nombre. Revisa el error y recupera el perfil con una intervención controlada; la interfaz todavía no incluye ese recorrido.

## Alcance de las comprobaciones

Las pruebas de React usan mocks y no sustituyen una prueba completa de Docker. El comprobador de integración no prueba creación de reservas, transacciones ni pagos reales. La operación de pago del backend cambia un estado y no cobra dinero.

Consulta [Atomic Design](ATOMIC-DESIGN.md), la [integración](INTEGRACION-FRONTEND-BACKEND.md) y los [requisitos históricos de EP2](requisitos/ERS-EP2.md). Las cifras de cobertura de entregas anteriores no representan una medición nueva.

## Resultado de esta actualización documental

El 21 de noviembre de 2026 se verificaron:

- 100 pruebas de React aprobadas en 8 archivos, con un solo trabajador.
- Compilación de producción y comprobación de Atomic Design correctas.
- 74 enlaces locales y 35 anclas de documentación, sin referencias rotas.
- Configuración de Compose válida al proporcionar una clave temporal de prueba, sin guardarla ni iniciar servicios.
- Comprobador de integración validado contra un servidor HTTP simulado: acceso sin token, CLIENTE, ADMINISTRADOR, VENDEDOR y rechazo del modo de escritura retirado.

No se ejecutó una prueba completa contra los contenedores reales: la configuración local no proporcionaba la clave JWT y Vite no estaba disponible. Las comprobaciones simuladas no sustituyen esa verificación ni la creación manual de una reserva de prueba.
