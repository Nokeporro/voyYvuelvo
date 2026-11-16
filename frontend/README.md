# Voy y Vuelvo

Frontend de turismo aventura y equipamiento de trekking para la Evaluación Parcial 2 de DSY1104. Migrado a React, Vite, React Router y Bootstrap, con Atomic Design en toda la interfaz pública y administrativa. Todas las referencias a Jasmine y Karma de la guía se implementan con Vitest, según la adaptación solicitada.

Para instalar ambos proyectos desde una descarga nueva, sigue el [README principal](../README.md). La [guía técnica de integración](docs/INTEGRACION-FRONTEND-BACKEND.md) explica las funciones JavaScript, los métodos HTTP, CORS, Feign y el recorrido completo de una reserva.

## Ejecutar el proyecto

Requiere Node.js 22.12 o superior compatible con Vite 8 (se verificó con Node 24).

```sh
npm ci
npm run dev
```

Abre la dirección que imprime Vite, normalmente http://127.0.0.1:5173/. No abras el archivo HTML directamente con Live Server: los módulos JSX necesitan el servidor de Vite.

En Visual Studio Code, inicia Vite con `npm run dev` (o con la tarea **Voy y Vuelvo: iniciar Vite para Show Preview**) y pulsa **Show Preview** sobre `index.html`. La entrada detecta el servidor estático de Live Preview y abre automáticamente la aplicación procesada por Vite en el navegador integrado. Desde Vite también funcionan los accesos HTML de registro, catálogo y administración; Show Preview se inicia desde `index.html`. Vite utiliza siempre el puerto 5173; si está ocupado, informa el conflicto en lugar de cambiar silenciosamente de puerto.

```sh
npm test
npm run test:coverage
npm run check:architecture
npm run build
npm run preview
```

Con Docker y Vite iniciados, y `VITE_API_URL=http://localhost:8080` en `.env`, puedes comprobar la conexión real:

```sh
npm run test:integration
```

Este comando consulta las cinco API, sus puertos directos, Eureka, CORS y la pantalla de reserva. Para probar también la creación de equipamiento, usuario, reserva, arriendo y pago pendiente, ejecuta `npm run test:integration -- --write-test`. Esa opción utiliza registros temporales propios, los retira al terminar y comprueba que los cupos regresen a su valor inicial. Solo admite una API local.

La cobertura navegable se genera en `coverage/index.html`. La compilación queda en `dist/`. En hosting estático configura la reescritura de rutas desconocidas a `index.html` para poder recargar URLs como `/rutas/1`.

## Funcionalidades

- Inicio con búsqueda, rutas y productos destacados.
- Catálogo con búsqueda y filtro por dificultad, detalle y control de stock.
- Carrito persistente con cantidades, eliminación, vaciado y cupón `AVENTURA10`.
- Registro con RUT validado por módulo 11 o pasaporte y país emisor; correo de cualquier dominio válido y alojamiento para visitantes.
- Acceso a cuentas locales y roles Cliente, Vendedor y Administrador.
- Administración de productos y usuarios; los productos se comparten con la tienda y el carrito.
- Rutas, arriendo de equipamiento, cálculo de total y borrador recuperable de reserva.
- Nosotros, blog, dos artículos y contacto de demostración.
- Bootstrap Grid, formularios accesibles y menú móvil controlado con React.

## Datos de demostración

| Perfil        | Correo           | Contraseña |
| ------------- | ---------------- | ---------- |
| Administrador | admin@duoc.cl    | Demo2026!  |
| Vendedor      | vendedor@duoc.cl | Demo2026!  |

Para el cliente, crea una cuenta desde `/registro` con datos de prueba. Ejemplo de RUT válido: `12.345.678-5`; pasaporte de prueba: `AB1234567` y país emisor `Francia`. Contraseñas de 8 a 64 caracteres con confirmación.

Las cuentas se guardan solo en el navegador actual. Se persiste un hash SHA-256 con salt aleatorio, nunca la contraseña de usuario en claro. Esto permite demostrar el flujo, pero no reemplaza la autenticación de servidor ni un esquema de contraseñas de producción. La sesión local usa sessionStorage. Los controles por rol pueden manipularse desde el navegador y son exclusivamente académicos.

## Backend opcional de reservas

Consulta [Conexión con los microservicios](docs/CONEXION-BACKEND.md) para iniciar ambos proyectos y verificar las llamadas reales. `.env.test` mantiene las pruebas en modo simulado aunque configures una API local en `.env`.

Copia `.env.example` a `.env` y configura:

```dotenv
VITE_API_URL=http://localhost:8080
```

Reinicia Vite. El backend debe permitir CORS para el origen de Vite y exponer:

| Método | Endpoint                             | Uso                             |
| ------ | ------------------------------------ | ------------------------------- |
| GET    | /api/rutas/{id}                      | Ruta y cupos                    |
| GET    | /api/equipamiento/recomendacion/{id} | Equipamiento y valorArriendo    |
| GET    | /api/usuarios                        | Lista directa o HAL de usuarios |
| POST   | /api/usuarios                        | Crear contacto de reserva       |
| POST   | /api/reservas                        | Crear reserva y devolver id     |

Sin API configurada se guardan borradores; nunca se presenta una reserva confirmada. Ante un error HTTP se informa el fallo y se intenta guardar un borrador. El API de reservas mantiene el contrato del frontend original y no sincroniza las cuentas locales ni el catálogo administrado. La integración con un servidor real requiere verificar su contrato, CORS y autorización; las pruebas de esta entrega simulan fetch.

Contacto guarda una simulación local y no envía correo. El carrito no procesa pagos ni pedidos. El eventual servicio de guía se solicita por separado y no integra el total mostrado. Los catálogos de rutas, imágenes y cupos son datos académicos de ejemplo.

## Organización

```text
src/
  components/
    atoms/      Controles y elementos visuales básicos
    molecules/  Campos accesibles, tarjetas y composiciones pequeñas
    organisms/  Formularios, navegación, grillas, tablas y secciones
    templates/  Estructuras de sitio, panel, página, columnas y artículo
  context/      Estado compartido de catálogo, carrito y sesión
  data/         Datos iniciales de productos, regiones y rutas
  pages/        Páginas públicas que componen las plantillas
    admin/      Páginas individuales de administración
  routes/       Mapa de compatibilidad de las direcciones antiguas
  services/     Persistencia, cuentas y comunicación HTTP
  utils/        Validaciones y reglas del carrito
  styles/       Estilos globales y tokens visuales compartidos
  test/         Pruebas Vitest y React Testing Library
public/img/     Recursos servidos por Vite
scripts/        Arquitectura, alias HTML de producción y empaquetado
docs/           Manuales de desarrollo e integración
  requisitos/   ERS actualizada y documento histórico
  evaluacion/   Análisis, cobertura, exposición y evidencias
```

`index.html` es la única entrada HTML fuente. El mapa de `src/routes/legacy.js` conserva los enlaces anteriores y `scripts/vite-html-aliases.js` genera sus archivos HTML al compilar, incluidos los accesos administrativos. Vite los atiende también en desarrollo. Los antiguos enlaces de edición administrativa abren el listado para elegir el registro en el catálogo unificado.

El código activo está en `src/` y la única copia de las imágenes está en `public/img/`. Se retiraron las carpetas del sitio antiguo, los componentes reemplazados, el script de migración y los resultados temporales. Se conservan la clave y los IDs del carrito público anterior. `node_modules/`, `dist/`, `coverage/` y `entrega/` son resultados generados e ignorados por Git; `npm run package:delivery` crea el ZIP cuando se necesita.

## Documentación para la evaluación

- [Guía paso a paso de descarga, inicio y verificación](docs/GUIA-INICIO-Y-VERIFICACION.md): Git, Docker, configuración local, conexión real, reservas y pruebas desde la terminal.
- [Manual completo de arquitectura, uso y pruebas](docs/MANUAL-COMPLETO-DEL-PROYECTO.md): índice de carpetas, componentes, rutas, instalación, comandos de terminal y explicación de las pruebas.
- `docs/evaluacion/ANALISIS-Y-CRITERIOS.md`: inventario, diagnóstico y trazabilidad de los ocho indicadores.
- `docs/requisitos/ERS-EP2.md`: versión 2 de requisitos, con criterios de aceptación y reglas para visitantes extranjeros. Reemplaza el estado de EP1 del DOCX histórico para esta entrega.
- `docs/evaluacion/COBERTURA-TESTING.md`: alcance, estrategia, mocks, resultados y límites de cobertura.
- `docs/evaluacion/GUION-PRESENTACION.md`: recorrido de exposición y diez casos centrales para demostrar.
- `docs/ATOMIC-DESIGN.md`: responsabilidades de las cinco capas, ejemplos por pantalla y reglas para continuar el desarrollo.

El enlace público de GitHub y la publicación del proyecto deben completarse en el repositorio elegido por el equipo. Ninguna cuenta o repositorio público se crea automáticamente.

Referencias técnicas: [Vite](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/) y [Bootstrap](https://getbootstrap.com/docs/5.3/layout/grid/).
