import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createServer, loadEnv } from "vite";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(
    "Uso: npm run test:integration\nRequiere Docker y Vite iniciados. Solo consultas; no crea ni elimina datos.\nOpcional: INTEGRATION_TOKEN o INTEGRATION_USERNAME + INTEGRATION_PASSWORD.\nDirecciones opcionales: INTEGRATION_FRONTEND_URL e INTEGRATION_EUREKA_URL.",
  );
  process.exit(0);
}
assert.ok(
  !args.includes("--write-test"),
  "La prueba de escritura de EP2 fue retirada. No se ha enviado ninguna petición.",
);
assert.equal(args.length, 0, "Argumento no reconocido; utiliza --help.");
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const base = loadEnv("development", root).VITE_API_URL?.replace(/\/$/, "");
assert.ok(
  base,
  "Configura VITE_API_URL y reinicia Vite antes de verificar la integración.",
);
const origin = process.env.INTEGRATION_FRONTEND_URL || "http://127.0.0.1:5173";
const eureka = process.env.INTEGRATION_EUREKA_URL || "http://localhost:8761";
let count = 0;
function passed(message) {
  count += 1;
  console.log(`OK: ${message}`);
}
async function http(url, options = {}, expected = 200) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: "application/json", ...options.headers },
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(
    response.status,
    expected,
    `${options.method || "GET"} ${new URL(url).pathname}: HTTP ${response.status}, se esperaba ${expected}`,
  );
  return response;
}
const vite = await createServer({
  root,
  server: { middlewareMode: true },
  logLevel: "error",
});
try {
  const api = await vite.ssrLoadModule("/src/services/api.js");
  assert.equal(api.apiEnabled, true);
  const routes = api.embeddedList(await api.request("/api/rutas"));
  api.embeddedList(await api.request("/api/equipamiento"));
  passed(`Catálogos públicos disponibles (${routes.length} rutas)`);
  assert.ok(
    routes.length,
    "No hay rutas para comprobar detalle y recomendaciones.",
  );
  const route = routes[0];
  await api.request(`/api/rutas/${route.id}`);
  api.embeddedList(
    await api.request(`/api/equipamiento/recomendacion/${route.id}`),
  );
  passed("Detalle de ruta y recomendaciones disponibles");

  for (const path of [
    "/auth/perfil",
    "/auth/cuentas",
    "/api/usuarios",
    "/api/reservas",
    "/api/pagos",
  ]) {
    await http(`${base}${path}`, {}, 401);
  }
  await http(
    `${base}/auth/reservas`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
    401,
  );
  passed("Recursos protegidos rechazan peticiones sin JWT (401)");
  const cors = await http(`${base}/auth/reservas`, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type,authorization",
    },
  });
  assert.equal(
    cors.headers.get("access-control-allow-origin"),
    origin,
    "CORS: origen no autorizado",
  );
  const allowed =
    cors.headers.get("access-control-allow-headers")?.toLowerCase() || "";
  assert.ok(
    allowed.includes("authorization") && allowed.includes("content-type"),
    "CORS: faltan cabeceras JWT/JSON",
  );
  assert.ok(
    cors.headers.get("access-control-allow-methods")?.includes("POST"),
    "CORS: POST no autorizado",
  );
  passed("CORS permite POST con JSON y Authorization desde el frontend");

  const registry = await (await http(`${eureka}/eureka/apps`)).json();
  const apps = [].concat(registry.applications?.application || []);
  for (const name of [
    "API-GETAWAY",
    "MS-USUARIO",
    "MS-EQUIPAMIENTO",
    "MS-RUTA",
    "MS-RESERVA",
    "MS-PAGO",
  ]) {
    assert.ok(
      apps.some(
        (app) =>
          app.name === name &&
          []
            .concat(app.instance || [])
            .some((instance) => instance.status === "UP"),
      ),
      `Eureka: falta ${name} UP`,
    );
  }
  passed("Eureka registra los seis clientes UP");
  const page = await http(`${origin}/rutas/${route.id}`, {
    headers: { Accept: "text/html" },
  });
  assert.match(await page.text(), /id="root"/);
  passed("Vite sirve el HTML de la pantalla de reserva");

  let token = process.env.INTEGRATION_TOKEN;
  const username = process.env.INTEGRATION_USERNAME;
  const password = process.env.INTEGRATION_PASSWORD;
  if (!token && (username || password)) {
    assert.ok(
      username && password,
      "Proporciona ambas credenciales de integración.",
    );
    const login = await http(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    token = (await login.json()).token;
    assert.ok(token, "Login sin token en la respuesta");
  }
  if (token) {
    // Solo selecciona las consultas. La firma y los permisos los valida el servidor.
    const claims = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    );
    const paths = {
      CLIENTE: ["/auth/perfil"],
      ADMINISTRADOR: [
        "/auth/cuentas",
        "/api/usuarios",
        "/api/reservas",
        "/api/pagos",
      ],
      VENDEDOR: ["/api/reservas"],
    }[claims.rol];
    assert.ok(paths, "El token no contiene un rol reconocido.");
    for (const path of paths) await api.request(path, { token });
    passed(`Consultas autenticadas autorizadas para ${claims.rol}`);
  } else {
    console.log(
      "OMITIDO: acceso autenticado; proporciona un token o credenciales por variables de entorno para comprobarlo.",
    );
  }
  console.log(
    `${count} grupos comprobados. No se crearon ni eliminaron datos de negocio.`,
  );
} finally {
  await vite.close();
}
