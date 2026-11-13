// El router y el build comparten los accesos de la primera entrega.
export const legacyHtmlRoutes = {
  "/index.html": "/",
  "/registro.html": "/registro",
  "/login.html": "/login",
  "/productos.html": "/productos",
  "/rutas.html": "/rutas",
  "/carrito.html": "/carrito",
  "/blogs.html": "/blogs",
  "/nosotros.html": "/nosotros",
  "/contacto.html": "/contacto",
  "/detalle-blog-1.html": "/blogs/1",
  "/detalle-blog-2.html": "/blogs/2",
  "/detalle-producto.html": "/productos/1",
  "/reserva-ruta.html": "/rutas/1",
  "/admin/index.html": "/admin",
  "/admin/productos-listado.html": "/admin/productos",
  "/admin/usuarios-listado.html": "/admin/usuarios",
  "/admin/producto-nuevo.html": "/admin/productos/nuevo",
  "/admin/usuario-nuevo.html": "/admin/usuarios/nuevo",
  "/admin/producto-editar.html": "/admin/productos",
  "/admin/usuario-editar.html": "/admin/usuarios",
};

export function resolveLegacyPath(pathname, search) {
  const params = new URLSearchParams(search);
  if (pathname === "/detalle-producto.html")
    return `/productos/${params.get("id") || 1}`;
  if (pathname === "/reserva-ruta.html")
    return `/rutas/${params.get("ruta") || 1}`;
  return Object.hasOwn(legacyHtmlRoutes, pathname)
    ? legacyHtmlRoutes[pathname]
    : undefined;
}
