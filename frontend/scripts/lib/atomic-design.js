const layerOf = (path) => {
  const layer = path.match(
    /^src\/components\/(atoms|molecules|organisms|templates)\//,
  )?.[1];
  return layer || (path.startsWith("src/pages/") ? "pages" : null);
};
const ranks = { atoms: 0, molecules: 1, organisms: 2, templates: 3, pages: 4 };
function resolveImport(file, specifier) {
  const parts = file.split("/").slice(0, -1);
  for (const part of specifier.split("/")) {
    if (part === "..") parts.pop();
    else if (part !== ".") parts.push(part);
  }
  return parts.join("/");
}

// Comprobación estructural de los imports relativos utilizados en este proyecto.
export function inspectAtomicDesign(files) {
  const violations = [],
    graph = new Map();
  for (const [file, source] of files) {
    const layer = layerOf(file);
    if (!layer) continue;
    const dependencies = [];
    for (const match of source.matchAll(
      /import\s+(?:[\w\s{},*]+?\s+from\s+)?["']([^"']+)["']/g,
    )) {
      const specifier = match[1];
      if (!specifier.startsWith(".")) continue;
      const target = resolveImport(file, specifier);
      const resolved = [target, `${target}.jsx`, `${target}.js`].find((path) =>
        files.has(path),
      );
      if (!resolved) {
        violations.push(`${file}: import no encontrado ${specifier}`);
        continue;
      }
      const targetLayer = layerOf(resolved);
      if (targetLayer && ranks[targetLayer] > ranks[layer])
        violations.push(
          `${file}: ${layer} no puede depender de ${targetLayer}`,
        );
      if (
        ["atoms", "molecules"].includes(layer) &&
        /^src\/(context|services|data)\//.test(resolved)
      )
        violations.push(
          `${file}: ${layer} debe recibir datos y acciones por props`,
        );
      dependencies.push(resolved);
    }
    graph.set(file, dependencies);
    if (layer === "pages" && !source.includes("components/templates/"))
      violations.push(`${file}: la página debe componer una plantilla`);
    if (
      layer !== "atoms" &&
      /<(button|input|select|textarea|label|img|h[1-6])\b/.test(source)
    )
      violations.push(
        `${file}: reutiliza los átomos para los controles básicos`,
      );
  }
  const visited = new Set(),
    active = new Set();
  function visit(file) {
    if (active.has(file)) {
      violations.push(`${file}: dependencia circular`);
      return;
    }
    if (visited.has(file)) return;
    active.add(file);
    for (const dependency of graph.get(file) || []) visit(dependency);
    active.delete(file);
    visited.add(file);
  }
  for (const file of graph.keys()) visit(file);
  return [...new Set(violations)];
}
