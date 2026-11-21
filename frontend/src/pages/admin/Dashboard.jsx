import { useEffect, useState } from "react";

import StatCard from "../../components/molecules/StatCard";
import PageTemplate from "../../components/templates/PageTemplate";
import Text from "../../components/atoms/Text";
import Heading from "../../components/atoms/Heading";

import { useStore } from "../../context/Store.jsx";

import {
  apiEnabled,
  request,
} from "../../services/api.js";

export function Dashboard() {

  // ==========================================
  // 1. DATOS DE LA SESION
  // ==========================================

  const {
    products,
    session,
    authToken,
  } = useStore();

  const isAdmin = session?.rol === "Administrador";

  // ==========================================
  // 2. ESTADOS DE LAS CUENTAS
  // ==========================================

  const [cuentas, setCuentas] = useState(null);

  const [cargando, setCargando] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // 3. CONSULTAR CUENTAS DESDE MYSQL
  // ==========================================

  useEffect(() => {

    // Solo el Administrador consulta cuentas.
    if (!isAdmin) {
      setCuentas(null);
      setError("");
      return;
    }

    if (!apiEnabled || !authToken) {
      setCuentas(null);
      setError(
        "No hay una conexion autenticada para consultar las cuentas."
      );
      return;
    }

    let activo = true;

    setCargando(true);
    setError("");

    // GET /auth/cuentas
    // El backend valida el JWT y el rol.
    request("/auth/cuentas", {
      token: authToken,
    })
      .then((respuesta) => {

        if (!activo) return;

        if (!Array.isArray(respuesta)) {
          throw new Error(
            "El servidor no entrego una lista valida de cuentas."
          );
        }

        setCuentas(respuesta);
        setError("");
      })
      .catch((err) => {

        if (!activo) return;

        setCuentas(null);

        setError(
          err.message ||
          "No pudimos consultar las cuentas."
        );
      })
      .finally(() => {

        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };

  }, [isAdmin, authToken]);

  // ==========================================
  // 4. ESTADISTICAS DE PRODUCTOS LOCALES
  // ==========================================

  const totalProductos = products.length;

  const stockCritico = products.filter(
    (producto) =>
      producto.stock <= producto.stockCritico
  ).length;

  // ==========================================
  // 5. MOSTRAR EL PANEL
  // ==========================================

  return (
    <PageTemplate className="">

      <Heading as="h1">
        Hola, {session?.nombre || session?.username || "Usuario"}
      </Heading>

      <Text>
        {isAdmin
          ? "Consulta las cuentas registradas y gestiona los productos de Voy & Vuelvo."
          : "Consulta los productos disponibles de Voy & Vuelvo."
        }
      </Text>

      <div className="row g-4 mt-2">

        {/* PRODUCTOS LOCALES */}
        <div className="col-md-4">
          <StatCard
            value={totalProductos}
            label="Productos en catálogo"
          />
        </div>

        {/* STOCK CRITICO LOCAL */}
        <div className="col-md-4">
          <StatCard
            value={stockCritico}
            label="Con stock crítico"
          />
        </div>

        {/* CUENTAS REALES: SOLO ADMINISTRADOR */}
        {isAdmin && (
          <div className="col-md-4">

            <StatCard
              value={
                cargando
                  ? "..."
                  : cuentas === null
                    ? "—"
                    : cuentas.length
              }
              label="Cuentas registradas en MySQL"
            />

          </div>
        )}

      </div>

      {/* ESTADO DE LA CONSULTA */}
      {isAdmin && cargando && (
        <Text role="status" className="mt-3">
          Consultando las cuentas registradas...
        </Text>
      )}

      {/* ERROR DE COMUNICACION */}
      {isAdmin && error && (
        <Text
          role="status"
          className="alert alert-warning mt-3"
        >
          {error}
        </Text>
      )}

      {/* INFORMACION DEL ORIGEN DE LOS DATOS */}
      <Text className="demo-note mt-4">
        {isAdmin
          ? "Las cuentas se consultan desde MySQL mediante JWT. El catálogo de productos y sus existencias todavía utilizan datos locales de demostración."
          : "El catálogo de productos y sus existencias todavía utilizan datos locales de demostración."
        }
      </Text>

    </PageTemplate>
  );
}
