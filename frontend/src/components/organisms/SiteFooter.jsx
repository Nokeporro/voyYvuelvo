import AppLink from "../atoms/AppLink";
import Heading from "../atoms/Heading";
import Text from "../atoms/Text";

import { Brand } from "../molecules/Brand.jsx";
export default function SiteFooter() {
  return (
    <footer className="site-footer mt-5">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-5">
            <Brand />
            <Text className="mt-3">
              Descubre nuevos caminos, prepara tu equipo
              <br />y disfruta de la naturaleza.
            </Text>
            <Text as="small">Explora con respeto. Vuelve con historias.</Text>
          </div>
          <nav
            className="col-6 col-md-3 d-flex flex-column gap-2"
            aria-label="Explora"
          >
            <Heading as="h2" className="h6">
              Explora
            </Heading>
            <AppLink to="/rutas">Rutas de trekking</AppLink>
            <AppLink to="/productos">Equipamiento</AppLink>
            <AppLink to="/blogs">Consejos y experiencias</AppLink>
          </nav>
          <nav
            className="col-6 col-md-4 d-flex flex-column gap-2"
            aria-label="Tu cuenta"
          >
            <Heading as="h2" className="h6">
              Tu próxima aventura
            </Heading>
            <AppLink to="/registro">Crear cuenta con RUT o pasaporte</AppLink>
            <AppLink to="/contacto">Contáctanos</AppLink>
            <AppLink to="/nosotros">Conoce nuestro equipo</AppLink>
          </nav>
        </div>
        <hr className="my-4" />
        <div className="d-flex flex-wrap justify-content-between gap-2">
          <Text as="small">© 2026 Voy &amp; Vuelvo</Text>
          <Text as="small">Proyecto académico · Turismo aventura en Chile</Text>
        </div>
      </div>
    </footer>
  );
}
