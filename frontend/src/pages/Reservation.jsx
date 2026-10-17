import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { routes, rentalEquipment } from "../data/routes";
import {
  apiEnabled,
  embeddedList,
  request,
  submitReservation,
} from "../services/api";
import { readStorage, writeStorage } from "../services/storage";
import { useStore } from "../context/Store";
import { money, tomorrow, validateReservation } from "../utils/validation";
import Field from "../components/Field";
import { NotFound } from "./Catalog";
export default function Reservation() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { session } = useStore();
  const localRoute = routes.find((r) => String(r.id) === id);
  const [route, setRoute] = useState(localRoute);
  const [equipment, setEquipment] = useState(rentalEquipment);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState({
    nombre: session?.nombre || "",
    email: session?.correo || "",
    telefono: session?.telefono || "",
    fecha: params.get("fecha") || "",
    personas: params.get("personas") || 1,
    guia: false,
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState(
    apiEnabled
      ? "Consultando disponibilidad…"
      : "Experiencia de demostración. La disponibilidad no ha sido confirmada.",
  );
  useEffect(() => {
    if (!localRoute || !apiEnabled) return;
    let active = true;
    Promise.all([
      request(`/api/rutas/${id}`),
      request(`/api/equipamiento/recomendacion/${id}`),
    ])
      .then(([r, e]) => {
        if (!active) return;
        setRoute({ ...localRoute, ...r });
        setEquipment(
          embeddedList(e)
            .filter((e) => e.disponible !== false)
            .map((e) => ({ ...e, imagen: e.imagen || "/img/mochila.png" })),
        );
        setSource(
          "Datos consultados al servicio. Cupos sujetos a confirmación al reservar.",
        );
      })
      .catch(() => {
        if (active)
          setSource(
            "No pudimos consultar el servicio. Mostramos datos de demostración.",
          );
      });
    return () => {
      active = false;
    };
  }, [id, localRoute]);
  if (!route) return <NotFound />;
  const chosen = equipment.filter((e) => selected.includes(e.id));
  const equipmentTotal = chosen.reduce(
    (s, e) => s + Number(e.valorArriendo),
    0,
  );
  const total =
    Number(route.precio) * Number(data.personas || 0) + equipmentTotal;
  function change(e) {
    setData({
      ...data,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  }
  async function submit(e) {
    e.preventDefault();
    const error = validateReservation(data, route);
    if (error) {
      setMessage(error);
      return;
    }
    setBusy(true);
    setMessage("");
    const draft = {
      ...data,
      rutaId: route.id,
      rutaNombre: route.nombre,
      equipamientos: chosen,
      total,
    };
    try {
      if (!apiEnabled) {
        writeStorage("voy-vuelvo-reserva-borrador", draft);
        setMessage(
          "Borrador guardado en este navegador. Aún no existe una reserva confirmada.",
        );
        return;
      }
      const saved = await submitReservation(data, route, chosen);
      if (!saved?.id)
        throw Error("El servicio no confirmó un identificador de reserva.");
      writeStorage("voy-vuelvo-ultima-reserva", {
        ...saved,
        rutaNombre: route.nombre,
      });
      setMessage(
        `Reserva #${saved.id} creada. Estado de pago: ${saved.estadoPago || "pendiente"}.`,
      );
    } catch (error) {
      try {
        writeStorage("voy-vuelvo-reserva-borrador", draft);
        setMessage(
          `${error.message} Guardamos un borrador local; no confirma tu reserva.`,
        );
      } catch (storageError) {
        setMessage(`${error.message} ${storageError.message}`);
      }
    } finally {
      setBusy(false);
    }
  }
  function restore() {
    const draft = readStorage("voy-vuelvo-reserva-borrador", null);
    if (draft?.rutaId !== route.id) {
      setMessage("No hay un borrador para esta ruta.");
      return;
    }
    setData({ ...data, ...draft });
    setSelected((draft.equipamientos || []).map((e) => e.id));
    setMessage(
      "Borrador recuperado. Revisa la fecha y los datos antes de continuar.",
    );
  }
  return (
    <div className="container py-5">
      <Link className="text-link" to="/rutas">
        ← Todas las rutas
      </Link>
      <div className="row g-5 mt-1">
        <section className="col-lg-7">
          <img
            className="reservation-photo"
            src={route.imagen}
            alt={route.nombre}
          />
          <span className="eyebrow d-block mt-4">{route.ubicacion}</span>
          <h1>{route.nombre}</h1>
          <p>{route.descripcion}</p>
          <p>
            {route.duracion} · Dificultad {route.dificultad} · Máximo{" "}
            {route.cupoMaximo} personas
          </p>
          <p className="small">{source}</p>
          <h2 className="h4 mt-4">Equipamiento para arrendar</h2>
          <p>El arriendo se suma una vez por artículo seleccionado.</p>
          <div className="row g-3">
            {equipment.map((item) => (
              <div className="col-sm-6" key={item.id}>
                <label
                  className={`rental-card ${selected.includes(item.id) ? "selected" : ""}`}
                >
                  <img src={item.imagen} alt="" />
                  <span>
                    <strong>{item.nombre}</strong>
                    <small className="d-block">
                      {money(Number(item.valorArriendo))} / arriendo
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, item.id]
                          : selected.filter((id) => id !== item.id),
                      )
                    }
                    aria-label={`Arrendar ${item.nombre}`}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>
        <section className="col-lg-5">
          <div className="form-panel">
            <h2 className="h4">Prepara tu reserva</h2>
            <form onSubmit={submit} noValidate>
              {[
                ["nombre", "Nombre completo", { autoComplete: "name" }],
                [
                  "email",
                  "Correo electrónico",
                  { type: "email", autoComplete: "email" },
                ],
                ["telefono", "Teléfono", { type: "tel", autoComplete: "tel" }],
                ["fecha", "Fecha de salida", { type: "date", min: tomorrow() }],
                [
                  "personas",
                  "Personas",
                  { type: "number", min: 1, max: route.cupoMaximo },
                ],
              ].map(([name, label, props]) => (
                <Field
                  key={name}
                  name={name}
                  label={label}
                  value={data[name]}
                  onChange={change}
                  required
                  {...props}
                />
              ))}
              <label className="form-check mb-4">
                <input
                  className="form-check-input"
                  name="guia"
                  type="checkbox"
                  checked={data.guia}
                  onChange={change}
                />
                Solicitar guía (precio por confirmar)
              </label>
              <dl className="totals">
                <dt>Ruta por persona</dt>
                <dd>{money(Number(route.precio))}</dd>
                <dt>Arriendo</dt>
                <dd>{money(equipmentTotal)}</dd>
                <dt>Total estimado</dt>
                <dd>
                  <strong>{money(total)}</strong>
                </dd>
              </dl>
              <p className="small">
                El total no incluye un eventual servicio de guía.
              </p>
              <p role="status">{message}</p>
              <button disabled={busy} className="btn btn-warning w-100">
                {busy
                  ? "Guardando…"
                  : apiEnabled
                    ? "Confirmar reserva"
                    : "Guardar borrador de reserva"}
              </button>
              <button
                className="btn btn-link w-100 mt-2"
                type="button"
                onClick={restore}
              >
                Recuperar borrador
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
