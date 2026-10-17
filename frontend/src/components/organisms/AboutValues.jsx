import Heading from "../atoms/Heading";
import Text from "../atoms/Text";
export default function AboutValues() {
  return (
    <section className="section values-section">
      <div className="container">
        <div className="section-heading">
          <Text as="span" className="eyebrow">
            {"Lo que nos mueve"}
          </Text>
          <Heading as="h2">
            {"Prepararse también es parte de la aventura."}
          </Heading>
        </div>
        <div className="values-grid">
          <article className="value-card">
            <Text as="span" className="value-icon" aria-hidden="true">
              {"🧭"}
            </Text>
            <Heading as="h3">{"Elegir con confianza"}</Heading>
            <Text>
              {
                "Información clara para encontrar equipo que se ajuste al tipo de ruta."
              }
            </Text>
          </article>
          <article className="value-card">
            <Text as="span" className="value-icon" aria-hidden="true">
              {"🥾"}
            </Text>
            <Heading as="h3">{"Disfrutar cada paso"}</Heading>
            <Text>
              {
                "Una buena preparación ayuda a vivir el camino con más tranquilidad."
              }
            </Text>
          </article>
          <article className="value-card">
            <Text as="span" className="value-icon" aria-hidden="true">
              {"🌿"}
            </Text>
            <Heading as="h3">{"Explorar con respeto"}</Heading>
            <Text>
              {
                "Valoramos los paisajes y la responsabilidad de cuidarlos en cada salida."
              }
            </Text>
          </article>
        </div>
      </div>
    </section>
  );
}
