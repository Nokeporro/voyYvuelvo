import AppLink from "../atoms/AppLink";
import Badge from "../atoms/Badge";
import Button from "../atoms/Button";
import { money } from "../../utils/validation";
export default function ProductsTable({ products, isAdmin, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <caption>Catálogo compartido con la tienda</caption>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.codigo}</td>
              <td>{p.nombre}</td>
              <td>{money(p.precio)}</td>
              <td>
                {p.stock}
                {p.stock <= p.stockCritico && (
                  <Badge className="badge text-bg-warning ms-2">Crítico</Badge>
                )}
              </td>
              <td>
                <AppLink
                  className="btn btn-outline-dark btn-sm"
                  to={`/admin/productos/${p.id}`}
                >
                  {isAdmin ? "Editar" : "Ver detalle"}
                </AppLink>
                {isAdmin && (
                  <Button
                    className="btn btn-outline-danger btn-sm ms-2"
                    onClick={() => onDelete(p)}
                  >
                    Eliminar {p.nombre}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
