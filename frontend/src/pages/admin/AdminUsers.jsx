import ConfirmationPrompt from "../../components/molecules/ConfirmationPrompt";
import UsersTable from "../../components/organisms/UsersTable";
import PageTemplate from "../../components/templates/PageTemplate";

import Text from "../../components/atoms/Text";
import Input from "../../components/atoms/Input";
import Label from "../../components/atoms/Label";
import AppLink from "../../components/atoms/AppLink";
import Heading from "../../components/atoms/Heading";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useStore } from "../../context/Store.jsx";
import { deleteAccount, getUsers } from "../../services/accounts.js";

export function AdminUsers() {
  const { session } = useStore();
  const [users, setUsers] = useState(getUsers);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState("");
  if (session.rol !== "Administrador")
    return <Navigate to="/admin/productos" replace />;
  return (
    <PageTemplate className="">
      <div className="section-heading">
        <Heading as="h1">Usuarios</Heading>
        <AppLink to="/admin/usuarios/nuevo" className="btn btn-warning">
          Nuevo usuario
        </AppLink>
      </div>
      <Label htmlFor="buscar-usuario" className="form-label">
        Buscar usuario
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
          onConfirm={() => {
            try {
              deleteAccount(pending.id);
              setUsers(getUsers());
              setPending(null);
              setMessage("Cuenta eliminada.");
            } catch (e) {
              setMessage(e.message);
            }
          }}
          onCancel={() => setPending(null)}
        >
          ¿Eliminar la cuenta de {pending.nombre}?
        </ConfirmationPrompt>
      )}
      <UsersTable
        users={users.filter((u) =>
          `${u.nombre} ${u.correo} ${u.documento}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )}
        onDelete={setPending}
      />
      {!users.length && <Text>Aún no hay cuentas registradas.</Text>}
    </PageTemplate>
  );
}
