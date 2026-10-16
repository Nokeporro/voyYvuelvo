import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

// Los accesos .html de la primera entrega siguen funcionando en producción.
const inputs = [
  ...readdirSync(".").filter((f) => f.endsWith(".html")),
  ...readdirSync("admin")
    .filter((f) => f.endsWith(".html"))
    .map((f) => `admin/${f}`),
];

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  build: { rollupOptions: { input: inputs.map((f) => resolve(f)) } },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/test/**", "src/main.jsx", "src/data/**"],
    },
  },
});
