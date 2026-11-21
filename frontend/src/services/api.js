const base = (import.meta.env.VITE_API_URL || "")
  .replace(/\/$/, "");

// ==========================================
// 1. COMPROBAR CONEXION CON BACKEND
// ==========================================

export const apiEnabled = Boolean(base);

// ==========================================
// 2. REALIZAR PETICIONES HTTP
// ==========================================

export async function request(path, options = {}) {

  const {
    token,
    headers = {},
    ...fetchOptions
  } = options;

  // Agregar JWT cuando exista.
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

  // Comprobar errores HTTP.
  if (!response.ok) {
    throw new Error(
      `El servicio respondió con error ${response.status}.`
    );
  }

  // Respuestas sin contenido.
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ==========================================
// 3. EXTRAER LISTAS NORMALES O HAL
// ==========================================

export function embeddedList(data) {

  if (Array.isArray(data)) {
    return data;
  }

  return (
    Object.values(data?._embedded || {})
      .find(Array.isArray) || []
  );
}

// ==========================================
// 4. CREAR RESERVAS SEGURAS CON JWT
// ==========================================

export async function submitReservation(
  data,
  route,
  equipment,
  token
) {

  // Comprobar autenticacion ANTES de
  // enviar cualquier solicitud al backend.
  if (!token) {
    throw new Error(
      "Debes iniciar sesión para realizar una reserva."
    );
  }

  // Preparar el cuerpo de la reserva.
  // IMPORTANTE:
  // No enviamos usuarioId desde React.
  const reserva = {
    rutaId: Number(route.id),

    cantidadPersonas: Number(data.personas),

    fechaReserva: data.fecha,

    necesitaGuia: Boolean(data.guia),

    equipamientos: (equipment || []).map(
      (item) => ({
        equipamientoId: Number(item.id),
        cantidad: 1,
      })
    ),
  };

  // El API Gateway identifica al cliente
  // mediante su JWT y obtiene su perfil
  // directamente desde MySQL.
  return request("/auth/reservas", {
    method: "POST",
    token,
    body: JSON.stringify(reserva),
  });
}
