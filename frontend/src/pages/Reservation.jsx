import PageTemplate from "../components/templates/PageTemplate";
import Heading from "../components/atoms/Heading";
import Text from "../components/atoms/Text";
import Image from "../components/atoms/Image";
import AppLink from "../components/atoms/AppLink";
import SplitTemplate from "../components/templates/SplitTemplate";
import RentalEquipmentList from "../components/organisms/RentalEquipmentList";
import ReservationForm from "../components/organisms/ReservationForm.jsx";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { routes, rentalEquipment } from "../data/routes.js";
import {
  apiEnabled,
  embeddedList,
  request,
  submitReservation,
} from "../services/api.js";
import { readStorage, writeStorage } from "../services/storage.js";
import { useStore } from "../context/Store.jsx";
import { validateReservation } from "../utils/validation.js";

import { NotFound } from "./NotFound.jsx";
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
    <PageTemplate className="container py-5">
      <AppLink className="text-link" to="/rutas">
        ← Todas las rutas
      </AppLink>
      <SplitTemplate
        className="row g-5 mt-1"
        introClass="col-lg-7"
        contentClass="col-lg-5"
        intro={
          <>
            <Image
              className="reservation-photo"
              src={route.imagen}
              alt={route.nombre}
            />
            <Text as="span" className="eyebrow d-block mt-4">
              {route.ubicacion}
            </Text>
            <Heading as="h1">{route.nombre}</Heading>
            <Text>{route.descripcion}</Text>
            <Text>
              {route.duracion} · Dificultad {route.dificultad} · Máximo{" "}
              {route.cupoMaximo} personas
            </Text>
            <Text className="small">{source}</Text>
            <Heading as="h2" className="h4 mt-4">
              Equipamiento para arrendar
            </Heading>
            <Text>El arriendo se suma una vez por artículo seleccionado.</Text>
            <RentalEquipmentList
              equipment={equipment}
              selected={selected}
              onSelectionChange={setSelected}
            />
          </>
        }
      >
        <div className="form-panel">
          <Heading as="h2" className="h4">
            Prepara tu reserva
          </Heading>
          <ReservationForm
            data={data}
            change={change}
            route={route}
            equipmentTotal={equipmentTotal}
            total={total}
            message={message}
            busy={busy}
            submit={submit}
            restore={restore}
            apiEnabled={apiEnabled}
          />
        </div>
      </SplitTemplate>
    </PageTemplate>
  );
}
