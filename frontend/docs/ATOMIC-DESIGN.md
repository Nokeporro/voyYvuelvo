# Atomic Design en Voy y Vuelvo

Actualización del 16 de octubre de 2026. La interfaz pública y el panel administrativo utilizan Atomic Design sobre React + Vite. La reorganización conserva las rutas, el registro con RUT o pasaporte, Bootstrap y el funcionamiento de Show Preview.

## Capas implementadas

| Capa | Ubicación | Responsabilidad y ejemplos |
| --- | --- | --- |
| Átomos | src/components/atoms | Once controles y elementos básicos: Button, AppLink, Input, Select, Textarea, Label, Heading, Text, Image, Badge y MountainIcon |
| Moléculas | src/components/molecules | Doce composiciones: FormField, Brand, ProductCard, RouteCard, BlogCard, CartItem, CouponForm, RentalOption, ConfirmationPrompt, SectionHeading, StatCard y TotalsSummary |
| Organismos | src/components/organisms | Veinticuatro bloques de interfaz: cabecera, pie, formularios, filtros, grillas, tablas, secciones de inicio y de Nosotros |
| Plantillas | src/components/templates | SiteTemplate, AdminTemplate, PageTemplate, SplitTemplate y ArticleTemplate; organizan las regiones de una vista |
| Páginas | src/pages y src/pages/admin | Contenido concreto de las rutas, datos, selección de registros, filtros y coordinación de los casos de uso |

Los átomos conservan las propiedades HTML necesarias para accesibilidad, eventos y estilos Bootstrap. FormField combina etiqueta, control, ayuda y error. Los organismos agrupan tareas completas; algunos formularios administran su estado local. Las páginas coordinan datos de dominio y suministran propiedades y callbacks a los componentes controlados.

## Ejemplo de composición del registro

```text
App y ruta /registro
  SiteTemplate
    SiteHeader → Brand → MountainIcon, AppLink, Text
    Register
      PageTemplate
        SplitTemplate
          Contenido de bienvenida
          RegistrationForm
            FormField → Label, Input o Select, Text
            Input de consentimiento, Label, Button
    SiteFooter
```

El mismo RegistrationForm se reutiliza en UserEditor del panel. Las reglas del RUT, pasaporte, país emisor y datos personales permanecen en utils/validation.js. El registro local permanece en services/accounts.js. Así el sistema de componentes no duplica esas reglas.

## Cobertura de las vistas

| Vista o área | Composición principal |
| --- | --- |
| Inicio | PageTemplate, HomeHero, RouteSearchForm, FeaturedRoutes, FeaturedProducts, AdventureInvite y BlogRecommendations |
| Productos | PageTemplate, ProductFilters, CardGrid y ProductCard |
| Detalle de producto | PageTemplate, SplitTemplate y ProductPurchaseForm |
| Rutas | PageTemplate, controles atómicos, CardGrid y RouteCard |
| Reserva | PageTemplate, SplitTemplate, RentalEquipmentList y ReservationForm |
| Carrito | PageTemplate, CartItem, CouponForm y TotalsSummary |
| Registro | PageTemplate, SplitTemplate y RegistrationForm |
| Login | PageTemplate y LoginForm; la página decide la navegación posterior |
| Contacto | PageTemplate, SplitTemplate y ContactForm |
| Nosotros | PageTemplate, AboutHero, AboutStory, AboutValues y AboutTeam |
| Blog | PageTemplate, BlogList y BlogCard |
| Artículos | PageTemplate y ArticleTemplate con contenido y átomos |
| Panel | AdminTemplate, páginas individuales, ProductsTable, UsersTable, ProductForm, RegistrationForm, ConfirmationPrompt y StatCard |
| Página inexistente | PageTemplate, Heading, Text y AppLink |

Se eliminaron los archivos que agrupaban vistas distintas: Catalog.jsx y Admin.jsx. Sus exportaciones ahora están en páginas individuales. Los antiguos Field.jsx, Cards.jsx y Layout.jsx se reemplazaron por los componentes de sus respectivas capas; no se mantienen adaptadores con las rutas antiguas.

## Reglas para continuar desarrollando

Las dependencias van de componentes de mayor composición a componentes más simples. Un átomo no importa moléculas; una molécula no importa organismos; ningún componente importa páginas. Los componentes del mismo nivel pueden componerse si no forman ciclos.

Átomos y moléculas reciben datos y acciones mediante props. No consultan servicios, datos iniciales ni el contexto de la aplicación. Los servicios HTTP, persistencia, contexto y validaciones siguen fuera de la clasificación visual. No es necesario convertir cada div, opción de select o celda de tabla en un componente.

Para una nueva pantalla, primero reutiliza los átomos y moléculas disponibles. Crea un organismo para un bloque con una responsabilidad clara; combina los organismos con una plantilla desde una página. Modifica App.jsx únicamente para registrar la ruta. Evita importar componentes mediante archivos de índice que oculten dependencias circulares.

Los tokens visuales comunes están en src/styles/tokens.css. src/styles.css conserva los estilos de componentes y los ajustes responsivos. Bootstrap se importa una sola vez en main.jsx.

## Comprobación automática

```sh
npm run check:architecture
npm run format:check
npm run test:coverage
npm run build
```

check:architecture revisa los imports relativos de src, identifica dependencias hacia capas superiores, ciclos, imports inexistentes, acceso a servicios/contexto/datos desde átomos o moléculas y controles básicos que eludan los átomos. También exige que cada página componga una plantilla. Es una comprobación estructural adaptada a los imports estáticos del proyecto; no sustituye la revisión de responsabilidades ni inspecciona imports dinámicos o aliases futuros.

atomic-design.test.jsx verifica contratos de botones, enlaces, campos accesibles, confirmación y selección de arriendo. Incluye casos que prueban el detector de dependencias inválidas y ciclos. La suite existente sigue comprobando registro, login, carrito, reservas y administración utilizando los componentes reorganizados.

Para revisar en el navegador, usa el recorrido de RECORRIDO-DE-REVISION.md. Atomic Design es una organización interna de la aplicación: las direcciones públicas se conservan y los conceptos de arquitectura no se agregan al flujo de compra del cliente.
