import AppLink from "../atoms/AppLink";
import Heading from "../atoms/Heading";
import Text from "../atoms/Text";
import Image from "../atoms/Image";

import RouteSearchForm from "./RouteSearchForm.jsx";
export default function HomeHero({ onSearch }) {
  return (
    <section className="hero">
      <Image
        className="hero-background"
        src="/img/portada.png"
        alt="Excursionista frente a un lago rodeado de montañas"
        fetchPriority="high"
      />
      <div className="container position-relative py-5">
        <div className="row align-items-center g-5 py-4">
          <div className="col-lg-7 hero-copy">
            <Text as="span" className="hero-kicker">
              CHILE, UN PASO A LA VEZ
            </Text>
            <Heading as="h1">
              Tu aventura
              <br />
              comienza aquí
            </Heading>
            <Text>
              Descubre Chile, encuentra tu ruta
              <br />y prepara tu equipo.
            </Text>
            <AppLink className="btn btn-warning btn-lg" to="/rutas">
              Explorar rutas →
            </AppLink>
          </div>
          <div className="col-lg-5 col-xl-4 offset-xl-1">
            <RouteSearchForm onSearch={onSearch} />
          </div>
        </div>
      </div>
    </section>
  );
}
