# Especificación de requisitos de Voy y Vuelvo

Versión 2.0. Fecha: 15 de octubre de 2026. Asignatura DSY1104 Desarrollo Fullstack II. Estado: propuesta e implementación frontend para Evaluación Parcial 2. Validación académica pendiente del equipo y docente.

## 1 Introducción

Esta versión actualiza el alcance descrito en `ERS-Voy-y-Vuelvo-completado.docx` de la primera entrega. El sistema utiliza React + Vite, Bootstrap y Vitest. Está orientado a personas chilenas y visitantes extranjeros interesados en turismo aventura, trekking y equipamiento.

El objetivo es permitir explorar rutas, preparar una reserva, consultar equipamiento, gestionar un carrito y crear una cuenta con RUT o pasaporte. La entrega demuestra procesos frontend y pruebas de componentes. La disponibilidad comercial, cobros, identidad oficial y autenticación productiva quedan fuera del alcance de esta versión.

Definiciones: RF significa requisito funcional; RNF, requisito no funcional; RUT, identificador chileno con dígito verificador; SPA, aplicación navegable con un montaje React; mock, sustituto controlado de una dependencia para pruebas.

## 2 Descripción general

El frontend se ejecuta en navegador mediante el servidor de Vite o una compilación estática con reescritura a index.html. Persistencia local: productos, carrito, cuentas, mensajes de demostración y borradores. Sesión: sessionStorage. El backend de reservas es opcional y se define con VITE_API_URL.

| Actor | Funciones |
| --- | --- |
| Visitante | Explorar inicio, catálogo, rutas, blog y nosotros; utilizar carrito, contacto y registro |
| Cliente | Acceder a su cuenta local y precargar contacto de reserva |
| Vendedor | Consultar resumen y productos del panel sin modificarlos ni acceder a usuarios |
| Administrador | Crear, editar y eliminar productos y usuarios de demostración |

Los roles se aplican como comportamiento de la interfaz. Su autorización segura deberá implementarse en servidor antes de usar datos reales. El registro público asigna siempre el rol Cliente.

Dependencias: Node.js compatible con Vite, npm, navegador moderno con Web Crypto y Web Storage; para reservas reales, API disponible con contrato compatible y CORS. Las tipografías de Google Fonts tienen fallback sans-serif si no hay conexión.

## 3 Requisitos funcionales y aceptación

| ID | Requisito | Criterio de aceptación |
| --- | --- | --- |
| RF01 | Compartir navegación y pie en todas las vistas | Cambiar de página actualiza el contenido y el enlace activo; el menú móvil abre y cierra |
| RF02 | Buscar productos por nombre/categoría y dificultad | El listado cambia con los filtros y muestra su cantidad o estado vacío |
| RF03 | Mostrar ficha de producto | Nombre, imagen, descripción, precio CLP y stock corresponden al ID; ID desconocido muestra error |
| RF04 | Agregar productos al carrito | Solo cantidades enteras positivas cuya suma no supere el stock |
| RF05 | Mantener carrito al recargar | Se conservan IDs y cantidades; artículos inexistentes, agotados o corruptos se depuran |
| RF06 | Modificar y eliminar elementos | Cambios actualizan cantidad, contador y total; vaciado muestra estado vacío |
| RF07 | Aplicar cupón | AVENTURA10 reduce 10% del subtotal redondeado a peso entero; otro código informa error |
| RF08 | Elegir RUT o pasaporte al registrarse | El tipo cambia etiqueta, ayuda y campos requeridos; se limpia identificación anterior |
| RF09 | Validar RUT | Aceptar 7 u 8 dígitos de cuerpo y dígito 0-9/K, con o sin formato; comprobar módulo 11 y rechazar cuerpo cero |
| RF10 | Registrar pasaporte | Exigir de 5 a 20 letras/números y país emisor no vacío de hasta 80 caracteres |
| RF11 | Identificar duplicados | Rechazar mismo correo; rechazar mismo tipo, número normalizado y país emisor; permitir igual número con país distinto |
| RF12 | Validar datos de contacto | Nombre hasta 50, apellidos hasta 100, correo válido hasta 100, teléfono internacional de formato admitido y alojamiento hasta 300 |
| RF13 | Adaptar residencia | Con RUT exigir región y comuna relacionada; con pasaporte aceptar alojamiento sin exigir región/comuna |
| RF14 | Validar credenciales y consentimiento | Contraseña de 8 a 64, confirmación coincidente y consentimiento marcado; no guardar cuentas inválidas |
| RF15 | Crear cuenta y acceder | Guardar cuenta local y permitir login con su correo/contraseña; mostrar error para credenciales inválidas |
| RF16 | Cerrar sesión | Eliminar sesión de la pestaña y actualizar opciones visibles; visitantes no acceden al panel |
| RF17 | Administrar catálogo | Administrador crea códigos únicos de al menos 3 caracteres, edita/elimina; tienda y carrito reflejan el mismo catálogo |
| RF18 | Validar producto | Nombre hasta 100, descripción hasta 500, precio CLP, stock y stock crítico enteros no negativos; categoría e imagen del catálogo |
| RF19 | Administrar usuarios | Administrador reutiliza reglas RUT/pasaporte y asigna rol; edición requiere nueva contraseña y confirmación |
| RF20 | Consultar y filtrar rutas | Buscar destino/región y categorías; mostrar duración, dificultad, precio e imagen |
| RF21 | Preparar reserva | Exigir contacto válido, fecha real posterior a hoy y entre 1 y cupoMaximo personas |
| RF22 | Calcular ruta y arriendo | Total igual a precio por persona multiplicado por personas más un arriendo por artículo seleccionado |
| RF23 | Diferenciar confirmación y borrador | Sin API guardar solo borrador; con API confirmar únicamente si POST devuelve id; ante error informar y guardar borrador cuando sea posible |
| RF24 | Recuperar borrador | Restaurar selección para la misma ruta y pedir revisar vigencia de fecha y opciones |
| RF25 | Consultar contenido editorial | Nosotros, índice de blogs y dos detalles conservan contenido de la primera entrega |
| RF26 | Validar contacto | Nombre hasta 100, correo válido y mensaje hasta 500; guardar simulación e informar que no fue enviado |

La aceptación del RUT y del pasaporte comprueba formato y consistencia local. No certifica identidad, vigencia ni propiedad del documento. El país emisor se ingresa como texto; la unicidad compara mayúsculas/minúsculas, pero no homologa alias de países.

## 4 Requisitos no funcionales

| ID | Requisito verificable | Evidencia |
| --- | --- | --- |
| RNF01 | UI con React y componentes reutilizables | Layout, Field, tarjetas, formularios y StoreProvider |
| RNF02 | Diseño adaptable mediante Bootstrap | Grid de una columna en móvil, columnas md/lg y menú colapsable bajo xl |
| RNF03 | Retroalimentación accesible | Labels asociados, aria-invalid, aria-describedby, regiones status y foco del primer error de registro |
| RNF04 | Reglas locales sin recarga obligatoria | Filtros, formularios, carrito y cambios administrativos controlados por estado |
| RNF05 | Persistencia que informe fallos | Capturar JSON inválido y errores de cuota/bloqueo; no anunciar éxito si guardar falla |
| RNF06 | Proceso automatizado con Vitest | Pruebas de lógica, DOM, almacenamiento y API simulada con reporte V8 |
| RNF07 | Build reproducible | package-lock.json, npm ci y npm run build; sin dependencia de Live Server |
| RNF08 | Solicitudes acotadas | Timeout de 10 segundos y error explícito para respuestas no exitosas |
| RNF09 | Minimizar exposición de credenciales | No persistir contraseña literal de cuentas de usuario; no enviar documentos a API no definida |

No se establece una métrica de carga o disponibilidad de backend porque el servidor no se incluye en este alcance. La suite automatizada no acredita seguridad de producción ni compatibilidad con todos los navegadores.

## 5 Interfaces de comunicación y datos

Las interfaces públicas y administrativas están definidas en App.jsx. La API intercambia JSON y admite listas directas o HAL. POST /api/usuarios recibe nombre, email y teléfono. POST /api/reservas recibe usuarioId, rutaId, cantidadPersonas, fechaReserva, necesitaGuia y una lista equipamientos con equipamientoId/cantidad. La confirmación requiere un objeto con id.

| Clave de almacenamiento | Contenido |
| --- | --- |
| vv-react-products-v2 | Catálogo compartido |
| voy-vuelvo-carrito-v1 | IDs y cantidades, compatible con carrito público anterior |
| vv-react-users-v2 | Perfil, documento, país emisor, rol, salt y hash de contraseña |
| vv-react-session-v2 | Sesión de demostración en sessionStorage |
| voy-vuelvo-reserva-borrador | Selección pendiente, contacto y total estimado |
| voy-vuelvo-ultima-reserva | Última respuesta confirmada por API |
| vv-react-messages | Mensajes locales de demostración |

## 6 Verificación y límites

La trazabilidad técnica está en ANALISIS-Y-CRITERIOS.md. El alcance automatizado y las métricas medidas están en COBERTURA-TESTING.md. Las pruebas usan datos de demostración y mocks, sin efectuar reservas reales.

Quedan como evolución: autenticación y autorización de servidor, sincronización de cuentas y documentos con backend, validación oficial cuando corresponda, catálogo regional completo, capacidad de reservas por fecha, tarifas de guía, envío real de contacto y pagos. El equipo debe publicar el repositorio y presentar individualmente la solución conforme a la pauta.
