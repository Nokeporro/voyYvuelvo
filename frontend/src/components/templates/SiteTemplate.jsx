import AppLink from "../atoms/AppLink";
import SiteHeader from "../organisms/SiteHeader.jsx";
import SiteFooter from "../organisms/SiteFooter.jsx";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useStore } from "../../context/Store.jsx";

export default function SiteTemplate() {
  const { cart, session, signOut } = useStore();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo?.(0, 0);
    document.title = `Voy & Vuelvo | ${pathname === "/" ? "Turismo aventura" : pathname.split("/")[1]}`;
  }, [pathname]);
  return (
    <>
      <AppLink
        className="visually-hidden-focusable skip-link"
        href="#contenido"
      >
        Saltar al contenido
      </AppLink>
      <SiteHeader cart={cart} session={session} onSignOut={signOut} />
      <main id="contenido">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
