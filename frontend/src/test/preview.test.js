import source from "../preview-entry.js?raw";
import { describe, expect, it, vi } from "vitest";

function openStaticPreview(pathname, search = "", hash = "") {
  const replace = vi.fn();
  const root = { textContent: "" };
  const run = new Function(
    "window",
    "document",
    source.replaceAll("import.meta.env", "undefined"),
  );
  run(
    { location: { pathname, search, hash, replace } },
    { getElementById: () => root },
  );
  return replace.mock.calls[0][0];
}

describe("Show Preview con el servidor de Vite", () => {
  it("redirige el index estático sin intentar ejecutar JSX", () => {
    expect(openStaticPreview("/index.html", "?vscode-livepreview=true")).toBe(
      "http://127.0.0.1:5173/index.html",
    );
  });
  it("conserva la ruta administrativa y sus parámetros", () => {
    expect(
      openStaticPreview(
        "/admin/producto-editar.html",
        "?codigo=VV-001&vscode-livepreview=true",
        "#contenido",
      ),
    ).toBe(
      "http://127.0.0.1:5173/admin/producto-editar.html?codigo=VV-001#contenido",
    );
  });
  it("admite Live Preview abierto desde la carpeta superior", () => {
    expect(openStaticPreview("/frontend/registro.html")).toBe(
      "http://127.0.0.1:5173/registro.html",
    );
  });
  it("carga React directamente cuando Vite procesa la entrada", () => {
    const mount = vi.fn();
    const run = new Function(
      "onMount",
      source
        .replaceAll("import.meta.env", "({ DEV: true })")
        .replace('import("./main.jsx")', "onMount()"),
    );
    run(mount);
    expect(mount).toHaveBeenCalledOnce();
  });
});
