import PageTemplate from "../components/templates/PageTemplate";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import Label from "../components/atoms/Label";
import Heading from "../components/atoms/Heading";
import Text from "../components/atoms/Text";
import CardGrid from "../components/organisms/CardGrid";

import { useSearchParams } from "react-router-dom";

import { RouteCard } from "../components/molecules/RouteCard.jsx";
import { routes } from "../data/routes.js";

const normalized = (text) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function RoutesCatalog() {
  const [params, setParams] = useSearchParams();
  const query = params.get("destino") || "";
  const category = params.get("categoria") || "";
  const filtered = routes.filter(
    (r) =>
      normalized(`${r.nombre} ${r.ubicacion}`).includes(normalized(query)) &&
      (!category || r.categorias.includes(category)),
  );
  return (
    <PageTemplate className="container py-5">
      <Text as="span" className="eyebrow">
        Explora Chile paso a paso
      </Text>
      <Heading as="h1">Encuentra tu próxima ruta</Heading>
      <Text>Montañas, bosques y lagos. Elige tu experiencia.</Text>
      <Label className="form-label" htmlFor="buscar-rutas">
        Destino o región
      </Label>
      <Input
        id="buscar-rutas"
        className="form-control"
        type="search"
        value={query}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          next.set("destino", e.target.value);
          setParams(next, { replace: true });
        }}
      />
      <div className="d-flex flex-wrap gap-2 my-4">
        {[
          ["", "Todas"],
          ["montana", "Montaña"],
          ["bosque", "Bosque"],
          ["lagos", "Lagos"],
          ["familia", "Familia"],
        ].map(([key, label]) => (
          <Button
            key={key}
            className={`btn ${category === key ? "btn-dark" : "btn-outline-dark"}`}
            aria-pressed={category === key}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set("categoria", key);
              setParams(next);
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      {params.get("fecha") && (
        <Text>
          Salida solicitada: {params.get("fecha")} ·{" "}
          {params.get("personas") || 1} personas. Confirma disponibilidad al
          reservar.
        </Text>
      )}
      <Text role="status">{filtered.length} rutas encontradas</Text>
      <CardGrid
        items={filtered}
        columnClass="col-md-6 col-xl-4"
        renderItem={(route) => <RouteCard route={route} />}
      />
      {!filtered.length && <Text>No encontramos rutas con estos filtros.</Text>}
    </PageTemplate>
  );
}
