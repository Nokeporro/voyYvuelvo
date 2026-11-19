
import { useState } from "react";

import Button from "../atoms/Button";
import Text from "../atoms/Text";
import FormField from "../molecules/FormField.jsx";

import { loginBackend } from "../../services/auth.js";

// Convertir los roles de Spring Boot
// al formato utilizado en React.
const ROLES = {
  ADMINISTRADOR: "Administrador",
  VENDEDOR: "Vendedor",
  CLIENTE: "Cliente",
};

// Obtener los datos del usuario desde el JWT.
// La autorización real se realiza en Spring Boot.
function obtenerUsuarioDelToken(token) {
  const parte = token.split(".")[1];

  if (!parte) {
    throw new Error(
      "El servidor entregó un token inválido."
    );
  }

  // Decodificar la información del JWT.
  const contenido = parte
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const datos = JSON.parse(atob(contenido));

  // Identificar el rol del usuario.
  const rol = ROLES[datos.rol];

  if (!rol || !datos.sub) {
    throw new Error(
      "El token no contiene un usuario o rol válido."
    );
  }

  // Preparar los datos del usuario para React.
  return {
    id: datos.sub,
    username: datos.sub,
    nombre: datos.sub,

    // El JWT no entrega un correo electrónico.
    // Se deja vacío para evitar datos incorrectos.
    correo: "",

    rol,
  };
}

export default function LoginForm({ onAuthenticated }) {

  // Datos ingresados en el formulario.
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  // Estados del formulario.
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Actualizar los campos del formulario.
  function change(e) {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  }

  // Iniciar sesión.
  async function submit(e) {
    e.preventDefault();

    const invalid = {};

    // Validar nombre de usuario.
    if (!data.username.trim()) {
      invalid.username = "Ingresa tu usuario.";
    }

    // Validar contraseña.
    if (!data.password) {
      invalid.password = "Ingresa tu contraseña.";
    }

    setErrors(invalid);

    // Detener si hay errores.
    if (Object.keys(invalid).length > 0) {
      return;
    }

    setBusy(true);
    setMessage("");

    try {

      // 1. Enviar credenciales a Spring Boot.
      const token = await loginBackend(
        data.username,
        data.password
      );

      // 2. Obtener usuario y rol desde el JWT.
      const usuario = obtenerUsuarioDelToken(token);

      // 3. Enviar usuario y token a Store.jsx.
      onAuthenticated({
        ...usuario,
        token,
      });

    } catch (error) {

      setMessage(
        error.message ||
        "No fue posible iniciar sesión."
      );

    } finally {
      setBusy(false);
    }
  }

  return (
    <form noValidate onSubmit={submit}>

      {/* Nombre de usuario */}
      <FormField
        name="username"
        label="Nombre de usuario"
        type="text"
        autoComplete="username"
        value={data.username}
        onChange={change}
        error={errors.username}
      />

      {/* Contraseña */}
      <FormField
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        value={data.password}
        onChange={change}
        error={errors.password}
      />

      {/* Mostrar errores del inicio de sesión */}
      <Text role="alert">
        {message}
      </Text>

      {/* Botón para ingresar */}
      <Button
        type="submit"
        className="btn btn-warning w-100"
        disabled={busy}
      >
        {busy ? "Ingresando…" : "Ingresar"}
      </Button>

    </form>
  );
}
