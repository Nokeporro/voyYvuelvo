import PageTemplate from "../components/templates/PageTemplate";
import AppLink from "../components/atoms/AppLink";
import Text from "../components/atoms/Text";
import Heading from "../components/atoms/Heading";

export function NotFound() {
  return (
    <PageTemplate className="container py-5">
      <Heading as="h1">Página no encontrada</Heading>
      <Text>El contenido solicitado no está disponible.</Text>
      <AppLink className="btn btn-warning" to="/">
        Volver al inicio
      </AppLink>
    </PageTemplate>
  );
}
