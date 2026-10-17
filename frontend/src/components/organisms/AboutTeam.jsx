import AppLink from "../atoms/AppLink";
import Heading from "../atoms/Heading";
import Text from "../atoms/Text";
export default function AboutTeam() {
  return (
    <section className="section team-section">
      <div className="container team-card">
        <div>
          <Text as="span" className="eyebrow">
            {"Detrás de Voy y Vuelvo"}
          </Text>
          <Heading as="h2">{"Un proyecto creado en equipo."}</Heading>
          <Text>
            {
              "Somos un equipo de estudiantes construyendo una experiencia digital para quienes aman el trekking. Esta tienda es el punto de partida: seguimos trabajando para mejorar cada parte del viaje."
            }
          </Text>
        </div>
        <AppLink className="btn btn-primary" href="/contacto">
          {"Hablemos "}
          <Text as="span" aria-hidden="true">
            {"→"}
          </Text>
        </AppLink>
      </div>
    </section>
  );
}
