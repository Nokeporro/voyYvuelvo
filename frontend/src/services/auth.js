
const API_URL = (import.meta.env.VITE_API_URL || "")
  .replace(/\/$/, "");

// Inicia sesión utilizando Spring Boot y JWT.
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
    throw new Error("Usuario o contraseña incorrectos.");
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
