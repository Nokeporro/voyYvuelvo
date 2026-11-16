import PageTemplate from "../components/templates/PageTemplate";
import Heading from "../components/atoms/Heading";
import Text from "../components/atoms/Text";
import SplitTemplate from "../components/templates/SplitTemplate";

import ContactForm from "../components/organisms/ContactForm.jsx";
export default function Contact() {
  return (
    <PageTemplate className="container py-5">
      <SplitTemplate
        className="row g-5"
        introClass="col-lg-5"
        contentClass="col-lg-7"
        intro={
          <>
            <Text as="span" className="eyebrow">
              Estamos para ayudarte
            </Text>
            <Heading as="h1">¿En qué podemos ayudarte?</Heading>
            <Text className="lead">
              Cuéntanos qué necesitas para preparar tu próxima aventura.
            </Text>
            <Text>
              ¿Dudas sobre rutas, equipamiento o cómo registrarte desde el
              extranjero? Déjanos tu consulta.
            </Text>
          </>
        }
      >
        <div className="form-panel">
          <Heading as="h2" className="h4">
            Envíanos un mensaje
          </Heading>
          <ContactForm />
        </div>
      </SplitTemplate>
    </PageTemplate>
  );
}
