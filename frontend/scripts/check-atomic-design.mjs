import { readFileSync, readdirSync } from "node:fs";
import { inspectAtomicDesign } from "./lib/atomic-design.js";

const files = new Map();
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) collect(path);
    else if (/\.(js|jsx)$/.test(path))
      files.set(path, readFileSync(path, "utf8"));
  }
}
collect("src");
const violations = inspectAtomicDesign(files);
if (violations.length) {
  process.exitCode = 1;
  console.error(violations.join("\n"));
} else {
  console.log(
    "Atomic Design: dependencias válidas, sin ciclos ni imports hacia capas superiores.",
  );
}
