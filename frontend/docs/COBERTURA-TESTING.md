# Cobertura de testing de Voy y Vuelvo

Evaluación Parcial 2 de DSY1104. Ejecución verificada el 16 de octubre de 2026 tras integrar Atomic Design, con Vitest 5.0.5, jsdom, React Testing Library y cobertura V8. Vitest sustituye las referencias a Jasmine y Karma por instrucción del usuario.

## Resultados medidos

`npm run test:coverage`: **97 pruebas aprobadas en ocho archivos**, sin fallos. Duración observada: 16,56 segundos. `npm run build`: compilación de producción aprobada. `npm run check:architecture`: dependencias válidas, sin ciclos ni imports hacia capas superiores.

| Métrica | Cubiertos | Total | Cobertura |
| --- | --- | --- | --- |
| Sentencias | 556 | 634 | 87,69% |
| Ramas | 385 | 464 | 82,97% |
| Funciones | 210 | 237 | 88,60% |
| Líneas | 520 | 585 | 88,88% |

Las cifras provienen de coverage/coverage-summary.json. El reporte HTML se genera en coverage/index.html. Las métricas corresponden al código instrumentado del reporte, no al porcentaje de requisitos cumplidos. Las pruebas de la entrada de Show Preview ejecutan su fuente con un entorno simulado y no suman cobertura instrumentada de ese archivo.

## Alcance y casos

| Archivo | Alcance verificado |
| --- | --- |
| validation.test.js | RUT con/sin formato, K, dígitos erróneos, correo internacional, campos obligatorios, pasaporte/país, comuna, contraseñas, consentimiento, fecha real futura y cupos |
| cart.test.js | Acumulación sin mutación, stock, cantidades inválidas, producto desconocido, depuración de datos corruptos/duplicados, cupón y total |
| services.test.js | JSON corrupto, cuota de almacenamiento, creación/acceso/edición/eliminación de cuentas, duplicados, países distintos, roles demo, HTTP, HAL y payload de reservas |
| components.test.jsx | Cambio RUT/pasaporte, foco y errores accesibles, envío válido y fallo de persistencia, comuna dependiente, filtros, carrito, menú, navegación, contacto y borrador de reserva |
| admin.test.jsx | Login/logout, credenciales incorrectas, acceso cliente, límites del vendedor, CRUD de catálogo compartido y edición/eliminación de usuarios con pasaporte |
| pages.test.jsx | Páginas editoriales conservadas y búsqueda de inicio |
| preview.test.js | Redirección desde Live Preview a Vite, preservación de parámetros/hash, prefijo de carpeta y carga React al procesar con Vite |
| atomic-design.test.jsx | Contratos de botones, enlaces, campos accesibles, confirmación y selección de arriendo; detección de dependencias hacia capas superiores y ciclos |

Las pruebas con parámetros cuentan varias entradas de un mismo escenario. Los diez casos centrales para exposición están identificados en GUION-PRESENTACION.md; la suite completa agrega límites y regresiones.

## Configuración y método

vite.config.js comparte el plugin React y define jsdom, setup, restauración de mocks y reportes text/html/json-summary. setup.js limpia el DOM, localStorage y sessionStorage antes o después de cada caso y simula scrollTo. No hay dependencia del estado de otro test.

Los casos siguen Arrange, Act, Assert. Las reglas puras reciben entradas y verifican salidas o errores. Los componentes se montan dentro de MemoryRouter y StoreProvider; user-event escribe, selecciona y pulsa controles. Se observan resultados del DOM mediante roles, etiquetas, mensajes y estados accesibles.

Los mocks de fetch con vi.fn y vi.stubGlobal devuelven respuestas controladas para HTTP exitoso, error 503, contenido vacío, lista HAL y creación de contacto. Se inspecciona el body de POST para comprobar IDs, personas, fecha y equipamiento. No se realizan reservas ni envíos a terceros. Los errores de persistencia se simulan con una dependencia que lanza una excepción.

## Interpretación y límites

Las reglas de carrito y validación tienen 100% de sentencias y líneas en esta ejecución. RegistrationForm alcanza 97,67% de líneas; las páginas de administración, 89,74%. Los servicios alcanzan 98,18% de líneas. Estos resultados sostienen la verificación de los flujos principales y permiten localizar ramas pendientes.

Reservation.jsx conserva ramas sin ejecutar para la carga remota del componente, confirmación HTTP y recuperación/fallo de borrador. Su cobertura de líneas es 51,61%; el servicio de envío se prueba por separado con mocks. ProductForm tiene 50% de líneas y necesita ampliar escenarios de selección y edición. Store.jsx tiene 71,42% de líneas y baja cobertura de ramas, especialmente sincronización entre pestañas y errores de actualización. Algunos alias HTML, permisos administrativos y fallos de cuota tienen casos pendientes. No se afirma cobertura exhaustiva.

jsdom no verifica geometría, colores o layout real de Bootstrap. Tras la reorganización se inspeccionaron el registro y la portada en navegador. En registro móvil de 390 px se detectó y corrigió el margen horizontal del Grid: el ancho desplazable y el ancho útil quedaron iguales en 375 px, considerando la barra de desplazamiento vertical. No se detectaron errores de consola al cargar la portada. La entrada de Show Preview conserva sus pruebas; el botón de VS Code no se inspeccionó nuevamente en esta actualización.

No se verificaron un backend real, autorización de servidor, pagos, correo entregado, autenticidad de documentos, pruebas de carga ni todos los navegadores. No deben presentarse los mocks como evidencia de reservas persistidas en producción.

## Reproducir

Ejecutar npm ci, npm test y npm run test:coverage. Revisar fallos antes de interpretar métricas; consultar las líneas no cubiertas en el reporte HTML. Ejecutar npm run build antes de entregar y conservar package-lock.json. Cualquier cambio posterior requiere volver a ejecutar los casos afectados y actualizar este documento si modifica el resultado reportado.
