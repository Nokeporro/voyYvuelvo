export function readStorage(key, fallback, storage = localStorage) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
export function writeStorage(key, value, storage = localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(
      "No se pudo guardar. Habilita el almacenamiento del navegador o libera espacio.",
    );
  }
}
