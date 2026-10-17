import Text from "../atoms/Text";
import Heading from "../atoms/Heading";

import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useStore } from "../../context/Store.jsx";

export function AdminTemplate() {
  const { session } = useStore();
  if (!session) return <Navigate to="/login" replace />;
  if (!["Administrador", "Vendedor"].includes(session.rol))
    return (
      <div className="container py-5">
        <Heading as="h1">Acceso restringido</Heading>
        <Text>Este panel está disponible para personal autorizado.</Text>
      </div>
    );
  return (
    <div className="container py-5">
      <Text as="span" className="eyebrow">
        Panel de {session.rol}
      </Text>
      <nav
        className="d-flex flex-wrap gap-3 py-3 mb-4 border-bottom"
        aria-label="Administración"
      >
        <NavLink to="/admin" end>
          Resumen
        </NavLink>
        <NavLink to="/admin/productos">Productos</NavLink>
        {session.rol === "Administrador" && (
          <NavLink to="/admin/usuarios">Usuarios</NavLink>
        )}
      </nav>
      <Outlet />
    </div>
  );
}
