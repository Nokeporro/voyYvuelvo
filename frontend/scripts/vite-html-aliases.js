import { legacyHtmlRoutes } from "../src/routes/legacy.js";

// Una sola entrada fuente; el hosting estático conserva las URLs .html antiguas.
export function htmlAliases() {
  return {
    name: "voy-vuelvo-html-aliases",
    apply: "build",
    enforce: "post",
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const entry = bundle["index.html"];
        if (!entry || entry.type !== "asset")
          this.error("No se generó la entrada index.html de la aplicación.");
        for (const path of Object.keys(legacyHtmlRoutes)) {
          if (path === "/index.html") continue;
          this.emitFile({
            type: "asset",
            fileName: path.slice(1),
            source: entry.source,
          });
        }
      },
    },
  };
}
