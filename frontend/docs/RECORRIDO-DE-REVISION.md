# Recorrido para revisar Voy y Vuelvo

Con Vite ejecutándose, abre http://127.0.0.1:5173/ en Show Preview. Usa el mismo navegador durante todo el recorrido, porque los datos de demostración se guardan por origen y navegador.

## 1 Inicio

Dirección: http://127.0.0.1:5173/

Revisa la portada, navegación común, rutas y equipamiento destacados. Reduce el ancho del panel para ver el menú móvil. Usa el buscador para filtrar destinos.

## 2 Registro chileno y extranjero

Dirección: http://127.0.0.1:5173/registro

Primero envía vacío para comprobar errores y foco. Selecciona RUT chileno: ejemplo de prueba 12.345.678-5. Escoge región y comuna; al cambiar de región se limpia la comuna.

Luego selecciona Pasaporte. Aparecen número y país emisor, y desaparecen los selectores obligatorios de región y comuna. Usa datos ficticios: pasaporte AB1234567, país Francia y alojamiento Hotel de prueba. Se admite correo internacional. Completa contraseña de al menos ocho caracteres, confirmación y consentimiento. La cuenta se crea en este navegador.

## 3 Inicio de sesión

Dirección: http://127.0.0.1:5173/login

Ingresa con la cuenta que acabas de registrar. Los datos del cliente ayudan a precargar el formulario de reserva. La autenticación es una demostración local.

## 4 Productos y carrito

Direcciones: http://127.0.0.1:5173/productos y http://127.0.0.1:5173/productos/1

Busca mochila, cambia el filtro de dificultad y abre una ficha. Agrega unidades y comprueba que la suma no pueda superar el stock.

Abre http://127.0.0.1:5173/carrito. Cambia cantidades, prueba AVENTURA10, elimina productos y recarga para comprobar persistencia. El descuento es 10%; no existe cobro ni pedido real.

## 5 Rutas y reserva

Direcciones: http://127.0.0.1:5173/rutas y http://127.0.0.1:5173/rutas/1

Filtra por destino o categoría. En una ruta, cambia personas y selecciona equipamiento para arrendar: el total debe cambiar. Usa fecha posterior a hoy. Sin API configurada, la acción guarda un borrador, no una reserva confirmada. Recupera ese borrador con el botón correspondiente.

## 6 Administración

Vuelve a http://127.0.0.1:5173/login. Si tienes sesión iniciada, usa Salir.

Cuenta de administrador de demostración: admin@duoc.cl. Contraseña: Demo2026!

Panel: http://127.0.0.1:5173/admin

Productos: http://127.0.0.1:5173/admin/productos

Usuarios: http://127.0.0.1:5173/admin/usuarios

Cambia el precio o nombre de un producto y vuelve al catálogo público: debe reflejar el mismo dato. En usuarios, comprueba que aparezca la cuenta creada con su tipo de documento y país emisor.

Cierra sesión y entra como vendedor@duoc.cl con Demo2026! para contrastar permisos. El vendedor consulta productos sin botones de modificación ni acceso a usuarios. Estos permisos de interfaz no sustituyen autorización de servidor.

## 7 Contenido y contacto

Blog: http://127.0.0.1:5173/blogs

Nosotros: http://127.0.0.1:5173/nosotros

Contacto: http://127.0.0.1:5173/contacto

Revisa ambos artículos del blog. En contacto prueba errores y un mensaje válido: el resultado informa que es una simulación local, sin envío de correo.

## 8 Evidencia técnica

Ejecuta npm test o npm run test:coverage. Última verificación: 87 pruebas aprobadas y 87,80% de líneas cubiertas del código instrumentado. El detalle y las ramas pendientes están en COBERTURA-TESTING.md. La compilación se comprueba con npm run build.

Para evaluar cumplimiento, consulta ANALISIS-Y-CRITERIOS.md y ERS-EP2.md. Falta publicar el enlace público de GitHub y realizar la presentación individual. La ERS de EP2 está en Markdown; el DOCX de la raíz conserva el documento histórico de EP1.
