import { loginBackend } from "./auth.js";

const API_URL = (import.meta.env.VITE_API_URL || "")
  .replace(/\/$/, "");

// REGISTRAR UN CLIENTE EN SPRING BOOT Y MYSQL
export async function registrarClienteBackend(datos) {
  if (!API_URL) {
    throw new Error(
      "No está configurada la conexión con el backend."
    );
  }

  const username = datos.username?.trim();

  if (!username) {
    throw new Error("Debes ingresar un nombre de usuario.");
  }

  const nombreCompleto =
    `${datos.nombre.trim()} ${datos.apellidos.trim()}`.trim();

  // PASO 1: CREAR LA CUENTA CON ROL CLIENTE
  const registro = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password: datos.password,
    }),
  });

  // Este endpoint devuelve texto, no JSON.
  const mensajeRegistro = await registro.text();

  if (!registro.ok) {
    if (registro.status === 409) {
      throw new Error("Ese nombre de usuario ya está registrado.");
    }

    throw new Error(
      mensajeRegistro || `Error al registrar la cuenta: ${registro.status}`
    );
  }

  // PASO 2: INICIAR SESION PARA OBTENER EL JWT
  let token;

  try {
    token = await loginBackend(username, datos.password);
  } catch {
    throw new Error(
      "La cuenta se creó, pero no pudimos iniciar sesión para vincular el perfil. No vuelvas a registrarla."
    );
  }

  // PASO 3: CREAR EL PERFIL DEL CLIENTE
  let respuestaPerfil;

  try {
    respuestaPerfil = await fetch(`${API_URL}/auth/perfil`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: nombreCompleto,
        email: datos.correo.trim().toLowerCase(),
        telefono: datos.telefono.trim(),
      }),
    });
  } catch {
    throw new Error(
      "La cuenta se creó, pero no pudimos comprobar la vinculación del perfil. No repitas el registro."
    );
  }

  if (!respuestaPerfil.ok) {
    throw new Error(
      "La cuenta se creó, pero el perfil no pudo vincularse. No repitas el registro; debemos revisar la cuenta existente."
    );
  }

  const perfil = await respuestaPerfil.json();

  if (!perfil.perfilUsuarioId) {
    throw new Error(
      "La cuenta se creó, pero no recibimos la confirmación de vinculación del perfil."
    );
  }

  // REGISTRO Y VINCULACION COMPLETADOS
  return {
    username,
    perfilUsuarioId: perfil.perfilUsuarioId,
    nombre: perfil.nombre,
    email: perfil.email,
    telefono: perfil.telefono,
  };
}
