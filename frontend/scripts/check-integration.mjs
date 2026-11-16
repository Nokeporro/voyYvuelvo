import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createServer, loadEnv } from "vite";

// Requiere los contenedores iniciados y el frontend disponible en el puerto 5173.
// Sin --write-test solo consulta datos. La prueba de escritura usa datos propios
// temporales y los retira en finally, restaurando los cupos mediante la API.
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const base = loadEnv("development", root).VITE_API_URL?.replace(/\/$/, "");
assert.ok(
  base,
  "Configura VITE_API_URL en .env antes de verificar la integración.",
);
const writeTest = process.argv.includes("--write-test");
if (writeTest)
  assert.ok(
    ["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname),
    "La prueba de escritura solo está habilitada para una API local.",
  );

const checks = [];
function passed(message) {
  checks.push(message);
  console.log(`OK: ${message}`);
}
async function http(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: "application/json", ...options.headers },
    signal: AbortSignal.timeout(15000),
  });
  assert.ok(
    response.ok,
    `${options.method || "GET"} ${url}: HTTP ${response.status}`,
  );
  return response;
}

const vite = await createServer({
  root,
  server: { middlewareMode: true },
  logLevel: "error",
});
try {
  // Se ejecuta el servicio HTTP real del frontend con su entorno de desarrollo.
  // No se sustituye fetch ni se usan respuestas simuladas.
  const api = await vite.ssrLoadModule("/src/services/api.js");
  assert.equal(api.apiEnabled, true);
  const endpoints = [
    ["usuarios", 8084],
    ["equipamiento", 8081],
    ["rutas", 8086],
    ["reservas", 8083],
    ["pagos", 8085],
  ];
  for (const [name, port] of endpoints) {
    const gateway = api.embeddedList(await api.request(`/api/${name}`));
    const directResponse = await http(`http://localhost:${port}/api/${name}`);
    const direct = api.embeddedList(await directResponse.json());
    assert.equal(
      gateway.length,
      direct.length,
      `${name}: Gateway y servicio difieren`,
    );
    passed(
      `${name}: Gateway y servicio directo responden (${gateway.length} registros)`,
    );
  }

  const registry = await (
    await http("http://localhost:8761/eureka/apps")
  ).json();
  const registered = [].concat(registry.applications?.application || []);
  for (const name of [
    "API-GETAWAY",
    "MS-USUARIO",
    "MS-EQUIPAMIENTO",
    "MS-RUTA",
    "MS-RESERVA",
    "MS-PAGO",
  ]) {
    const app = registered.find((item) => item.name === name);
    assert.ok(
      [].concat(app?.instance || []).some((item) => item.status === "UP"),
      `Eureka: falta ${name} UP`,
    );
  }
  passed("Eureka registra las seis aplicaciones cliente como UP");

  const routes = api.embeddedList(await api.request("/api/rutas"));
  const route = routes.find((item) => Number(item.cupoMaximo) > 0);
  assert.ok(route, "No hay una ruta disponible para consultar la integración.");
  await api.request(`/api/rutas/${route.id}`);
  api.embeddedList(
    await api.request(`/api/equipamiento/recomendacion/${route.id}`),
  );
  passed(
    "Consulta de ruta y recomendación de equipamiento entre microservicios",
  );

  const origin = "http://127.0.0.1:5173";
  for (const [method, path, headers] of [
    ["GET", `/api/rutas/${route.id}`, {}],
    [
      "OPTIONS",
      "/api/reservas",
      {
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    ],
  ]) {
    const response = await http(`${base}${path}`, {
      method,
      headers: { Origin: origin, ...headers },
    });
    assert.ok(
      [origin, "*"].includes(
        response.headers.get("access-control-allow-origin"),
      ),
      `CORS ${method}: falta permitir el frontend`,
    );
  }
  passed(
    "CORS permite la consulta y el preflight de reservas desde el frontend",
  );

  const front = await http(`${origin}/rutas/${route.id}`, {
    headers: { Accept: "text/html" },
  });
  assert.match(await front.text(), /id="root"/);
  passed("Vite sirve la pantalla de reserva en el puerto 5173");

  if (writeTest) {
    const marker = `qa-integracion-${randomUUID()}`;
    const email = `${marker}@example.invalid`;
    let equipmentId;
    let userId;
    let reservationId;
    const initialCapacity = Number(route.cupoMaximo);
    try {
      const equipment = {
        nombre: marker,
        descripcion: "Registro temporal para verificar la integración local",
        obligatorio: false,
        capacidadPersonas: 1,
        impermeable: true,
        dificultad: route.dificultad,
        disponible: true,
        valorArriendo: 1200,
      };
      equipmentId = (
        await api.request("/api/equipamiento", {
          method: "POST",
          body: JSON.stringify(equipment),
        })
      ).id;
      assert.ok(equipmentId);
      equipment.valorArriendo = 1800;
      await api.request(`/api/equipamiento/${equipmentId}`, {
        method: "PUT",
        body: JSON.stringify(equipment),
      });
      assert.equal(
        (await api.request(`/api/equipamiento/${equipmentId}`)).valorArriendo,
        1800,
      );
      passed("Equipamiento: creación, lectura y actualización reales");

      const date = new Date();
      date.setDate(date.getDate() + 2);
      const saved = await api.submitReservation(
        {
          nombre: "Prueba de integración",
          email,
          telefono: "900000000",
          fecha: date.toISOString().slice(0, 10),
          personas: 1,
          guia: false,
        },
        route,
        [{ id: equipmentId }],
      );
      reservationId = saved.id;
      assert.ok(reservationId);
      userId = saved.usuarioId;
      const stored = await api.request(`/api/reservas/${reservationId}`);
      assert.equal(stored.estadoPago, "PROCESANDO");
      assert.equal(stored.equipamientos[0].equipamientoId, equipmentId);
      assert.equal(
        Number((await api.request(`/api/rutas/${route.id}`)).cupoMaximo),
        initialCapacity - 1,
      );
      const payments = api.embeddedList(await api.request("/api/pagos"));
      const payment = payments.find((item) => item.idReserva === reservationId);
      assert.ok(payment, "La reserva no generó su pago");
      assert.equal(Number(payment.monto), Number(route.precio) + 1800);
      assert.equal(payment.estado, "PENDIENTE");
      passed(
        "El servicio del frontend crea usuario, reserva, arriendo y pago, y descuenta un cupo",
      );
    } finally {
      // Se identifican solo los registros propios, incluso ante un POST incompleto.
      const users = api.embeddedList(await api.request("/api/usuarios"));
      userId = users.find((item) => item.email === email)?.id;
      if (userId) {
        const reservations = api
          .embeddedList(await api.request("/api/reservas"))
          .filter((item) => item.usuarioId === userId);
        const payments = api.embeddedList(await api.request("/api/pagos"));
        for (const reservation of reservations) {
          for (const payment of payments.filter(
            (item) => item.idReserva === reservation.id,
          ))
            await http(`${base}/api/pagos/${payment.id}`, { method: "DELETE" });
          await http(`${base}/api/reservas/${reservation.id}`, {
            method: "DELETE",
          });
        }
        await http(`${base}/api/usuarios/${userId}`, { method: "DELETE" });
      }
      equipmentId ??= api
        .embeddedList(await api.request("/api/equipamiento"))
        .find((item) => item.nombre === marker)?.id;
      if (equipmentId)
        await http(`${base}/api/equipamiento/${equipmentId}`, {
          method: "DELETE",
        });
      assert.equal(
        Number((await api.request(`/api/rutas/${route.id}`)).cupoMaximo),
        initialCapacity,
        "Los cupos no regresaron a su valor inicial",
      );
      passed("Datos temporales retirados y cupos restaurados");
    }
  }
  console.log(
    `Integración verificada: ${checks.length} comprobaciones aprobadas.`,
  );
} finally {
  await vite.close();
}
