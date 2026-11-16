import AppLink from "../atoms/AppLink";
import Heading from "../atoms/Heading";
import Text from "../atoms/Text";

export default function AdventureInvite() {
  return (
    <section className="welcome-banner p-4 p-md-5 my-4">
      <div>
        <Text as="span" className="eyebrow">
          La naturaleza nos reúne
        </Text>
        <Heading as="h2">
          Ven de donde vengas,
          <br />
          el camino te espera.
        </Heading>
        <Text>
          Crea tu cuenta con RUT o pasaporte y prepara tu próxima salida.
        </Text>
      </div>
      <AppLink className="btn btn-warning" to="/registro">
        Unirme a la aventura →
      </AppLink>
    </section>
  );
}
