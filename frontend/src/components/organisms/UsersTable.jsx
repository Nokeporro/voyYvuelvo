import AppLink from "../atoms/AppLink";

import Button from "../atoms/Button";

export default function UsersTable({ users, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table">
        <caption>Cuentas locales de demostración</caption>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Documento</th>
            <th>País emisor</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                {u.nombre} {u.apellidos}
              </td>
              <td>{u.correo}</td>
              <td>
                {u.tipoDocumento}: {u.documento}
              </td>
              <td>{u.paisEmisor}</td>
              <td>{u.rol}</td>
              <td>
                <AppLink
                  to={`/admin/usuarios/${u.id}`}
                  className="btn btn-outline-dark btn-sm"
                >
                  Editar
                </AppLink>
                <Button
                  className="btn btn-outline-danger btn-sm ms-2"
                  onClick={() => onDelete(u)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
