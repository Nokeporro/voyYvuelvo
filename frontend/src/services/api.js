const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const apiEnabled = Boolean(base);
export async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    signal: AbortSignal.timeout(10000),
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok)
    throw Error(`El servicio respondió con error ${response.status}.`);
  return response.status === 204 ? null : response.json();
}
export function embeddedList(data) {
  if (Array.isArray(data)) return data;
  return Object.values(data?._embedded || {}).find(Array.isArray) || [];
}
export async function submitReservation(data, route, equipment) {
  const users = embeddedList(await request("/api/usuarios"));
  const email = data.email.trim().toLowerCase();
  let user = users.find((u) => String(u.email).toLowerCase() === email);
  if (!user)
    user = await request("/api/usuarios", {
      method: "POST",
      body: JSON.stringify({
        nombre: data.nombre.trim(),
        email,
        telefono: data.telefono.trim(),
      }),
    });
  if (!user?.id)
    throw Error("El servicio no entregó un identificador de usuario.");
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
