import { readStorage, writeStorage } from "./storage";
import { normalizeDocument } from "../utils/validation";
const KEY = "vv-react-users-v2";
export const getUsers = () => {
  const data = readStorage(KEY, []);
  return Array.isArray(data) ? data : [];
};
async function digest(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
}
export async function saveAccount(data, id, role = "Cliente") {
  const list = getUsers();
  const correo = data.correo.trim().toLowerCase();
  const documento =
    data.tipoDocumento === "rut"
      ? normalizeDocument(data.documento)
      : data.documento.trim().toUpperCase();
  const paisEmisor =
    data.tipoDocumento === "rut" ? "Chile" : data.paisEmisor.trim();
  if (list.some((u) => u.id !== id && u.correo === correo))
    throw Error("Ya existe una cuenta con este correo.");
  if (
    list.some(
      (u) =>
        u.id !== id &&
        u.tipoDocumento === data.tipoDocumento &&
        u.documento === documento &&
        u.paisEmisor.toLowerCase() === paisEmisor.toLowerCase(),
    )
  )
    throw Error("Ya existe una cuenta con este documento y país emisor.");
  const salt = crypto.randomUUID();
  const user = {
    id: id || crypto.randomUUID(),
    nombre: data.nombre.trim(),
    apellidos: data.apellidos.trim(),
    correo,
    tipoDocumento: data.tipoDocumento,
    documento,
    paisEmisor,
    region: data.tipoDocumento === "rut" ? data.region : "",
    comuna: data.tipoDocumento === "rut" ? data.comuna : "",
    direccion: data.direccion.trim(),
    telefono: data.telefono.trim(),
    rol: role,
    salt,
    passwordHash: await digest(data.password, salt),
  };
  writeStorage(KEY, [...list.filter((u) => u.id !== id), user]);
  return publicUser(user);
}
export function publicUser({ passwordHash, salt, ...user }) {
  return user;
}
export async function login(correo, password) {
  // Cuentas académicas explícitas. No representan autenticación de servidor.
  const demos = {
    "admin@duoc.cl": "Administrador",
    "vendedor@duoc.cl": "Vendedor",
  };
  correo = correo.trim().toLowerCase();
  if (demos[correo] && password === "Demo2026!")
    return {
      id: correo,
      correo,
      nombre: demos[correo],
      rol: demos[correo],
      demo: true,
    };
  const user = getUsers().find((u) => u.correo === correo);
  if (!user || (await digest(password, user.salt)) !== user.passwordHash)
    throw Error("Correo o contraseña incorrectos.");
  return publicUser(user);
}
export function deleteAccount(id) {
  writeStorage(
    KEY,
    getUsers().filter((u) => u.id !== id),
  );
}
