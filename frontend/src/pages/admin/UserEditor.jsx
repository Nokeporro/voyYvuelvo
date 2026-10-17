import PageTemplate from "../../components/templates/PageTemplate";
import AppLink from "../../components/atoms/AppLink";
import Heading from "../../components/atoms/Heading";
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useStore } from "../../context/Store.jsx";
import { getUsers, saveAccount } from "../../services/accounts.js";
import { RegistrationForm } from "../../components/organisms/RegistrationForm.jsx";
import { emptyRegistration } from "../../components/organisms/RegistrationForm.jsx";
import FormField from "../../components/molecules/FormField.jsx";

import { NotFound } from "../NotFound.jsx";
export function UserEditor() {
  const { session } = useStore();
  const { id } = useParams();
  const original = getUsers().find((u) => u.id === id);
  const [role, setRole] = useState(original?.rol || "Cliente");
  if (session.rol !== "Administrador")
    return <Navigate to="/admin/productos" replace />;
  if (id && !original) return <NotFound />;
  return (
    <PageTemplate className="">
      <Heading as="h1">{original ? "Editar usuario" : "Nuevo usuario"}</Heading>
      <div className="form-panel">
        <FormField
          name="rol"
          label="Rol del usuario"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {["Cliente", "Vendedor", "Administrador"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </FormField>
        <RegistrationForm
          key={id || "new"}
          initial={{ ...emptyRegistration, ...original }}
          admin
          onSave={(data) => saveAccount(data, original?.id, role)}
        />
        <AppLink className="text-link d-inline-block mt-3" to="/admin/usuarios">
          ← Volver al listado
        </AppLink>
      </div>
    </PageTemplate>
  );
}
