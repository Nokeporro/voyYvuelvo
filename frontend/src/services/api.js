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

  // Agregar el JWT cuando la solicitud lo necesite.
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

  // Verificar si el backend respondió correctamente.
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Tu sesión no es válida o ha expirado. Inicia sesión nuevamente."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "No tienes permisos para realizar esta operación."
      );
    }

    throw new Error(
      `El servicio respondió con error ${response.status}.`
    );
  }

  // Respuesta sin contenido.
  if (response.status === 204) {
    return null;
  }

  return response.json();
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

// CREAR RESERVAS UTILIZANDO JWT
export async function submitReservation(
  data,
  route,
  equipment,
  token
) {
  // Verificar que exista una sesión autenticada.
  if (!token) {
    throw new Error(
      "Debes iniciar sesión para realizar una reserva."
    );
  }

  // Preparar los datos que necesita el backend.
  const reserva = {
    rutaId: Number(route.id),

    cantidadPersonas: Number(data.personas),

    fechaReserva: data.fecha,

    necesitaGuia: Boolean(data.guia),

    equipamientos: equipment.map((e) => ({
      equipamientoId: Number(e.id),
      cantidad: 1,
    })),
  };

  // Enviar la reserva al endpoint protegido.
  // El backend identifica al Cliente mediante su JWT.
  return request("/auth/reservas", {
    method: "POST",
    token,
    body: JSON.stringify(reserva),
  });
}
