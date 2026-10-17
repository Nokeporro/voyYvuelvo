# Cobertura de testing de Voy y Vuelvo

Evaluación Parcial 2 de DSY1104. Ejecución verificada el 15 de octubre de 2026 con Vitest 5.0.5, jsdom, React Testing Library y cobertura V8. Vitest sustituye las referencias a Jasmine y Karma por instrucción del usuario.

## Resultados medidos

`npm run test:coverage`: **87 pruebas aprobadas en siete archivos**, sin fallos. Duración observada: 16,31 segundos. `npm run build`: compilación de producción aprobada.

| Métrica | Cubiertos | Total | Cobertura |
| --- | --- | --- | --- |
| Sentencias | 497 | 574 | 86,58% |
| Ramas | 352 | 431 | 81,67% |
| Funciones | 156 | 182 | 85,71% |
| Líneas | 461 | 525 | 87,80% |

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

Las pruebas con parámetros cuentan varias entradas de un mismo escenario. Los diez casos centrales para exposición están identificados en GUION-PRESENTACION.md; la suite completa agrega límites y regresiones.

## Configuración y método

vite.config.js comparte el plugin React y define jsdom, setup, restauración de mocks y reportes text/html/json-summary. setup.js limpia el DOM, localStorage y sessionStorage antes o después de cada caso y simula scrollTo. No hay dependencia del estado de otro test.

Los casos siguen Arrange, Act, Assert. Las reglas puras reciben entradas y verifican salidas o errores. Los componentes se montan dentro de MemoryRouter y StoreProvider; user-event escribe, selecciona y pulsa controles. Se observan resultados del DOM mediante roles, etiquetas, mensajes y estados accesibles.

Los mocks de fetch con vi.fn y vi.stubGlobal devuelven respuestas controladas para HTTP exitoso, error 503, contenido vacío, lista HAL y creación de contacto. Se inspecciona el body de POST para comprobar IDs, personas, fecha y equipamiento. No se realizan reservas ni envíos a terceros. Los errores de persistencia se simulan con una dependencia que lanza una excepción.

## Interpretación y límites

Las reglas de carrito y validación tienen 100% de sentencias y líneas en esta ejecución. El registro alcanza 97,72% de líneas; la administración, 86,45%. Los servicios alcanzan 98,18% de líneas. Estos resultados sostienen la verificación de los flujos principales y permiten localizar ramas pendientes.

Reservation.jsx conserva ramas sin ejecutar para la carga remota del componente, confirmación HTTP y recuperación/fallo de borrador. Su cobertura de líneas es 53,03%; el servicio de envío se prueba por separado con mocks. Store.jsx tiene 71,42% de líneas y baja cobertura de ramas, especialmente sincronización entre pestañas y errores de actualización. Algunos alias HTML, permisos administrativos y fallos de cuota tienen casos pendientes. No se afirma cobertura exhaustiva.

jsdom no verifica geometría, colores o layout real de Bootstrap. La revisión visual anterior comprobó inicio de escritorio y registro móvil de 390 px sin desbordamiento horizontal. La corrección final de Show Preview se verificó por pruebas de su entrada y respuestas HTTP 200; no se pudo inspeccionar visualmente el panel de VS Code en esa sesión porque el control nativo no estaba disponible.

No se verificaron un backend real, autorización de servidor, pagos, correo entregado, autenticidad de documentos, pruebas de carga ni todos los navegadores. No deben presentarse los mocks como evidencia de reservas persistidas en producción.

## Reproducir

Ejecutar npm ci, npm test y npm run test:coverage. Revisar fallos antes de interpretar métricas; consultar las líneas no cubiertas en el reporte HTML. Ejecutar npm run build antes de entregar y conservar package-lock.json. Cualquier cambio posterior requiere volver a ejecutar los casos afectados y actualizar este documento si modifica el resultado reportado.
