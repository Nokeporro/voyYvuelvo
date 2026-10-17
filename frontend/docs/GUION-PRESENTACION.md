# Guion de presentación de la Evaluación Parcial 2

## Diseño y recorrido

Explica que Voy y Vuelvo atiende a personas de Chile y turistas extranjeros que preparan rutas de trekking. Presenta React + Vite como la adaptación solicitada y Bootstrap para el diseño responsivo. Toda mención a Jasmine y Karma de la guía se sustituye por Vitest.

Abre src/main.jsx y App.jsx. Identifica el montaje, Router, StoreProvider y SiteTemplate. Recorre las cinco capas de Atomic Design: Button como átomo, FormField y ProductCard como moléculas, RegistrationForm como organismo, SplitTemplate como plantilla y Register como página. En ProductCard.jsx y RouteCard.jsx muestra las props product y route. En RegistrationForm.jsx muestra el estado del formulario y cómo cambia la UI al escoger pasaporte. Explica que una actualización de estado vuelve a renderizar el componente sin escribir innerHTML.

En el navegador, recorre el registro RUT/pasaporte, filtra productos y agrega uno al carrito. Entra con la cuenta demo de administrador, modifica un producto y vuelve a verlo en la tienda. Después entra como vendedor y muestra que solo puede consultar. Aclara que los controles locales son académicos y que el servidor deberá autorizar las operaciones reales.

Muestra el Grid en pantalla ancha y en 390 px. Explica col-md-6, col-lg-7 y navbar-expand-xl. Abre una ruta, agrega arriendo, verifica el total y guarda un borrador. Identifica claramente la diferencia entre borrador y reserva creada por API.

## Diez casos centrales para demostrar

| Caso | Acción y evidencia | Archivo de prueba |
| --- | --- | --- |
| 1 | RUT correcto y dígito incorrecto | validation.test.js |
| 2 | Pasaporte y país emisor; sin comuna obligatoria | validation.test.js y components.test.jsx |
| 3 | Registro vacío: errores y foco accesible | components.test.jsx |
| 4 | Registro extranjero: datos válidos y confirmación | components.test.jsx |
| 5 | Cuenta duplicada y acceso con contraseña incorrecta | services.test.js |
| 6 | Búsqueda y filtro por dificultad | components.test.jsx |
| 7 | Agregado acumulado superior al stock | cart.test.js y components.test.jsx |
| 8 | Cupón, total y eliminación en DOM | components.test.jsx |
| 9 | Restricción de vendedor y edición de catálogo compartido | admin.test.jsx |
| 10 | Contrato de POST de reserva con fetch simulado | services.test.js |

Ejecuta `npm test` y explica Arrange, Act, Assert con un caso: preparar catálogo de stock 3, agregar dos unidades cuando ya hay dos, esperar error y verificar que el estado anterior no fue mutado.

## Proceso de testeo

Muestra vite.config.js: jsdom simula el navegador, setup.js agrega matchers y limpia DOM/almacenamiento, y coverage-v8 genera los reportes. Testing Library consulta por roles y etiquetas para verificar comportamiento visible. user-event simula interacciones; vi.fn y vi.stubGlobal controlan fetch para observar el payload sin enviar datos a un servidor.

Ejecuta `npm run test:coverage`. Abre coverage/index.html y explica la diferencia entre líneas, sentencias, ramas y funciones. No presentes un porcentaje de líneas como prueba de que todos los casos de negocio o navegadores funcionan. Señala las rutas no cubiertas del reporte y los límites del documento de testing.

Cada integrante debe poder explicar una propiedad, un estado, una regla, un mock y una limitación de la solución. El repositorio y los documentos apoyan la exposición; la demostración individual determina los indicadores de presentación.
