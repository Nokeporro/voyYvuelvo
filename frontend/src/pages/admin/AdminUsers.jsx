import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import ConfirmationPrompt from "../../components/molecules/ConfirmationPrompt";
import UsersTable from "../../components/organisms/UsersTable";
import PageTemplate from "../../components/templates/PageTemplate";

import Text from "../../components/atoms/Text";
import Input from "../../components/atoms/Input";
import Label from "../../components/atoms/Label";
import AppLink from "../../components/atoms/AppLink";
import Heading from "../../components/atoms/Heading";

import { useStore } from "../../context/Store.jsx";
import { deleteAccount, getUsers } from "../../services/accounts.js";
import { apiEnabled, request } from "../../services/api.js";

export function AdminUsers() {
  const { session, authToken } = useStore();

  // Cuentas locales de demostración.
  // Se conservan para no romper el módulo antiguo.
  const [users, setUsers] = useState(getUsers);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState("");

  // Cuentas reales consultadas desde MySQL.
  const [cuentasReales, setCuentasReales] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errorBackend, setErrorBackend] = useState("");
  const [busquedaReal, setBusquedaReal] = useState("");

  const esAdministrador = session?.rol === "Administrador";

  // ==========================================
  // 1. CONSULTAR CUENTAS REALES CON JWT
  // ==========================================

  useEffect(() => {
    if (!esAdministrador) {
      return;
    }

    if (!apiEnabled || !authToken) {
      setErrorBackend(
        "No hay una conexión autenticada con el backend."
      );
      return;
    }

    let activo = true;

    setCargando(true);
    setErrorBackend("");

    request("/auth/cuentas", {
      token: authToken,
    })
      .then((respuesta) => {
        if (!activo) return;

        if (!Array.isArray(respuesta)) {
          throw new Error(
            "El servidor no entregó una lista válida."
          );
        }

        setCuentasReales(respuesta);
      })
      .catch((error) => {
        if (!activo) return;

        setCuentasReales([]);
        setErrorBackend(
          error.message ||
          "No se pudieron consultar las cuentas."
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
  }, [esAdministrador, authToken]);

  // ==========================================
  // 2. CONTROL DE ACCESO
  // ==========================================

  if (!esAdministrador) {
    return (
      <Navigate to="/admin/productos" replace />
    );
  }

  // ==========================================
  // 3. FILTRAR CUENTAS REALES
  // ==========================================

  const cuentasFiltradas = cuentasReales.filter((cuenta) =>
    `${cuenta.username} ${cuenta.rol} ${cuenta.id}`
      .toLowerCase()
      .includes(busquedaReal.toLowerCase())
  );

  // ==========================================
  // 4. ELIMINAR SOLO CUENTAS LOCALES DEMO
  // ==========================================

  function eliminarCuentaLocal() {
    try {
      deleteAccount(pending.id);
      setUsers(getUsers());
      setPending(null);
      setMessage("Cuenta local eliminada.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  // ==========================================
  // 5. INTERFAZ ADMINISTRATIVA
  // ==========================================

  return (
    <PageTemplate className="">

      <Heading as="h1">Usuarios</Heading>

      {/* CUENTAS REALES DESDE MYSQL */}
      <section className="mt-4">
        <Heading as="h2" className="h5 mb-3">
          Cuentas registradas en MySQL
        </Heading>

        <Text className="small mb-3">
          Información consultada desde Spring Boot
          utilizando el JWT del Administrador.
        </Text>

        <Label
          htmlFor="buscar-cuentas-mysql"
          className="form-label"
        >
          Buscar cuenta real
        </Label>

        <Input
          id="buscar-cuentas-mysql"
          className="form-control mb-3"
          value={busquedaReal}
          onChange={(e) =>
            setBusquedaReal(e.target.value)
          }
        />

        {cargando && (
          <Text role="status">
            Consultando cuentas registradas...
          </Text>
        )}

        {errorBackend && (
          <Text
            role="status"
            className="alert alert-warning"
          >
            {errorBackend}
          </Text>
        )}

        {!cargando && !errorBackend && (
          <>
            <Text className="mb-3">
              Total de cuentas registradas:{" "}
              <strong>{cuentasReales.length}</strong>
            </Text>

            <div className="table-responsive">
              <table className="table table-striped">
                <caption>
                  Cuentas reales de bd_gateway
                </caption>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>ID del perfil</th>
                  </tr>
                </thead>

                <tbody>
                  {cuentasFiltradas.map((cuenta) => (
                    <tr key={cuenta.id}>
                      <td>{cuenta.id}</td>
                      <td>{cuenta.username}</td>
                      <td>{cuenta.rol}</td>
                      <td>
                        {cuenta.perfilUsuarioId ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {cuentasFiltradas.length === 0 && (
              <Text>
                No se encontraron cuentas con esa búsqueda.
              </Text>
            )}
          </>
        )}

        <Text className="demo-note mt-3">
          Este listado es de solo lectura. No muestra
          contraseñas y no permite modificar las
          cuentas reales.
        </Text>
      </section>

      {/* CUENTAS LOCALES DE DEMOSTRACION */}
      <section className="mt-5">

        <div className="section-heading">
          <Heading as="h2" className="h5">
            Cuentas locales de demostración
          </Heading>

          <AppLink
            to="/admin/usuarios/nuevo"
            className="btn btn-warning"
          >
            Nuevo usuario
          </AppLink>
        </div>

        <Text className="small mb-3">
          Esta sección conserva las funciones
          académicas de creación, edición y
          eliminación local. Sus cambios no
          modifican las cuentas de MySQL.
        </Text>

        <Label
          htmlFor="buscar-usuario"
          className="form-label"
        >
          Buscar usuario local
        </Label>

        <Input
          id="buscar-usuario"
          className="form-control mb-4"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Text role="status">{message}</Text>

        {pending && (
          <ConfirmationPrompt
            onConfirm={eliminarCuentaLocal}
            onCancel={() => setPending(null)}
          >
            ¿Eliminar la cuenta local de{" "}
            {pending.nombre}?
          </ConfirmationPrompt>
        )}

        <UsersTable
          users={users.filter((u) =>
            `${u.nombre} ${u.correo} ${u.documento}`
              .toLowerCase()
              .includes(query.toLowerCase())
          )}
          onDelete={setPending}
        />

        {!users.length && (
          <Text>
            Aún no hay cuentas registradas.
          </Text>
        )}

      </section>

    </PageTemplate>
  );
}
