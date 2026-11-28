const API_URL = (import.meta.env.VITE_API_URL || "")
  .replace(/\/$/, "");

// 1. INICIAR SESION
export async function loginBackend(username, password) {

  if (!API_URL) {
    throw new Error(
      "No está configurada la conexión con el backend."
    );
  }

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username.trim(),
      password,
    }),
  });

  if (response.status === 401) {
    throw new Error(
      "Usuario o contraseña incorrectos."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Error del servidor: ${response.status}`
    );
  }

  const data = await response.json();

  if (!data.token) {
    throw new Error(
      "El servidor no entregó un token JWT."
    );
  }

  return data.token;
}

// 2. RENOVAR TOKEN JWT
export async function refreshBackend(token, signal) {

  if (!API_URL || !token) {
    throw new Error(
      "No existe una sesión para renovar."
    );
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {

    const error = new Error(
      "No fue posible renovar la sesión."
    );

    error.status = response.status;

    throw error;
  }

  const data = await response.json();

  if (!data.token) {
    throw new Error(
      "El servidor no entregó un nuevo JWT."
    );
  }

  return data.token;
}
