import ConfirmationPrompt from "../../components/molecules/ConfirmationPrompt";
import ProductsTable from "../../components/organisms/ProductsTable";
import PageTemplate from "../../components/templates/PageTemplate";

import Text from "../../components/atoms/Text";
import Input from "../../components/atoms/Input";
import Label from "../../components/atoms/Label";
import AppLink from "../../components/atoms/AppLink";
import Heading from "../../components/atoms/Heading";
import { useState } from "react";

import { useStore } from "../../context/Store.jsx";

export function AdminProducts() {
  const { products, saveProducts, session } = useStore();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(null);
  const isAdmin = session.rol === "Administrador";
  function remove() {
    try {
      saveProducts(products.filter((p) => p.id !== pending.id));
      setMessage("Producto eliminado.");
      setPending(null);
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <PageTemplate className="">
      <div className="section-heading">
        <Heading as="h1">Productos</Heading>
        {isAdmin && (
          <AppLink className="btn btn-warning" to="/admin/productos/nuevo">
            Nuevo producto
          </AppLink>
        )}
      </div>
      <Label className="form-label" htmlFor="buscar-admin-producto">
        Buscar por nombre o código
      </Label>
      <Input
        className="form-control mb-4"
        id="buscar-admin-producto"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Text role="status">{message}</Text>
      {pending && (
        <ConfirmationPrompt
          role="alert"
          onConfirm={remove}
          onCancel={() => setPending(null)}
        >
          ¿Eliminar {pending.nombre}?
        </ConfirmationPrompt>
      )}
      <ProductsTable
        products={products.filter((p) =>
          `${p.nombre} ${p.codigo}`.toLowerCase().includes(query.toLowerCase()),
        )}
        isAdmin={isAdmin}
        onDelete={setPending}
      />
    </PageTemplate>
  );
}
