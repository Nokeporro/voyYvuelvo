# Análisis del proyecto y criterios de evaluación

Fecha de revisión: 15 de octubre de 2026. Proyecto: Voy y Vuelvo. Fuente de evaluación: DSY1104 Evaluación Parcial 2, páginas 3 a 9. La instrucción del usuario adapta Jasmine y Karma a Vitest y fija React + Vite como stack.

## Diagnóstico del punto de partida

El proyecto contenía 20 páginas HTML: 13 públicas y siete administrativas. Tenía 14 scripts de JavaScript, una hoja CSS compartida, 19 imágenes y una ERS de la primera entrega en Word. No había package.json, componentes React, configuración de build ni pruebas automatizadas. La copia conservada en `legacy/` permite contrastar el resultado con esa versión.

| Área original | Comportamiento observado | Resultado de la migración |
| --- | --- | --- |
| Inicio, rutas y productos | HTML repetido y filtros manipulando el DOM | Componentes React, filtros con estado y navegación Router |
| Cabecera y pie | Marcado repetido por página | Layout común con Outlet |
| Tarjetas y destacados | Contenido e imágenes en HTML | Props route/product y catálogo compartido |
| Registro público | RUN obligatorio; solo validaba y no creaba cuenta | RUT o pasaporte, país emisor, cuenta local y errores accesibles |
| Login público | Solo validaba correo/contraseña | Acceso a cuentas locales y cuentas de demostración |
| Correo y contraseña | Dominio restringido y 4 a 10 caracteres | Correo internacional válido, contraseña de 8 a 64 y confirmación |
| Regiones y comunas | Estructura region en datos y nombre en administrador | Un solo catálogo y selector dependiente compartido |
| Productos admin | Lista distinta del catálogo público | Una fuente de estado y persistencia para ambos |
| Usuarios admin | Contraseñas en claro y verificación RUN desactivada | Formulario compartido; hash local y validación RUT uniforme |
| Carrito | IDs y cantidades persistidos; stock y eventos globales | Contexto React, límites de stock y misma clave pública de almacenamiento |
| Reservas | API fija en localhost:8080 y respaldo de datos | URL de API por entorno; error, borrador recuperable y confirmación diferenciados |
| Contacto | Validación sin envío | Validación y guardado local explícito, sin promesa de envío |
| Nosotros y blog | Contenido editorial estático | Contenido convertido a JSX dentro del layout compartido |
| Menú y carruseles | Listeners y temporizadores en scripts | Menú con estado; tarjetas con imagen principal, sin rotación automática |
| Calidad | Sin ejecución automatizada | Vitest, jsdom, Testing Library, mocks y cobertura V8 |

## Arquitectura de la solución

`main.jsx` monta React, Bootstrap, BrowserRouter y StoreProvider. `App.jsx` define las páginas y las rutas anidadas del panel. Layout comparte navegación y pie. Los formularios usan estado controlado; Field recibe etiquetas, valores, mensajes y manejadores mediante props.

StoreProvider centraliza productos, carrito y sesión. Las operaciones actualizan arrays de manera inmutable y persisten antes de publicar el nuevo estado. La tienda consulta el mismo catálogo que modifica el panel. `storage` sincroniza cambios de catálogo y carrito entre pestañas del mismo origen.

Los servicios separan Web Storage, cuentas académicas y fetch. Las reglas puras de validación y carrito se prueban sin renderizar la interfaz. Las pruebas de componentes verifican cambios visibles en el DOM después de acciones del usuario.

## Matriz de la rúbrica

| Indicador | Peso | Evidencia concreta |
| --- | --- | --- |
| IE2.1.1 Proyecto con framework JS | 10% | React + Vite, src organizado, scripts de desarrollo y build, rutas y servicios |
| IE2.1.2 Props, estado y Bootstrap | 10% | RouteCard/ProductCard, Field, RegistrationForm, StoreProvider, Grid con col-md y col-lg, menú móvil |
| IE2.2.1 Pruebas de lógica y comportamiento | 12% | Más de diez casos con Vitest; validación, interacción DOM, persistencia y HTTP simulado |
| IE2.3.1 Proceso de testeo | 8% | Setup jsdom, limpieza entre pruebas, mocks de fetch, reporte de cobertura y documentación de límites |
| IE2.1.3 Explicación del diseño | 15% | README, diagnóstico, diagrama conceptual de dependencias y guion de exposición |
| IE2.1.4 Demostración de componentes | 20% | Recorrido de registro condicional, filtros, carrito, edición de productos y Grid responsivo |
| IE2.2.2 Demostración de diez pruebas | 15% | Diez escenarios seleccionados en GUION-PRESENTACION y pruebas ejecutables |
| IE2.3.2 Explicación del testeo | 10% | Documento de cobertura con entorno, Arrange/Act/Assert, mocks, resultados y limitaciones |

La implementación aporta evidencias para los indicadores técnicos. Los puntos de presentación dependen de la defensa individual de cada estudiante y de la evaluación del docente.

## Entregables y condiciones externas

El código, lockfile, configuración de pruebas, ERS y cobertura se incluyen en el proyecto. El comprimido se genera con `npm run package:delivery` cuando estén disponibles los scripts de entrega. No incluye node_modules ni dist; se reconstruyen con npm ci y npm run build.

El enlace público de GitHub queda pendiente de publicar en el repositorio del equipo. La carpeta de trabajo no expuso un repositorio Git utilizable en esta sesión, por lo que no se inventa una URL, historial o commit. La carga en AVA, la fecha docente, la identificación de integrantes y la exposición son acciones del equipo.

## Límites funcionales y decisiones registradas

La etapa implementa un frontend académico. Autenticación y roles locales no protegen información contra alguien con acceso al navegador. El hash con salt evita persistir la contraseña literal y no equivale a una arquitectura de autenticación productiva. Pasaportes se validan por formato, sin consulta a organismos emisores.

Las reservas reales dependen del backend configurado; no se modificó código del backend fuera de esta carpeta. El API original identifica contactos por email y no recibe el documento de las cuentas locales. Sin API no se generan reservas confirmadas. Contacto y carrito no transmiten pagos ni mensajes externos.

El catálogo regional conserva las 16 regiones y un conjunto de comunas de ejemplo del proyecto original; no representa un catálogo oficial exhaustivo. La clasificación de rutas, cupos y arriendos es material de demostración.
