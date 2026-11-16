import Badge from "../atoms/Badge";
import AppLink from "../atoms/AppLink";
import Text from "../atoms/Text";
import Button from "../atoms/Button";
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Brand } from "../molecules/Brand.jsx";
export default function SiteHeader({ cart, session, onSignOut }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <header className="site-header">
      <div className="container navbar navbar-expand-xl py-3 gap-3">
        <Brand />
        <Button
          className="navbar-toggler ms-auto"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="navegacion"
          onClick={() => setOpen(!open)}
        >
          ☰
        </Button>
        <div
          id="navegacion"
          className={`navbar-collapse ${open ? "" : "collapse"}`}
        >
          <nav
            className="navbar-nav mx-auto gap-xl-3"
            aria-label="Navegación principal"
          >
            {[
              ["/", "Inicio"],
              ["/rutas", "Rutas"],
              ["/productos", "Productos"],
              ["/blogs", "Blogs"],
              ["/nosotros", "Nosotros"],
              ["/contacto", "Contacto"],
            ].map(([to, text]) => (
              <NavLink className="nav-link" key={to} to={to} end={to === "/"}>
                {text}
              </NavLink>
            ))}
          </nav>
          <div className="account-links d-flex align-items-center flex-wrap gap-3">
            {session ? (
              <>
                <Text as="span">Hola, {session.nombre}</Text>
                {session.rol !== "Cliente" && (
                  <AppLink to="/admin">Panel</AppLink>
                )}
                <Button className="btn btn-link p-0" onClick={onSignOut}>
                  Salir
                </Button>
              </>
            ) : (
              <>
                <AppLink to="/login">Iniciar sesión</AppLink>
                <AppLink to="/registro">Registrarse</AppLink>
              </>
            )}
            <AppLink
              className="cart-link"
              to="/carrito"
              aria-label={`Carrito, ${cart.reduce((sum, i) => sum + i.cantidad, 0)} unidades`}
            >
              ♧ Carrito{" "}
              <Badge className="badge rounded-pill text-bg-warning">
                {cart.reduce((sum, i) => sum + i.cantidad, 0)}
              </Badge>
            </AppLink>
          </div>
        </div>
      </div>
    </header>
  );
}
