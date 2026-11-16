import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { htmlAliases } from "./scripts/vite-html-aliases.js";

export default defineConfig({
  plugins: [react(), htmlAliases()],
  server: { port: 5173, strictPort: true },
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
