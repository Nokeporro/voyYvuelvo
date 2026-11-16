import PageTemplate from "../components/templates/PageTemplate";
import AppLink from "../components/atoms/AppLink";
import Image from "../components/atoms/Image";
import Heading from "../components/atoms/Heading";
import Text from "../components/atoms/Text";
import SplitTemplate from "../components/templates/SplitTemplate";

import { RegistrationForm } from "../components/organisms/RegistrationForm.jsx";
export default function Register() {
  return (
    <PageTemplate className="container py-5">
      <SplitTemplate
        className="row g-5"
        introClass="col-lg-5"
        contentClass="col-lg-7"
        intro={
          <>
            <Text as="span" className="eyebrow">
              Tu próximo camino empieza aquí
            </Text>
            <Heading as="h1">
              La aventura
              <br />
              no tiene fronteras.
            </Heading>
            <Text className="lead">
              Regístrate con tu RUT o pasaporte y prepara tu próxima experiencia
              de trekking en Chile.
            </Text>
            <Image
              className="registration-photo"
              src="/img/montana-sendero.png"
              alt="Sendero entre montañas de Chile"
            />
            <Text className="mt-4">
              ¿Ya tienes cuenta?{" "}
              <AppLink className="text-link" to="/login">
                Inicia sesión →
              </AppLink>
            </Text>
          </>
        }
      >
        <div className="form-panel">
          <Heading as="h2" className="h4 mb-4">
            Crea tu cuenta
          </Heading>
          <RegistrationForm />
          <Text className="demo-note mt-3 mb-0">
            Demostración académica: tu cuenta se guarda en este navegador. Usa
            datos de prueba.
          </Text>
        </div>
      </SplitTemplate>
    </PageTemplate>
  );
}
