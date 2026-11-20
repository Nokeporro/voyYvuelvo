
const base = (import.meta.env.VITE_API_URL || "")
  .replace(/\/$/, "");

export const apiEnabled = Boolean(base);

// REALIZAR PETICIONES AL BACKEND
export async function request(path, options = {}) {

  const {
    token,
    headers = {},
    ...fetchOptions
  } = options;

  // Incluir JWT cuando la solicitud lo necesite.
  const authorization = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(`${base}${path}`, {
    ...fetchOptions,

    signal:
      fetchOptions.signal ??
      AbortSignal.timeout(10000),

    headers: {
      "Content-Type": "application/json",
      ...authorization,
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `El servicio respondió con error ${response.status}.`
    );
  }

  return response.status === 204
    ? null
    : response.json();
}

// EXTRAER LISTAS DEVUELTAS POR SPRING BOOT
export function embeddedList(data) {

  if (Array.isArray(data)) {
    return data;
  }

  return (
    Object.values(data?._embedded || {})
      .find(Array.isArray) || []
  );
}

// CREAR RESERVAS
// Este flujo se adaptará a los nuevos permisos JWT.
export async function submitReservation(
  data,
  route,
  equipment
) {

  const users = embeddedList(
    await request("/api/usuarios")
  );

  const email = data.email.trim().toLowerCase();

  let user = users.find(
    (u) =>
      String(u.email).toLowerCase() === email
  );

  if (!user) {

    user = await request("/api/usuarios", {
      method: "POST",

      body: JSON.stringify({
        nombre: data.nombre.trim(),
        email,
        telefono: data.telefono.trim(),
      }),
    });
  }

  if (!user?.id) {
    throw new Error(
      "El servicio no entregó un identificador de usuario."
    );
  }

  return request("/api/reservas", {
    method: "POST",

    body: JSON.stringify({
      usuarioId: user.id,
      rutaId: route.id,
      cantidadPersonas: Number(data.personas),
      fechaReserva: data.fecha,
      necesitaGuia: data.guia,

      equipamientos: equipment.map((e) => ({
        equipamientoId: e.id,
        cantidad: 1,
      })),
    }),
  });
}
