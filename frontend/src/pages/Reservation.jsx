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

import {
  routes,
  rentalEquipment,
} from "../data/routes.js";

import {
  apiEnabled,
  embeddedList,
  request,
  submitReservation,
} from "../services/api.js";

import {
  readStorage,
  writeStorage,
} from "../services/storage.js";

import { useStore } from "../context/Store.jsx";
import { validateReservation } from "../utils/validation.js";

import { NotFound } from "./NotFound.jsx";

export default function Reservation() {

  // ==========================================
  // 1. OBTENER RUTA Y CLIENTE AUTENTICADO
  // ==========================================

  const { id } = useParams();
  const [params] = useSearchParams();

  // Datos de la sesion y token JWT.
  const { session, authToken } = useStore();

  // Buscar la ruta seleccionada.
  const localRoute = routes.find(
    (r) => String(r.id) === id
  );

  const [route, setRoute] = useState(localRoute);

  // ==========================================
  // 2. EQUIPAMIENTO
  // ==========================================

  const [equipment, setEquipment] = useState(
    rentalEquipment
  );

  const [selected, setSelected] = useState([]);

  // ==========================================
  // 3. DATOS DEL FORMULARIO
  // ==========================================

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

  // Aviso para errores de carga del perfil.
  const [perfilAviso, setPerfilAviso] = useState("");

  // Estado de la consulta de rutas.
  const [source, setSource] = useState(
    apiEnabled
      ? "Consultando disponibilidad…"
      : "Experiencia de demostración. La disponibilidad no ha sido confirmada."
  );

  // ==========================================
  // 4. CARGAR PERFIL DEL CLIENTE DESDE MYSQL
  // NUEVA FUNCIONALIDAD
  // GET /auth/perfil
  // ==========================================

  useEffect(() => {

    // Solo consultar cuando:
    // - Hay conexion con el backend.
    // - Existe un JWT.
    // - El usuario tiene rol Cliente.
    if (
      !apiEnabled ||
      !authToken ||
      session?.rol !== "Cliente"
    ) {
      return;
    }

    let activo = true;

    setPerfilAviso("");

    // El API Gateway identifica al cliente
    // usando su JWT, sin recibir un usuarioId.
    request("/auth/perfil", {
      token: authToken,
    })
      .then((perfil) => {

        if (!activo) {
          return;
        }

        // Completar los datos recuperados de MySQL.
        setData((actual) => ({

          ...actual,

          // Reemplazar el username inicial por
          // el nombre completo del perfil.
          // No sobrescribir un nombre ingresado
          // manualmente por el usuario.
          nombre:
            !actual.nombre?.trim() ||
            actual.nombre === session?.nombre
              ? perfil.nombre || actual.nombre
              : actual.nombre,

          // Solo completar el correo si esta vacio.
          email:
            actual.email?.trim()
              ? actual.email
              : perfil.email || "",

          // Solo completar telefono si esta vacio.
          telefono:
            actual.telefono?.trim()
              ? actual.telefono
              : perfil.telefono || "",
        }));

        setPerfilAviso("");
      })
      .catch(() => {

        if (!activo) {
          return;
        }

        // Permitir que el cliente complete
        // sus datos manualmente si falla la consulta.
        setPerfilAviso(
          "No pudimos cargar tu perfil automáticamente. Puedes completar tus datos manualmente."
        );
      });

    // Evitar actualizar el formulario
    // si el usuario abandona esta pantalla.
    return () => {
      activo = false;
    };

  }, [
    authToken,
    session?.rol,
    session?.nombre,
  ]);

  // ==========================================
  // 5. CONSULTAR RUTAS Y EQUIPAMIENTO
  // ==========================================

  useEffect(() => {

    if (!localRoute || !apiEnabled) {
      return;
    }

    let active = true;

    // Consultar los microservicios.
    Promise.all([
      request(`/api/rutas/${id}`),
      request(`/api/equipamiento/recomendacion/${id}`),
    ])
      .then(([r, e]) => {

        if (!active) {
          return;
        }

        // Actualizar ruta.
        setRoute({
          ...localRoute,
          ...r,
        });

        // Actualizar equipamientos disponibles.
        setEquipment(
          embeddedList(e)
            .filter(
              (item) => item.disponible !== false
            )
            .map((item) => ({
              ...item,
              imagen:
                item.imagen || "/img/mochila.png",
            }))
        );

        setSource(
          "Datos consultados al servicio. Cupos sujetos a confirmación al reservar."
        );
      })
      .catch(() => {

        if (active) {
          setSource(
            "No pudimos consultar el servicio. Mostramos datos de demostración."
          );
        }
      });

    return () => {
      active = false;
    };

  }, [id, localRoute]);

  // ==========================================
  // 6. COMPROBAR QUE LA RUTA EXISTA
  // ==========================================

  if (!route) {
    return <NotFound />;
  }

  // ==========================================
  // 7. CALCULAR EQUIPAMIENTO Y TOTAL
  // ==========================================

  const chosen = equipment.filter(
    (item) => selected.includes(item.id)
  );

  const equipmentTotal = chosen.reduce(
    (total, item) =>
      total + Number(item.valorArriendo),
    0
  );

  const total =
    Number(route.precio) *
      Number(data.personas || 0) +
    equipmentTotal;

  // ==========================================
  // 8. ACTUALIZAR CAMPOS DEL FORMULARIO
  // ==========================================

  function change(e) {

    setData({
      ...data,

      [e.target.name]:
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    });
  }

  // ==========================================
  // 9. CREAR RESERVA UTILIZANDO JWT
  // POST /auth/reservas
  // ==========================================

  async function submit(e) {

    e.preventDefault();

    // Validar los datos ingresados.
    const error = validateReservation(data, route);

    if (error) {
      setMessage(error);
      return;
    }

    // Comprobar autenticacion.
    if (apiEnabled && !authToken) {
      setMessage(
        "Debes iniciar sesión como Cliente para confirmar tu reserva."
      );
      return;
    }

    setBusy(true);
    setMessage("");

    // Preparar borrador.
    const draft = {
      ...data,
      rutaId: route.id,
      rutaNombre: route.nombre,
      equipamientos: chosen,
      total,
    };

    try {

      // Modo demostracion sin backend.
      if (!apiEnabled) {

        writeStorage(
          "voy-vuelvo-reserva-borrador",
          draft
        );

        setMessage(
          "Borrador guardado en este navegador. Aún no existe una reserva confirmada."
        );

        return;
      }

      // Crear reserva real utilizando JWT.
      const saved = await submitReservation(
        data,
        route,
        chosen,
        authToken
      );

      // Verificar el ID de la reserva.
      if (!saved?.id) {
        throw new Error(
          "El servicio no confirmó un identificador de reserva."
        );
      }

      // Guardar datos de la ultima reserva.
      writeStorage(
        "voy-vuelvo-ultima-reserva",
        {
          ...saved,
          rutaNombre: route.nombre,
        }
      );

      // Mostrar confirmacion del backend.
      setMessage(
        `Reserva #${saved.id} creada correctamente. Estado de pago: ${saved.estadoPago || "PENDIENTE"}.`
      );

    } catch (error) {

      // Conservar el borrador si ocurre un error.
      try {

        writeStorage(
          "voy-vuelvo-reserva-borrador",
          draft
        );

        setMessage(
          `${error.message} Guardamos un borrador local; no confirma tu reserva.`
        );

      } catch (storageError) {

        setMessage(
          `${error.message} ${storageError.message}`
        );
      }

    } finally {
      setBusy(false);
    }
  }

  // ==========================================
  // 10. RECUPERAR BORRADOR
  // ==========================================

  function restore() {

    const draft = readStorage(
      "voy-vuelvo-reserva-borrador",
      null
    );

    if (draft?.rutaId !== route.id) {
      setMessage(
        "No hay un borrador para esta ruta."
      );

      return;
    }

    setData({
      ...data,
      ...draft,
    });

    setSelected(
      (draft.equipamientos || []).map(
        (item) => item.id
      )
    );

    setMessage(
      "Borrador recuperado. Revisa la fecha y los datos antes de continuar."
    );
  }

  // ==========================================
  // 11. MOSTRAR INTERFAZ DE RESERVA
  // ==========================================

  return (
    <PageTemplate className="container py-5">

      {/* VOLVER A LAS RUTAS */}
      <AppLink
        className="text-link"
        to="/rutas"
      >
        ← Todas las rutas
      </AppLink>

      <SplitTemplate
        className="row g-5 mt-1"
        introClass="col-lg-7"
        contentClass="col-lg-5"
        intro={
          <>

            {/* IMAGEN DE LA RUTA */}
            <Image
              className="reservation-photo"
              src={route.imagen}
              alt={route.nombre}
            />

            {/* INFORMACION DE LA RUTA */}
            <Text
              as="span"
              className="eyebrow d-block mt-4"
            >
              {route.ubicacion}
            </Text>

            <Heading as="h1">
              {route.nombre}
            </Heading>

            <Text>
              {route.descripcion}
            </Text>

            <Text>
              {route.duracion} · Dificultad{" "}
              {route.dificultad} · Máximo{" "}
              {route.cupoMaximo} personas
            </Text>

            <Text className="small">
              {source}
            </Text>

            {/* EQUIPAMIENTO */}
            <Heading
              as="h2"
              className="h4 mt-4"
            >
              Equipamiento para arrendar
            </Heading>

            <Text>
              El arriendo se suma una vez por
              artículo seleccionado.
            </Text>

            <RentalEquipmentList
              equipment={equipment}
              selected={selected}
              onSelectionChange={setSelected}
            />

          </>
        }
      >

        {/* FORMULARIO DE RESERVA */}
        <div className="form-panel">

          <Heading
            as="h2"
            className="h4"
          >
            Prepara tu reserva
          </Heading>

          {/* AVISO SI FALLA LA CARGA DEL PERFIL */}
          {perfilAviso && (
            <Text className="small text-danger">
              {perfilAviso}
            </Text>
          )}

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
