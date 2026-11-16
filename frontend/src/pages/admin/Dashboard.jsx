import StatCard from "../../components/molecules/StatCard";
import PageTemplate from "../../components/templates/PageTemplate";
import Text from "../../components/atoms/Text";
import Heading from "../../components/atoms/Heading";

import { useStore } from "../../context/Store.jsx";
import { getUsers } from "../../services/accounts.js";

export function Dashboard() {
  const { products, session } = useStore();
  return (
    <PageTemplate className="">
      <Heading as="h1">Hola, {session.nombre}</Heading>
      <Text>Gestiona el equipamiento y las cuentas de Voy &amp; Vuelvo.</Text>
      <div className="row g-4 mt-2">
        {[
          [products.length, "Productos en catálogo"],
          [
            products.filter((p) => p.stock <= p.stockCritico).length,
            "Con stock crítico",
          ],
          ...(session.rol === "Administrador"
            ? [[getUsers().length, "Cuentas registradas"]]
            : []),
        ].map(([n, label]) => (
          <div className="col-md-4" key={label}>
            <StatCard value={n} label={label} />
          </div>
        ))}
      </div>
      <Text className="demo-note mt-4">
        Panel académico con datos guardados en este navegador.
      </Text>
    </PageTemplate>
  );
}
