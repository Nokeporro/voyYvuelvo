import Heading from "../atoms/Heading";
import Text from "../atoms/Text";
export default function AboutStory() {
  return (
    <section className="section">
      <div className="container story-grid">
        <div>
          <Text as="span" className="eyebrow">
            {"Quiénes somos"}
          </Text>
          <Heading as="h2">{"Hecho para quienes disfrutan el camino."}</Heading>
        </div>
        <div className="story-copy">
          <Text>
            <strong>{"Voy y Vuelvo"}</strong>
            {
              " es una tienda online de equipamiento para trekking. Reunimos productos para acompañar desde una caminata tranquila hasta una ruta de mayor exigencia."
            }
          </Text>
          <Text>
            {
              "Organizamos el catálogo según el nivel de dificultad recomendado para ayudarte a comparar y elegir con más claridad. También compartimos consejos e historias para inspirar una próxima salida bien preparada."
            }
          </Text>
        </div>
      </div>
    </section>
  );
}
