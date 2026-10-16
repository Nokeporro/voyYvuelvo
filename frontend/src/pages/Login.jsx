import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../components/Field";
import { login } from "../services/accounts";
import { validEmail } from "../utils/validation";
import { useStore } from "../context/Store";
export default function Login() {
  const [data, setData] = useState({ correo: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn } = useStore();
  const navigate = useNavigate();
  const change = (e) => setData({ ...data, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    const invalid = {};
    if (!validEmail(data.correo)) invalid.correo = "Ingresa un correo válido.";
    if (!data.password) invalid.password = "Ingresa tu contraseña.";
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    setBusy(true);
    setMessage("");
    try {
      const user = await login(data.correo, data.password);
      signIn(user);
      navigate(user.rol === "Cliente" ? "/rutas" : "/admin");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container py-5">
      <div className="form-panel narrow-panel mx-auto">
        <span className="eyebrow">Qué bueno verte de nuevo</span>
        <h1 className="h2">Iniciar sesión</h1>
        <form noValidate onSubmit={submit}>
          <Field
            name="correo"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={data.correo}
            onChange={change}
            error={errors.correo}
          />
          <Field
            name="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={data.password}
            onChange={change}
            error={errors.password}
          />
          <p role="alert">{message}</p>
          <button className="btn btn-warning w-100" disabled={busy}>
            {busy ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
        <p className="mt-4">
          ¿Aún no tienes cuenta?{" "}
          <Link className="text-link" to="/registro">
            Regístrate
          </Link>
        </p>
        <details className="demo-note">
          <summary>Accesos de demostración académica</summary>
          <p>
            Administrador: admin@duoc.cl
            <br />
            Vendedor: vendedor@duoc.cl
            <br />
            Contraseña de ambos: Demo2026!
          </p>
          <p>El control de acceso es local y demostrativo.</p>
        </details>
      </div>
    </div>
  );
}
