// Live Preview sirve JavaScript sin transformar. Vite sí define import.meta.env.
// Esta entrada permite que Show Preview abra el mismo frontend procesado por Vite.
if (import.meta.env) {
  import("./main.jsx");
} else {
  const target = new URL("http://127.0.0.1:5173/");
  const path = window.location.pathname;
  const workspacePrefix = path.lastIndexOf("/frontend/");
  target.pathname =
    workspacePrefix >= 0 ? path.slice(workspacePrefix + 9) : path;
  target.search = window.location.search;
  target.searchParams.delete("vscode-livepreview");
  target.hash = window.location.hash;
  document.getElementById("root").textContent =
    "Abriendo Voy y Vuelvo con Vite…";
  window.location.replace(target.href);
}
