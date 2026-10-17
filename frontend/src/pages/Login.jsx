import PageTemplate from "../components/templates/PageTemplate";
import AppLink from "../components/atoms/AppLink";
import Heading from "../components/atoms/Heading";
import Text from "../components/atoms/Text";

import { useNavigate } from "react-router-dom";

import { useStore } from "../context/Store.jsx";
import LoginForm from "../components/organisms/LoginForm.jsx";
export default function Login() {
  const { signIn } = useStore();
  const navigate = useNavigate();
  return (
    <PageTemplate className="container py-5">
      <div className="form-panel narrow-panel mx-auto">
        <Text as="span" className="eyebrow">
          Qué bueno verte de nuevo
        </Text>
        <Heading as="h1" className="h2">
          Iniciar sesión
        </Heading>
        <LoginForm
          onAuthenticated={(user) => {
            signIn(user);
            navigate(user.rol === "Cliente" ? "/rutas" : "/admin");
          }}
        />
        <Text className="mt-4">
          ¿Aún no tienes cuenta?{" "}
          <AppLink className="text-link" to="/registro">
            Regístrate
          </AppLink>
        </Text>
        <details className="demo-note">
          <summary>Accesos de demostración académica</summary>
          <Text>
            Administrador: admin@duoc.cl
            <br />
            Vendedor: vendedor@duoc.cl
            <br />
            Contraseña de ambos: Demo2026!
          </Text>
          <Text>El control de acceso es local y demostrativo.</Text>
        </details>
      </div>
    </PageTemplate>
  );
}
