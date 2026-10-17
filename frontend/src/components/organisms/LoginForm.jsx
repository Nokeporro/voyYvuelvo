import Button from "../atoms/Button";
import Text from "../atoms/Text";
import { useState } from "react";

import FormField from "../molecules/FormField.jsx";
import { login } from "../../services/accounts.js";
import { validEmail } from "../../utils/validation.js";

export default function LoginForm({ onAuthenticated }) {
  const [data, setData] = useState({ correo: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

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
      onAuthenticated(user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form noValidate onSubmit={submit}>
      <FormField
        name="correo"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        value={data.correo}
        onChange={change}
        error={errors.correo}
      />
      <FormField
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        value={data.password}
        onChange={change}
        error={errors.password}
      />
      <Text role="alert">{message}</Text>
      <Button type="submit" className="btn btn-warning w-100" disabled={busy}>
        {busy ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
