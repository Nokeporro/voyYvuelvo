import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SiteTemplate from "./components/templates/SiteTemplate.jsx";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Reservation from "./pages/Reservation";
import About from "./pages/About";
import Blog from "./pages/Blog";
import ArticleOne from "./pages/ArticleOne";
import ArticleTwo from "./pages/ArticleTwo";
import { Products } from "./pages/Products.jsx";
import { ProductDetail } from "./pages/ProductDetail.jsx";
import { RoutesCatalog } from "./pages/RoutesCatalog.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import { AdminTemplate } from "./components/templates/AdminTemplate.jsx";
import { Dashboard } from "./pages/admin/Dashboard.jsx";
import { AdminProducts } from "./pages/admin/AdminProducts.jsx";
import { ProductEditor } from "./pages/admin/ProductEditor.jsx";
import { AdminUsers } from "./pages/admin/AdminUsers.jsx";
import { UserEditor } from "./pages/admin/UserEditor.jsx";
function LegacyRedirect() {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const aliases = {
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
    "/admin/index.html": "/admin",
    "/admin/productos-listado.html": "/admin/productos",
    "/admin/usuarios-listado.html": "/admin/usuarios",
    "/admin/producto-nuevo.html": "/admin/productos/nuevo",
    "/admin/usuario-nuevo.html": "/admin/usuarios/nuevo",
  };
  let target = aliases[pathname];
  if (pathname === "/detalle-producto.html")
    target = `/productos/${params.get("id") || 1}`;
  if (pathname === "/reserva-ruta.html")
    target = `/rutas/${params.get("ruta") || 1}`;
  if (pathname === "/admin/producto-editar.html") target = "/admin/productos";
  if (pathname === "/admin/usuario-editar.html") target = "/admin/usuarios";
  return target ? <Navigate to={`${target}${search}`} replace /> : <NotFound />;
}
export default function App() {
  return (
    <Routes>
      <Route element={<SiteTemplate />}>
        <Route index element={<Home />} />
        <Route path="registro" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="productos" element={<Products />} />
        <Route path="productos/:id" element={<ProductDetail />} />
        <Route path="rutas" element={<RoutesCatalog />} />
        <Route path="rutas/:id" element={<Reservation />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="nosotros" element={<About />} />
        <Route path="blogs" element={<Blog />} />
        <Route path="blogs/1" element={<ArticleOne />} />
        <Route path="blogs/2" element={<ArticleTwo />} />
        <Route path="admin" element={<AdminTemplate />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="productos/nuevo" element={<ProductEditor />} />
          <Route path="productos/:id" element={<ProductEditor />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="usuarios/nuevo" element={<UserEditor />} />
          <Route path="usuarios/:id" element={<UserEditor />} />
        </Route>
        <Route path="*" element={<LegacyRedirect />} />
      </Route>
    </Routes>
  );
}
