import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useStore } from "../context/Store";
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Voy y Vuelvo, inicio">
      <svg
        width="42"
        height="38"
        viewBox="0 0 48 40"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 35 18 8 25 20 31 5 46 35Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="m12 19 6 3 4-5M25 17l6 5 5-6"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <span>
        Voy <b>&amp;</b> Vuelvo
      </span>
    </Link>
  );
}
export default function Layout() {
  const [open, setOpen] = useState(false);
  const { cart, session, signOut } = useStore();
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo?.(0, 0);
    document.title = `Voy & Vuelvo | ${pathname === "/" ? "Turismo aventura" : pathname.split("/")[1]}`;
  }, [pathname]);
  return (
    <>
      <a className="visually-hidden-focusable skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="container navbar navbar-expand-xl py-3 gap-3">
          <Brand />
          <button
            className="navbar-toggler ms-auto"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="navegacion"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
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
                  <span>Hola, {session.nombre}</span>
                  {session.rol !== "Cliente" && <Link to="/admin">Panel</Link>}
                  <button className="btn btn-link p-0" onClick={signOut}>
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Iniciar sesión</Link>
                  <Link to="/registro">Registrarse</Link>
                </>
              )}
              <Link
                className="cart-link"
                to="/carrito"
                aria-label={`Carrito, ${cart.reduce((sum, i) => sum + i.cantidad, 0)} unidades`}
              >
                ♧ Carrito{" "}
                <span className="badge rounded-pill text-bg-warning">
                  {cart.reduce((sum, i) => sum + i.cantidad, 0)}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main id="contenido">
        <Outlet />
      </main>
      <footer className="site-footer mt-5">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-5">
              <Brand />
              <p className="mt-3">
                Descubre nuevos caminos, prepara tu equipo
                <br />y disfruta de la naturaleza.
              </p>
              <small>Explora con respeto. Vuelve con historias.</small>
            </div>
            <nav
              className="col-6 col-md-3 d-flex flex-column gap-2"
              aria-label="Explora"
            >
              <h2 className="h6">Explora</h2>
              <Link to="/rutas">Rutas de trekking</Link>
              <Link to="/productos">Equipamiento</Link>
              <Link to="/blogs">Consejos y experiencias</Link>
            </nav>
            <nav
              className="col-6 col-md-4 d-flex flex-column gap-2"
              aria-label="Tu cuenta"
            >
              <h2 className="h6">Tu próxima aventura</h2>
              <Link to="/registro">Crear cuenta con RUT o pasaporte</Link>
              <Link to="/contacto">Contáctanos</Link>
              <Link to="/nosotros">Conoce nuestro equipo</Link>
            </nav>
          </div>
          <hr className="my-4" />
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <small>© 2026 Voy &amp; Vuelvo</small>
            <small>Proyecto académico · Turismo aventura en Chile</small>
          </div>
        </div>
      </footer>
    </>
  );
}
