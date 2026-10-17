import AppLink from "../atoms/AppLink";
import Heading from "../atoms/Heading";
import Text from "../atoms/Text";
export default function AboutHero() {
  return (
    <section className="about-hero">
      <div className="container about-hero-inner">
        <Text as="span" className="eyebrow">
          {"Nuestra historia"}
        </Text>
        <Heading as="h1">
          {"La aventura se disfruta más cuando vuelves."}
        </Heading>
        <Text>
          {
            "Creemos que cada salida empieza mucho antes del primer paso: con ganas de explorar y el equipo correcto para hacerlo con confianza."
          }
        </Text>
        <AppLink className="btn btn-primary btn-large" href="/productos">
          {"Encuentra tu equipo "}
          <Text as="span" aria-hidden="true">
            {"→"}
          </Text>
        </AppLink>
      </div>
    </section>
  );
}
