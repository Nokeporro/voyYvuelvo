import { regions } from "../data/regions";

export const normalizeDocument = (value) =>
  value.replace(/[.\s-]/g, "").toUpperCase();
export function validRut(value) {
  const rut = normalizeDocument(value);
  if (!/^\d{7,8}[\dK]$/.test(rut) || /^0+$/.test(rut.slice(0, -1)))
    return false;
  let sum = 0,
    factor = 2;
  for (const digit of [...rut.slice(0, -1)].reverse()) {
    sum += Number(digit) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const dv = 11 - (sum % 11);
  return rut.at(-1) === (dv === 11 ? "0" : dv === 10 ? "K" : String(dv));
}
export function validEmail(value) {
  return value.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
export function validateRegistration(data) {
  const errors = {};
  for (const [field, label, max] of [
    ["nombre", "nombre", 50],
    ["apellidos", "apellido", 100],
    ["direccion", "domicilio o alojamiento", 300],
  ]) {
    if (!data[field]?.trim() || data[field].trim().length > max)
      errors[field] = `Ingresa tu ${label} (máximo ${max} caracteres).`;
  }
  if (!["rut", "pasaporte"].includes(data.tipoDocumento))
    errors.tipoDocumento = "Selecciona un tipo de documento.";
  if (data.tipoDocumento === "rut" && !validRut(data.documento || ""))
    errors.documento = "Ingresa un RUT válido con su dígito verificador.";
  if (data.tipoDocumento === "pasaporte") {
    if (!/^[A-Z0-9]{5,20}$/i.test(data.documento?.trim() || ""))
      errors.documento =
        "Usa entre 5 y 20 letras o números, sin espacios ni signos.";
    if (!data.paisEmisor?.trim() || data.paisEmisor.trim().length > 80)
      errors.paisEmisor = "Indica el país emisor (máximo 80 caracteres).";
  }
  if (!validEmail(data.correo || ""))
    errors.correo = "Ingresa un correo electrónico válido.";
  if (!data.password || data.password.length < 8 || data.password.length > 64)
    errors.password = "Usa una contraseña de 8 a 64 caracteres.";
  if (data.password !== data.confirmacion)
    errors.confirmacion = "Las contraseñas no coinciden.";
  if (!/^\+?[\d\s()-]{8,20}$/.test(data.telefono || ""))
    errors.telefono = "Ingresa un teléfono de contacto válido.";
  if (data.tipoDocumento === "rut") {
    const region = regions.find((r) => r.region === data.region);
    if (!region) errors.region = "Selecciona una región.";
    if (!region?.comunas.includes(data.comuna))
      errors.comuna = "Selecciona una comuna de la región.";
  }
  if (!data.acepta)
    errors.acepta =
      "Debes aceptar el uso de tus datos para gestionar tu cuenta.";
  return errors;
}
export const money = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
export function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function validateReservation(data, route) {
  if (
    !data.nombre?.trim() ||
    !validEmail(data.email || "") ||
    !/^\+?[\d\s()-]{8,20}$/.test(data.telefono || "")
  )
    return "Completa correctamente tus datos de contacto.";
  const date = new Date(`${data.fecha}T12:00:00`);
  const canonical =
    !Number.isNaN(date.getTime()) &&
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.fecha || "") ||
    canonical !== data.fecha ||
    data.fecha < tomorrow()
  )
    return "Selecciona una fecha posterior a hoy.";
  if (
    !Number.isInteger(Number(data.personas)) ||
    Number(data.personas) < 1 ||
    Number(data.personas) > route.cupoMaximo
  )
    return `Selecciona entre 1 y ${route.cupoMaximo} personas.`;
  return "";
}
