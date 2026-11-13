# Manual de arquitectura y uso de Voy y Vuelvo

Guía del frontend de turismo aventura y trekking para DSY1104 Evaluación Parcial 2. Describe lo integrado, cómo iniciar el proyecto, dónde modificarlo y cómo ejecutar y explicar las pruebas. Está basada en los archivos del proyecto revisados al preparar este manual y en la verificación del 12 de noviembre de 2026: 99 pruebas aprobadas y compilación correcta.

Este proyecto es una aplicación React que funciona en el navegador. Puede demostrarse sin backend usando datos y almacenamiento locales. La conexión HTTP disponible corresponde a reservas y debe verificarse con un servidor real. No incluye un servidor backend ni una base de datos propia.

Los caminos de archivos de este documento son relativos a `frontend/`, salvo que se indique otra ubicación. Los comandos son para PowerShell. Debes ejecutarlos tú; este manual no realiza commits ni publicaciones.

## Índice

1. [Qué integramos](#1-qué-integramos)
2. [Tecnologías y responsabilidades](#2-tecnologías-y-responsabilidades)
3. [Instalación y primera ejecución](#3-instalación-y-primera-ejecución)
4. [Todos los comandos disponibles](#4-todos-los-comandos-disponibles)
5. [Cómo se inicia y funciona la aplicación](#5-cómo-se-inicia-y-funciona-la-aplicación)
6. [Índice de carpetas](#6-índice-de-carpetas)
7. [Archivos importantes de la raíz](#7-archivos-importantes-de-la-raíz)
8. [Atomic Design y catálogo de componentes](#8-atomic-design-y-catálogo-de-componentes)
9. [Páginas y rutas de navegación](#9-páginas-y-rutas-de-navegación)
10. [Estado datos servicios y persistencia](#10-estado-datos-servicios-y-persistencia)
11. [Cómo utilizar las funciones](#11-cómo-utilizar-las-funciones)
12. [Pruebas desde la terminal](#12-pruebas-desde-la-terminal)
13. [Dónde están las pruebas y qué verifican](#13-dónde-están-las-pruebas-y-qué-verifican)
14. [Cómo leer y escribir una prueba](#14-cómo-leer-y-escribir-una-prueba)
15. [Cobertura y límites de la verificación](#15-cobertura-y-límites-de-la-verificación)
16. [Backend opcional de reservas](#16-backend-opcional-de-reservas)
17. [Cómo continuar desarrollando](#17-cómo-continuar-desarrollando)
18. [GitHub colaboración y entrega](#18-github-colaboración-y-entrega)
19. [Problemas frecuentes](#19-problemas-frecuentes)
20. [Recorrido para presentar el proyecto](#20-recorrido-para-presentar-el-proyecto)
21. [Documentación existente](#21-documentación-existente)

## 1 Qué integramos

| Integración | Qué permite | Ubicación principal |
| --- | --- | --- |
| Migración de HTML a React | Interfaz por componentes y actualización por estado | `src/main.jsx`, `src/App.jsx`, `src/pages/` |
| Vite | Servidor de desarrollo y compilación de producción | `vite.config.js`, `package.json` |
| Navegación React Router | Cambiar de pantalla y recuperar parámetros de URL | `src/App.jsx` |
| Compatibilidad con HTML anterior | Mantener accesos como `registro.html` | `src/routes/legacy.js`, `scripts/vite-html-aliases.js`, `LegacyRedirect` en `App.jsx` |
| Bootstrap y estilos propios | Grillas adaptables, formularios, tarjetas y menú móvil | `src/main.jsx`, `src/styles/global.css` |
| Atomic Design | Reutilizar controles, formularios y estructuras de pantalla | `src/components/`, `src/pages/` |
| Tokens visuales | Centralizar variables de diseño compartidas | `src/styles/tokens.css` |
| Registro con RUT o pasaporte | Admitir clientes chilenos y visitantes extranjeros | `RegistrationForm.jsx`, `utils/validation.js` |
| Cuentas y roles locales | Demostrar login, logout y permisos por perfil | `services/accounts.js`, `context/Store.jsx` |
| Catálogo compartido | Mostrar en la tienda los productos administrados | `context/Store.jsx`, páginas de productos |
| Carrito persistente | Agregar, cambiar cantidades, quitar y aplicar descuento | `utils/cart.js`, `pages/Cart.jsx` |
| Reservas y arriendo | Validar fecha y cupos, calcular total y guardar borrador | `pages/Reservation.jsx`, `services/api.js` |
| Contenido público | Inicio, nosotros, artículos y contacto | `src/pages/`, `src/data/posts.js` |
| Show Preview | Abrir la aplicación procesada por Vite desde VS Code | `src/preview-entry.js`, `.vscode/` |
| Vitest | Ejecutar pruebas en reemplazo de Jasmine y Karma | `src/test/`, `vite.config.js` |
| Cobertura V8 | Ver líneas y decisiones ejercitadas por los tests | `npm run test:coverage`, `coverage/` |
| Comprobador de arquitectura | Detectar dependencias inválidas y ciclos | `scripts/check-atomic-design.mjs` |
| Documentación y ZIP | Apoyar exposición, requisitos y entrega | `docs/`, `scripts/package-delivery.mjs` |

Las validaciones incluyen RUT mediante módulo 11, normalización de documentos, correo internacional, contraseña y confirmación, consentimiento, país emisor de pasaporte y comuna relacionada con la región. Los mensajes de error se asocian a los campos para facilitar su lectura y uso con tecnologías de asistencia.

La validación de formato de un documento no verifica su existencia ni la identidad de una persona. El catálogo de comunas es una muestra académica, no una cobertura completa de Chile.

## 2 Tecnologías y responsabilidades

Las versiones declaradas se consultan en `package.json`; las versiones exactas reproducibles están en `package-lock.json`.

| Tecnología | Versión declarada | Responsabilidad |
| --- | --- | --- |
| React y React DOM | `^19.2.0` | Componentes, eventos, renderizado y hooks |
| React Router DOM | `^7.9.4` | Rutas y navegación de la SPA |
| Bootstrap | `^5.3.8` | Base visual y distribución responsive |
| Vite | `^8.3.4` | Desarrollo, transformación de JSX y build |
| Plugin React para Vite | `^6.1.2` | Procesar React en Vite |
| Vitest y cobertura V8 | `^5.0.5` | Pruebas automatizadas e instrumentación |
| React Testing Library | `^16.3.0` | Montar componentes y consultar el DOM |
| user-event | `^14.6.1` | Simular interacción de usuarios |
| jest-dom | `^6.9.1` | Aserciones como `toBeInTheDocument` |
| jsdom | `^27.0.0` | Entorno DOM simulado dentro de Node |
| Prettier | `^3.9.10` | Formato consistente del código |

Aunque la biblioteca se llama `jest-dom`, el ejecutor de las pruebas es Vitest. No hace falta instalar Jasmine, Karma ni Jest como ejecutor. Los archivos `.jsx` contienen JavaScript con sintaxis de interfaz; el proyecto no está escrito en TypeScript.

## 3 Instalación y primera ejecución

### Requisitos locales

Necesitas Node.js y npm, una terminal y un navegador. El README indica Node 22.12 o superior compatible; se verificó anteriormente con Node 24. Para reproducir la entrega conviene usar Node 24 y respetar el archivo de bloqueo de dependencias.

Comprueba la instalación:

```powershell
node --version
npm --version
```

### Si ya tienes el proyecto en este equipo

```powershell
cd "C:\Users\nokep\Documents\1_PROYECTOS_code\HTML_PROYECTS\Fullstack2\frontend"
npm ci
npm run dev
```

Ejecuta cada comando por separado y revisa que termine sin errores. `npm ci` instala las versiones del lockfile y reconstruye `node_modules`; no es necesario repetirlo cada vez que abres la página. Repite la instalación cuando cambien las dependencias o prepares otra copia del proyecto.

Abre `http://127.0.0.1:5173/`. Deja esa terminal abierta mientras uses la página. Para detener el servidor, pulsa `Ctrl + C` en ella.

### Si otro colaborador parte desde cero

```powershell
git clone --branch main https://github.com/Nokeporro/voyYvuelvo.git
cd voyYvuelvo/frontend
npm ci
npm run dev
```

El repositorio Git está en `Fullstack2/`; la aplicación y su `package.json` están en `Fullstack2/frontend/`. Para ejecutar npm debes estar en `frontend`, no en la carpeta padre.

### Show Preview en Visual Studio Code

1. Abre `frontend` en VS Code.
2. En su terminal, ejecuta `npm run dev`.
3. Abre `index.html` y usa Show Preview.
4. La entrada de compatibilidad redirige al servidor Vite del puerto 5173.

También puedes iniciar Vite desde Terminal → Run Task → **Voy y Vuelvo: iniciar Vite para Show Preview**. La configuración está en `.vscode/tasks.json`.

Show Preview utiliza un servidor estático que no transforma JSX. Por eso el proyecto necesita Vite aunque se visualice dentro de VS Code. Si el puerto 5173 está ocupado, Vite informa el problema porque `strictPort` está activado.

## 4 Todos los comandos disponibles

Estos scripts están definidos en `package.json` y se ejecutan desde `frontend/`.

| Comando | Para qué sirve | Resultado |
| --- | --- | --- |
| `npm ci` | Instalar dependencias del lockfile | Reconstruye `node_modules/` |
| `npm run dev` | Trabajar y ver cambios durante el desarrollo | Servidor en 127.0.0.1:5173 |
| `npm test` | Ejecutar toda la suite una vez | Resumen de pruebas y salida de proceso |
| `npm run test:watch` | Repetir pruebas al guardar cambios | Proceso interactivo; salir con `q` o Ctrl+C |
| `npm run test:coverage` | Ejecutar suite con cobertura | Terminal y reportes en `coverage/` |
| `npm run check:architecture` | Comprobar reglas Atomic Design | Errores o confirmación de estructura válida |
| `npm run format:check` | Revisar el formato sin modificar archivos | Informa diferencias de formato |
| `npm run format` | Aplicar Prettier | Modifica el código cubierto por el script |
| `npm run build` | Generar la versión de producción | Archivos en `dist/` |
| `npm run preview` | Servir localmente el build existente | URL impresa por Vite, habitualmente puerto 4173 |
| `npm run package:delivery` | Crear ZIP de fuentes para entregar | `entrega/Voy-y-Vuelvo-EP2.zip` |

`npm run preview` requiere ejecutar `npm run build` antes. Cada cambio posterior necesita un nuevo build para aparecer en esa vista. El empaquetador utiliza `powershell.exe` y está preparado para Windows.

Secuencia recomendada antes de presentar cambios:

```powershell
npm run check:architecture
npm run format:check
npm test
npm run test:coverage
npm run build
```

Ejecuta uno por uno. Si un paso falla, corrígelo antes de continuar. Si no necesitas el resumen independiente de `npm test`, puedes ejecutar directamente `npm run test:coverage`, que también corre las pruebas.

## 5 Cómo se inicia y funciona la aplicación

```text
Navegador abre un HTML de entrada
  → src/preview-entry.js decide cómo cargar la aplicación
  → src/main.jsx importa Bootstrap y estilos propios
  → BrowserRouter habilita navegación
  → StoreProvider proporciona catálogo, carrito y sesión
  → src/App.jsx selecciona la página por URL
  → la página compone plantillas y componentes Atomic Design
  → servicios y utilidades procesan datos cuando corresponde
```

`src/main.jsx` monta React en el elemento `root` del HTML. `React.StrictMode` ayuda a detectar problemas de desarrollo; no representa una segunda aplicación.

`src/App.jsx` define las rutas públicas, las administrativas y los alias HTML. `SiteTemplate` organiza la cabecera, el contenido y el pie. `AdminTemplate` comprueba la sesión local y el rol para mostrar el panel.

Ejemplo del flujo de carrito:

```text
Usuario pulsa agregar en una ficha
  → ProductPurchaseForm comunica la acción
  → la página utiliza useStore
  → addToCart valida producto, cantidad y stock
  → Store guarda el carrito y actualiza el estado React
  → cabecera y carrito muestran las nuevas cantidades
```

Hay tres tipos de estado que conviene distinguir: estado de formulario o selección, manejado por el componente; estado compartido, expuesto por el contexto; y datos persistidos, serializados en el almacenamiento del navegador. Una variable de estado no se convierte automáticamente en un registro de base de datos.

## 6 Índice de carpetas

```text
frontend/
  .vscode/          Tarea de desarrollo y Show Preview
  docs/
    evaluacion/     Análisis, cobertura, guion y capturas históricas
    requisitos/     ERS actual y documento histórico
  public/img/       Única copia de las imágenes utilizadas por React
  scripts/          Verificador de arquitectura, alias HTML y empaquetado
  src/
    components/     atoms, molecules, organisms y templates
    context/        Estado compartido de catálogo, carrito y sesión
    data/           Catálogos iniciales
    pages/admin/    Páginas administrativas; páginas públicas en pages/
    routes/         Compatibilidad de las direcciones antiguas
    services/       Cuentas, persistencia y HTTP
    styles/         global.css y tokens.css
    test/           Suite Vitest y configuración auxiliar
    utils/          Validaciones y reglas del carrito
  index.html        Única entrada HTML fuente
  vite.config.js    Desarrollo, build y pruebas
```

Trabaja en `src/`, `public/img/`, `scripts/` y `docs/`. Un catálogo ya guardado en el navegador puede tener prioridad sobre los datos iniciales de `src/data/products.js`.

Se eliminaron `legacy/`, `js/`, `css/`, `img/`, los componentes antiguos `Cards.jsx`, `Field.jsx` y `Layout.jsx`, y el script de migración ya concluida. React utiliza los componentes Atomic y las imágenes de `public/img/`.

Los HTML duplicados de la raíz y `admin/` se sustituyeron por alias generados desde `index.html`. Vite atiende esos accesos durante el desarrollo y `scripts/vite-html-aliases.js` los escribe en `dist/` al compilar. Las direcciones siguen definidas en `src/routes/legacy.js`.

`node_modules/`, `dist/`, `coverage/`, `tmp/` y `entrega/` están ignoradas por Git. npm instala las dependencias; los comandos de build, cobertura y empaquetado crean sus respectivos resultados. No se edita su contenido manualmente.

## 7 Archivos importantes de la raíz

| Archivo | Función |
| --- | --- |
| `package.json` | Nombre, scripts y rangos de dependencias |
| `package-lock.json` | Versiones exactas e integridad de instalación |
| `vite.config.js` | Plugin React, puerto, entradas HTML y configuración Vitest |
| `index.html` | Contenedor de la aplicación y referencia a preview-entry |
| `src/routes/legacy.js` | Mapa compartido de accesos antiguos |
| `scripts/vite-html-aliases.js` | Genera las entradas HTML de compatibilidad en producción |
| `.env.example` | Plantilla de configuración de la API |
| `.env` | Configuración local opcional; no se sube a Git |
| `.gitignore` | Exclusiones locales de dependencias, resultados y entorno |
| `README.md` | Introducción rápida al proyecto |
| `docs/requisitos/ERS-Voy-y-Vuelvo-completado.docx` | Documento histórico de requisitos de la primera entrega |
| `src/main.jsx` | Montaje de React y proveedores globales |
| `src/preview-entry.js` | Compatibilidad entre Vite y Show Preview |
| `src/App.jsx` | Tabla de navegación y redirecciones |
| `src/styles/global.css` | Estilos activos de la interfaz |

La ERS actualizada de esta entrega está en `docs/requisitos/ERS-EP2.md`; no debe confundirse con el DOCX histórico. En la raíz Git padre también existe una exclusión de `/frontend.zip`, agregada para evitar volver a versionar el archivo grande que GitHub rechazó.

## 8 Atomic Design y catálogo de componentes

Atomic Design organiza la interfaz por responsabilidad y composición. Una página selecciona datos y conecta acciones; una plantilla organiza espacios; un organismo reúne una sección; una molécula combina pocos elementos; un átomo representa un control o elemento básico.

```text
Página Register
  → PageTemplate y SplitTemplate
  → RegistrationForm
  → FormField
  → Label e Input o Select
```

No es obligatorio usar todas las capas en cada bloque. Lo importante es que las dependencias respeten las responsabilidades. Un átomo no debe importar una página ni consultar un servicio de cuentas.

### Átomos en src/components/atoms

| Archivo | Uso |
| --- | --- |
| `AppLink.jsx` | Enlace interno de Router, enlace externo o ancla |
| `Badge.jsx` | Indicadores y etiquetas visuales |
| `Button.jsx` | Botón compartido; por defecto no envía formularios |
| `Heading.jsx` | Encabezados h1 a h6 mediante propiedades |
| `Image.jsx` | Imagen reutilizable |
| `Input.jsx` | Campo básico de entrada |
| `Label.jsx` | Etiqueta asociada a un control |
| `MountainIcon.jsx` | Icono de montaña de la marca |
| `Select.jsx` | Selector básico |
| `Text.jsx` | Texto con elemento configurable |
| `Textarea.jsx` | Entrada de texto de varias líneas |

### Moléculas en src/components/molecules

| Archivo | Uso |
| --- | --- |
| `BlogCard.jsx` | Tarjeta de artículo |
| `Brand.jsx` | Marca con texto e icono |
| `CartItem.jsx` | Fila o bloque de un producto del carrito |
| `ConfirmationPrompt.jsx` | Presenta confirmación y delega la acción |
| `CouponForm.jsx` | Entrada y aplicación de cupón |
| `FormField.jsx` | Campo con etiqueta, ayuda y error accesible |
| `ProductCard.jsx` | Resumen visual de producto |
| `RentalOption.jsx` | Selección de un elemento para arrendar |
| `RouteCard.jsx` | Resumen de ruta turística |
| `SectionHeading.jsx` | Título y texto de sección |
| `StatCard.jsx` | Indicador del panel |
| `TotalsSummary.jsx` | Subtotal, descuento y total |

### Organismos en src/components/organisms

| Grupo | Archivos | Responsabilidad |
| --- | --- | --- |
| Nosotros | `AboutHero`, `AboutStory`, `AboutTeam`, `AboutValues` | Presentación, historia, equipo y valores |
| Inicio | `HomeHero`, `AdventureInvite`, `FeaturedProducts`, `FeaturedRoutes` | Portada, invitación y destacados |
| Artículos | `BlogList`, `BlogRecommendations` | Listado y recomendaciones |
| Estructuras compartidas | `CardGrid`, `SiteHeader`, `SiteFooter` | Grilla, navegación y pie |
| Cuenta y contacto | `RegistrationForm`, `LoginForm`, `ContactForm` | Formularios de esos flujos |
| Productos | `ProductFilters`, `ProductPurchaseForm`, `ProductForm`, `ProductsTable` | Filtros, compra local, edición y listado |
| Rutas y reserva | `RouteSearchForm`, `ReservationForm`, `RentalEquipmentList` | Búsqueda, reserva y equipamiento |
| Usuarios | `UsersTable` | Listado administrativo |

Todos los nombres anteriores corresponden a archivos `.jsx`. Hay 24 organismos.

### Plantillas en src/components/templates

| Archivo | Responsabilidad |
| --- | --- |
| `SiteTemplate.jsx` | Estructura global con cabecera, Outlet y pie |
| `AdminTemplate.jsx` | Estructura y acceso local al panel |
| `PageTemplate.jsx` | Contenedor general de página |
| `SplitTemplate.jsx` | Distribución en dos áreas o columnas |
| `ArticleTemplate.jsx` | Presentación de artículos |

### Reglas y comprobación

```powershell
npm run check:architecture
```

La entrada está en `scripts/check-atomic-design.mjs` y la lógica reutilizable en `scripts/lib/atomic-design.js`. Comprueba imports relativos, dependencias hacia capas superiores, ciclos y determinadas reglas de composición y controles básicos. Los átomos y moléculas no deben importar servicios, contexto o datos de negocio.

Es un análisis estático con reglas concretas: aprobarlo no equivale a verificar toda decisión de diseño, cada posible import dinámico o toda la accesibilidad de la aplicación.

## 9 Páginas y rutas de navegación

Todas las rutas siguientes se agregan a `http://127.0.0.1:5173`. Se definen en `src/App.jsx`.

| URL | Archivo en src/pages | Pantalla |
| --- | --- | --- |
| `/` | `Home.jsx` | Inicio y buscador |
| `/registro` | `Register.jsx` | Registro con RUT o pasaporte |
| `/login` | `Login.jsx` | Inicio de sesión |
| `/productos` | `Products.jsx` | Catálogo y filtros |
| `/productos/:id` | `ProductDetail.jsx` | Ficha y agregar al carrito |
| `/rutas` | `RoutesCatalog.jsx` | Destinos y filtros |
| `/rutas/:id` | `Reservation.jsx` | Reserva y arriendo |
| `/carrito` | `Cart.jsx` | Cantidades, cupón y totales |
| `/contacto` | `Contact.jsx` | Formulario de contacto simulado |
| `/nosotros` | `About.jsx` | Información del equipo |
| `/blogs` | `Blog.jsx` | Listado editorial |
| `/blogs/1` | `ArticleOne.jsx` | Primer artículo |
| `/blogs/2` | `ArticleTwo.jsx` | Segundo artículo |
| `/admin` | `admin/Dashboard.jsx` | Resumen administrativo |
| `/admin/productos` | `admin/AdminProducts.jsx` | Listado de productos |
| `/admin/productos/nuevo` | `admin/ProductEditor.jsx` | Crear producto |
| `/admin/productos/:id` | `admin/ProductEditor.jsx` | Editar producto |
| `/admin/usuarios` | `admin/AdminUsers.jsx` | Listado de usuarios |
| `/admin/usuarios/nuevo` | `admin/UserEditor.jsx` | Crear usuario |
| `/admin/usuarios/:id` | `admin/UserEditor.jsx` | Editar usuario |
| URL desconocida | `NotFound.jsx` | Pantalla no encontrada |

`:id` se sustituye por un identificador real; por ejemplo `/productos/1` o `/rutas/1`. No se escribe literalmente `:id` en el navegador.

Los archivos `registro.html`, `productos.html`, etc. cargan la aplicación y se redirigen a las rutas actuales. `detalle-producto.html?id=1` abre la ficha correspondiente; `reserva-ruta.html?ruta=1` abre una reserva. Los antiguos enlaces de edición de administración llevan al listado para elegir un registro del catálogo unificado.

## 10 Estado datos servicios y persistencia

### Contexto compartido

`src/context/Store.jsx` define `StoreProvider` y `useStore`. Expone productos, carrito y sesión; permite guardar productos, agregar o quitar del carrito, cambiar cantidades, vaciarlo, iniciar y cerrar sesión. Los componentes consumidores se actualizan cuando cambia ese estado.

La actualización React no muta directamente las listas anteriores. Las reglas de stock y normalización del carrito están separadas en `src/utils/cart.js`.

### Datos iniciales

| Archivo | Contenido |
| --- | --- |
| `src/data/products.js` | Catálogo inicial de productos |
| `src/data/routes.js` | Rutas y equipamiento de arriendo de demostración |
| `src/data/regions.js` | Regiones y comunas de ejemplo |
| `src/data/posts.js` | Datos del listado de artículos |

Las imágenes referenciadas como `/img/mochila.png` se encuentran en `public/img/mochila.png`. La carpeta `public` no se escribe dentro de la URL.

### Servicios

| Archivo | Funciones o tareas |
| --- | --- |
| `src/services/storage.js` | `readStorage`, `writeStorage`; JSON y mensajes ante fallo de persistencia |
| `src/services/accounts.js` | `getUsers`, `saveAccount`, `login`, `publicUser`, `deleteAccount` |
| `src/services/api.js` | `apiEnabled`, `request`, `embeddedList`, `submitReservation` |

### Utilidades

`src/utils/validation.js` contiene `normalizeDocument`, `validRut`, `validEmail`, `validateRegistration`, `validateReservation`, `money` y `tomorrow`. Centraliza reglas reutilizables y formato monetario.

`src/utils/cart.js` contiene `sanitizeCart`, `addToCart` y `cartTotals`. Depura datos, controla cantidades y calcula descuento y total.

### Claves guardadas en el navegador

| Almacenamiento | Clave | Datos |
| --- | --- | --- |
| localStorage | `vv-react-products-v2` | Catálogo administrado localmente |
| localStorage | `voy-vuelvo-carrito-v1` | IDs y cantidades del carrito |
| localStorage | `vv-react-users-v2` | Cuentas locales |
| localStorage | `vv-react-messages` | Contactos simulados |
| localStorage | `voy-vuelvo-reserva-borrador` | Último borrador de reserva |
| localStorage | `voy-vuelvo-ultima-reserva` | Respuesta de última reserva confirmada por API |
| sessionStorage | `vv-react-session-v2` | Sesión de la pestaña |

localStorage conserva información entre visitas al mismo origen. sessionStorage está asociado a la sesión de la pestaña. Cambiar de `127.0.0.1` a `localhost`, de puerto o de navegador cambia el ámbito del almacenamiento: puedes ver otras cuentas o un carrito vacío.

Subir el código a GitHub no sube estas cuentas ni los productos guardados en tu navegador. Cada colaborador obtiene el código y los datos iniciales, y mantiene su propio estado local.

Para una demostración limpia puedes usar una ventana privada y crear datos de prueba allí. Si necesitas borrar datos, usa las herramientas del navegador → Application o Almacenamiento y elimina solo las claves necesarias. Borrar cuentas o catálogo elimina esos datos locales; no es un paso obligatorio de instalación.

## 11 Cómo utilizar las funciones

### Registro de un cliente

1. Abre `/registro`.
2. Completa nombre, apellidos y correo válido.
3. Selecciona RUT o pasaporte.
4. Con RUT, utiliza un documento válido y elige región y comuna relacionada. Ejemplo académico de RUT: `12.345.678-5`.
5. Con pasaporte, ingresa de 5 a 20 caracteres alfanuméricos y el país emisor. Ejemplo: `AB1234567`, país `Francia`.
6. Completa teléfono y dirección o alojamiento.
7. Usa una contraseña de 8 a 64 caracteres, confírmala y acepta el consentimiento.
8. Envía y verifica el mensaje de resultado.

El registro público crea un Cliente. Los duplicados se comprueban por correo y por combinación de tipo de documento, documento y país emisor. La cuenta queda en el navegador actual.

### Login y perfiles

| Perfil demo | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@duoc.cl` | `Demo2026!` |
| Vendedor | `vendedor@duoc.cl` | `Demo2026!` |

El Cliente se registra desde la página pública. El Administrador administra productos y usuarios. El Vendedor consulta productos y tiene restricciones para modificar y acceder a usuarios. Un visitante sin sesión se redirige a login al intentar abrir el panel.

Las contraseñas de las cuentas registradas se procesan con SHA-256 y salt aleatorio. Las credenciales demo están explícitas en el código. Este mecanismo permite demostrar el flujo académico; una aplicación pública necesita autenticación y autorización de servidor y un sistema de contraseñas apropiado para producción.

### Productos y carrito

1. Abre `/productos` y utiliza el buscador o los filtros.
2. Entra a una ficha y selecciona una cantidad disponible.
3. Agrega al carrito y abre `/carrito`.
4. Cambia cantidades o elimina productos.
5. Aplica `AVENTURA10` para un descuento del 10 %.
6. Comprueba subtotal, descuento y total en pesos chilenos.

No se permite agregar cantidades inválidas ni superar el stock disponible. El carrito no procesa pagos ni crea pedidos reales.

### Administración

Con la cuenta Administrador, abre `/admin/productos`, crea un producto, edítalo y comprueba que aparece en `/productos`. El panel y la tienda usan el mismo contexto y catálogo persistido. La eliminación debe comprobarse también desde el catálogo público.

En `/admin/usuarios` puedes crear, editar y eliminar cuentas locales. Los cambios afectan al navegador actual, no a una base de datos compartida entre colaboradores.

### Rutas y reserva

Desde `/rutas`, abre un destino, revisa sus datos, selecciona equipamiento e ingresa fecha futura y cantidad de personas dentro del cupo. El total suma el precio de la ruta por persona más una unidad de arriendo por cada artículo seleccionado. El servicio de guía no está valorizado dentro de ese total.

Sin API, el envío guarda un borrador e informa que la reserva no está confirmada. Puedes recuperar el borrador de esa ruta y revisar los datos antes de enviarlo otra vez. Con API, solo se anuncia creación si la respuesta contiene un identificador de reserva.

### Contacto y contenido

`/contacto` valida el formulario y guarda una simulación local; no envía correo. `/nosotros`, `/blogs` y los dos artículos conservan el contenido editorial en componentes React.

## 12 Pruebas desde la terminal

No necesitas iniciar `npm run dev` para ejecutar Vitest. Las pruebas utilizan Node y jsdom. Conviene dejar el servidor detenido al reinstalar dependencias en Windows.

### Toda la suite una vez

```powershell
npm test
```

En la verificación de la limpieza: 8 archivos y 99 pruebas aprobadas, duración de 19,40 segundos. El tiempo varía según el equipo; no es un tiempo garantizado ni una medición de velocidad del sitio.

### Un solo archivo

```powershell
npm test -- src/test/validation.test.js
npm test -- src/test/cart.test.js
npm test -- src/test/services.test.js
npm test -- src/test/components.test.jsx
npm test -- src/test/admin.test.jsx
npm test -- src/test/pages.test.jsx
npm test -- src/test/preview.test.js
npm test -- src/test/atomic-design.test.jsx
```

El separador `--` pasa los argumentos siguientes a Vitest. Puedes ejecutar solo uno de esos comandos según lo que quieras demostrar.

### Un caso por su nombre

```powershell
npm test -- src/test/cart.test.js -t "calcula el descuento y el total en CLP"
```

Filtra por el nombre escrito dentro de `it` o `test`. Otros casos pueden aparecer como omitidos por el filtro; eso no significa que hayan fallado.

### Modo continuo y salida detallada

```powershell
npm run test:watch
```

Deja la terminal abierta, guarda un cambio y observa la repetición. Para una salida más detallada de una ejecución:

```powershell
npm test -- --reporter=verbose
```

### Cobertura

```powershell
npm run test:coverage
Start-Process .\coverage\index.html
```

El segundo comando abre el reporte generado en tu navegador predeterminado. Entra a las carpetas y archivos para ver líneas pendientes de ejecutar. `coverage/coverage-summary.json` contiene el resumen numérico para herramientas y documentación.

### Cómo interpretar la salida

`passed` significa aprobado; `failed`, fallido; `skipped`, omitido. Si un caso falla, revisa primero el nombre, la diferencia entre resultado esperado y recibido, y el archivo y línea indicados. Una instalación fallida puede impedir que Vitest se inicie: eso es distinto de un test que ejecutó y detectó una regresión.

Si todos los tests pasan pero el build falla, la entrega todavía requiere corrección: las verificaciones tienen propósitos diferentes. El comando de arquitectura tampoco sustituye a las pruebas funcionales.

## 13 Dónde están las pruebas y qué verifican

Todos los archivos están dentro de `src/test/`. Hay pruebas unitarias de funciones y pruebas de componentes e integración local; la suite completa no debe describirse como exclusivamente unitaria.

| Archivo | Cantidad en la última ejecución | Código y comportamiento relacionado |
| --- | --- | --- |
| `validation.test.js` | 31 | `utils/validation.js`: RUT, correo, registro, país emisor, comuna, contraseña, consentimiento, fecha y cupos |
| `cart.test.js` | 11 | `utils/cart.js`: cantidades, stock, no mutación, depuración, cupón y totales |
| `services.test.js` | 13 | `services/storage.js`, `accounts.js`, `api.js`: almacenamiento, cuentas, duplicados, HTTP, HAL y envío de reserva |
| `components.test.jsx` | 15 | Registro, filtros, carrito, menú, contacto, navegación y borrador de reserva |
| `admin.test.jsx` | 8 | Login/logout, permisos y CRUD compartido de productos y usuarios |
| `pages.test.jsx` | 5 | Páginas editoriales y búsqueda de inicio |
| `preview.test.js` | 4 | Entrada `preview-entry.js`, redirecciones y carga mediante Vite |
| `atomic-design.test.jsx` | 10 | Contratos de componentes y reglas de `scripts/lib/atomic-design.js` |
| **Total** | **97** | **8 archivos aprobados** |

Los conteos corresponden a la ejecución compartida al preparar el documento; futuras modificaciones pueden cambiarlos. Los casos parametrizados cuentan cada entrada como una prueba.

`src/test/setup.js` no es otro archivo de casos: prepara el entorno. Importa las aserciones jest-dom para Vitest, limpia localStorage y sessionStorage antes de cada caso, simula `scrollTo` y limpia el DOM después de cada prueba.

La configuración está en `vite.config.js`: entorno `jsdom`, `setupFiles`, restauración de mocks y cobertura V8 con reporteros `text`, `html` y `json-summary`. No hay un archivo separado obligatorio llamado `vitest.config.js`, porque Vite y Vitest comparten la configuración existente.

## 14 Cómo leer y escribir una prueba

Una prueba contiene una preparación, una acción y una comprobación. Este patrón se conoce como Arrange, Act, Assert.

Ejemplo equivalente al escenario de descuento ya incluido en `src/test/cart.test.js`:

```javascript
import { expect, it } from "vitest";
import { cartTotals } from "../utils/cart";

it("calcula el descuento y el total en CLP", () => {
  // Preparar los datos de prueba.
  const products = [{ id: 1, stock: 3, precio: 10000 }];
  const cart = [{ id: 1, cantidad: 2 }];

  // Ejecutar la regla de negocio.
  const result = cartTotals(cart, products, "AVENTURA10");

  // Comprobar el resultado observable.
  expect(result).toEqual({
    subtotal: 20000,
    descuento: 2000,
    total: 18000,
  });
});
```

`it` nombra el comportamiento. `expect` recibe el resultado real. `toEqual` compara el contenido esperado. La función real está en `utils/cart.js`; el archivo `.test.js` no implementa el carrito para el usuario, sino que verifica su regla.

En pruebas visuales de componentes se utiliza `render` para montar la interfaz, `MemoryRouter` cuando hace falta navegación y `StoreProvider` cuando hace falta el estado compartido. `screen.getByRole` y `getByLabelText` buscan controles como lo haría una persona mediante rol y etiqueta; `user-event` permite pulsar, escribir y seleccionar.

En escenarios asíncronos utiliza `await` con las interacciones y consultas que esperan un resultado. Evita comprobar inmediatamente un mensaje que depende de una operación asíncrona.

### Mocks

Un mock reemplaza una dependencia para controlar el escenario. En `services.test.js`, `vi.fn` y `vi.stubGlobal` simulan `fetch` y respuestas HTTP. Así se prueba qué cuerpo se envía y qué ocurre ante un error sin necesitar un backend ni generar reservas externas.

También se simulan errores de almacenamiento para comprobar que la interfaz informa un fallo y no anuncia éxito cuando no se pudo guardar. Una prueba con mock demuestra el comportamiento frente al contrato simulado; no demuestra que un servidor real cumpla ese contrato.

### Agregar un caso

1. Ubica la regla o componente que cambiarás.
2. Abre el archivo de pruebas relacionado en la tabla anterior.
3. Agrega un caso que verifique un comportamiento observable o un límite significativo.
4. Ejecuta ese archivo con `npm test -- ruta/al/archivo.test.jsx`.
5. Después ejecuta la suite completa, la arquitectura y el build.

No copies el ejemplo de descuento como una segunda prueba idéntica: úsalo para entender cómo están construidos los casos existentes.

## 15 Cobertura y límites de la verificación

La última cobertura documentada en `docs/evaluacion/COBERTURA-TESTING.md` corresponde a la ejecución posterior a Atomic Design, no a una nueva medición realizada al escribir este manual:

| Métrica | Cobertura documentada | Qué significa |
| --- | --- | --- |
| Sentencias | 87,69 % | Instrucciones ejecutadas |
| Ramas | 82,97 % | Alternativas de decisiones ejercitadas |
| Funciones | 88,60 % | Funciones ejecutadas |
| Líneas | 88,88 % | Líneas instrumentadas alcanzadas |

Para obtener cifras actuales ejecuta `npm run test:coverage`. El último resultado compartido de `npm test` sí confirma 97 aprobadas, pero no recalcula por sí mismo esos porcentajes.

La configuración excluye tests, `src/main.jsx` y datos estáticos de la instrumentación. La cobertura representa el conjunto incluido en el reporte; no el porcentaje de requisitos de evaluación satisfechos.

Quedan escenarios por ampliar, especialmente carga remota y recuperación de reservas, edición de productos y sincronización del contexto entre pestañas. jsdom no comprueba el tamaño real de la pantalla, colores, distribución Bootstrap o todos los navegadores. No existen en esta suite pruebas de extremo a extremo con un navegador real.

No están verificados por estas pruebas un backend real, autorización de servidor, entrega de correos, pagos, autenticidad documental ni carga de producción. La revisión manual y la integración HTTP real siguen siendo verificaciones separadas.

## 16 Backend opcional de reservas

El frontend funciona sin esta configuración. Actívala solo cuando dispongas de un backend compatible.

```powershell
Copy-Item .env.example .env
```

Haz la copia solo si todavía no tienes `.env`, para conservar tu configuración. Edita el archivo y define, por ejemplo:

```dotenv
VITE_API_URL=http://localhost:8080
```

Detén y vuelve a iniciar Vite después del cambio. Las variables con prefijo `VITE_` pueden incorporarse al cliente: no guardes contraseñas privadas ni secretos de servidor en ellas.

| Método | Endpoint | Función |
| --- | --- | --- |
| GET | `/api/rutas/{id}` | Datos de la ruta y cupo |
| GET | `/api/equipamiento/recomendacion/{id}` | Equipamiento recomendado y valores de arriendo |
| GET | `/api/usuarios` | Buscar contacto de reserva por correo |
| POST | `/api/usuarios` | Crear el contacto si no existe |
| POST | `/api/reservas` | Enviar solicitud de reserva |

El backend debe permitir CORS para el origen del frontend. `request` usa `fetch`, contenido JSON y timeout de 10 segundos. `embeddedList` acepta listas directas o listas incluidas en una respuesta HAL.

El cuerpo de la reserva contiene `usuarioId`, `rutaId`, `cantidadPersonas`, `fechaReserva`, `necesitaGuia` y `equipamientos`, con `equipamientoId` y `cantidad: 1` por selección. La respuesta de creación debe incluir `id` para que la pantalla anuncie la reserva creada.

El API no sincroniza automáticamente las cuentas de login locales ni el catálogo administrado. Tampoco hay en esta carpeta un comando para iniciar el backend: ese servidor pertenece a otra implementación y necesita sus propias instrucciones.

## 17 Cómo continuar desarrollando

| Quiero cambiar | Dónde empezar |
| --- | --- |
| Colores y variables compartidas | `src/styles/tokens.css` |
| Estilos de secciones | `src/styles/global.css` |
| Texto y navegación de cabecera | `components/organisms/SiteHeader.jsx` |
| Pie del sitio | `components/organisms/SiteFooter.jsx` |
| Campo o botón reutilizable | `components/atoms/` y `molecules/FormField.jsx` |
| Reglas del registro | `utils/validation.js` y `organisms/RegistrationForm.jsx` |
| Datos iniciales de productos | `data/products.js` |
| Filtros y catálogo | `pages/Products.jsx`, `organisms/ProductFilters.jsx` |
| Descuentos y totales | `utils/cart.js` |
| Reglas y pantalla de reserva | `utils/validation.js`, `pages/Reservation.jsx` |
| Peticiones HTTP | `services/api.js` |
| Persistencia de cuentas | `services/accounts.js` |
| Nueva pantalla | `pages/` y ruta en `App.jsx` |
| Imagen | Archivo en `public/img/` y referencia `/img/nombre.ext` |

Para una pantalla nueva, crea su página, compón una plantilla y reutiliza organismos, moléculas y átomos existentes. Conecta servicios desde la página o capa apropiada y entrega datos y callbacks por props a los controles. Agrega la ruta y, si corresponde, un enlace de navegación. Verifica arquitectura, comportamiento y build.

El trabajo actual se realiza sobre `src/`. El código antiguo y el script de migración fueron retirados; reutiliza las capas Atomic para las nuevas funciones.

## 18 GitHub colaboración y entrega

Los siguientes comandos son instrucciones para el integrante del equipo, no acciones automáticas. Revisa tus cambios antes de guardarlos.

### Actualizar una copia existente

Desde la raíz del repositorio y sin cambios locales pendientes:

```powershell
git switch main
git pull --ff-only origin main
cd frontend
npm ci
```

Si ya estás dentro de `frontend`, no repitas `cd frontend`. Git encuentra el repositorio padre; npm necesita la carpeta que contiene `package.json`.

### Guardar y subir documentación

Desde `frontend`, después de revisar este manual y los cambios que quieras incluir:

```powershell
git status
git add docs/MANUAL-COMPLETO-DEL-PROYECTO.md
git commit -m "Agrega manual de arquitectura uso y pruebas"
git push origin main
```

Ese ejemplo supone que estás en `main`, que el remoto permite ese flujo y que quieres publicar ese archivo. Si el equipo utiliza revisión por ramas, sigue su acuerdo de colaboración. No uses `git add .` sin revisar qué incluirá.

### Generar entrega

```powershell
npm run package:delivery
```

El ZIP se escribe en `entrega/Voy-y-Vuelvo-EP2.zip`; `entrega/files.json` enumera sus archivos. El empaquetador excluye dependencias, Git, build, cobertura, temporales, su propia carpeta de salida, `.env` y archivos `.local`.

Si agregas documentación después de generar un ZIP, debes regenerarlo para incluirla. El ZIP de entrega no necesita subirse como fuente al repositorio. No vuelvas a incluir el antiguo `frontend.zip`, que provocó el rechazo por tamaño durante el primer intento de publicación.

Para alojar `dist` en un servidor estático debes configurar la recuperación de `index.html` para URLs de la SPA. Ejecutar el build local no publica la página en Internet. Los HTML de compatibilidad no sustituyen esa configuración para todas las rutas profundas.

## 19 Problemas frecuentes

### npm ci muestra EPERM en Rolldown

En Windows puede quedar bloqueado `rolldown-binding.win32-x64-msvc.node` mientras un proceso lo está usando. Detén Vite y Vitest con Ctrl+C en sus terminales, cierra Show Preview y vuelve a intentar `npm ci`.

Si persiste, cierra VS Code y ejecuta la instalación desde una PowerShell nueva. Reiniciar Windows y ejecutar `npm ci` antes de abrir el proyecto también permite descartar un bloqueo de proceso. El mensaje EPERM puede corresponder a permisos u otra restricción del sistema; no implica por sí solo un error del código.

### Vite o Vitest no se reconoce

Si ocurrió después de un `npm ci` fallido, la instalación puede estar incompleta. Resuelve el bloqueo y termina `npm ci` correctamente antes de ejecutar scripts. No hace falta instalar Vite o Vitest globalmente.

### Show Preview queda en blanco o no conecta

Comprueba primero `npm run dev` y la dirección 127.0.0.1:5173. La redirección de Show Preview no inicia Vite por sí misma. Comprueba también que no haya un servidor de otro proyecto ocupando ese puerto.

### Cambié un dato inicial y la página muestra el anterior

El catálogo almacenado localmente puede tener prioridad sobre los datos iniciales. Comprueba la clave correspondiente del navegador o utiliza una ventana privada para comparar sin borrar tu información habitual.

### La reserva no queda confirmada

Sin `VITE_API_URL`, eso es el funcionamiento previsto: se guarda borrador. Con API, revisa conectividad, CORS, contrato y respuesta con identificador. La configuración de una URL no garantiza que el backend exista o funcione.

### Git dice que hay una fusión en curso

Ejecuta `git status` antes de iniciar otra fusión o cambiar de rama. Revisa y resuelve los archivos pendientes. `git add` marca una resolución; no comprueba que el código elegido sea correcto. Finaliza solo después de revisar y verificar el resultado.

### Cuánto tarda npm ci

Depende de la conexión, caché, antivirus y equipo. Si la terminal ya mostró `npm error` y devolvió el indicador PowerShell, terminó con error: esperar más no reanuda esa instalación.

## 20 Recorrido para presentar el proyecto

1. Explica el objetivo: turismo aventura, rutas de trekking y equipamiento para clientes chilenos y extranjeros.
2. Muestra `package.json` y diferencia React, Vite, Vitest y Testing Library.
3. Inicia `npm run dev` y abre la portada.
4. Recorre catálogo, ficha y carrito; aplica `AVENTURA10`.
5. En registro muestra el cambio RUT/pasaporte y las validaciones.
6. Inicia sesión como Administrador y muestra cómo un cambio del catálogo se refleja en la tienda.
7. Abre una ruta, selecciona arriendo y guarda un borrador explicando que no es una reserva confirmada.
8. En VS Code sigue la composición Register → plantillas → RegistrationForm → FormField → Input.
9. Abre `utils/cart.js` y su prueba `test/cart.test.js`; explica preparación, acción y comprobación.
10. Ejecuta una prueba por nombre y luego la suite completa. Para presentar cobertura, genera y abre el reporte.
11. Muestra `npm run check:architecture` y `npm run build`.
12. Explica el alcance local y las verificaciones pendientes de backend y producción.

Para mantener disponible la aplicación mientras ejecutas tests, usa dos terminales: una con Vite y otra para los comandos de verificación. Detén los procesos antes de reinstalar dependencias.

## 21 Documentación existente

| Archivo en docs | Qué consultar |
| --- | --- |
| `MANUAL-COMPLETO-DEL-PROYECTO.md` | Esta guía de arquitectura, instalación, uso y pruebas |
| `evaluacion/ANALISIS-Y-CRITERIOS.md` | Inventario de partida y relación con criterios de evaluación |
| `requisitos/ERS-EP2.md` | Requisitos y criterios de aceptación actualizados |
| `ATOMIC-DESIGN.md` | Reglas de capas y composición visual |
| `evaluacion/COBERTURA-TESTING.md` | Estrategia, resultados medidos, mocks y límites |
| `evaluacion/GUION-PRESENTACION.md` | Guion de exposición y casos centrales |
| `RECORRIDO-DE-REVISION.md` | URLs y pasos para revisar la aplicación |

El manual describe la implementación encontrada y distingue los resultados ya medidos de las comprobaciones que debes volver a ejecutar. Cuando se agreguen funciones o cambien pruebas, actualiza la sección correspondiente y conserva evidencia de los nuevos resultados.
