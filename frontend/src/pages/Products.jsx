import PageTemplate from "../components/templates/PageTemplate";
import Heading from "../components/atoms/Heading";
import Text from "../components/atoms/Text";
import CardGrid from "../components/organisms/CardGrid";
import ProductFilters from "../components/organisms/ProductFilters.jsx";
import { useState } from "react";

import { useStore } from "../context/Store.jsx";
import { ProductCard } from "../components/molecules/ProductCard.jsx";

const normalized = (text) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function Products() {
  const { products } = useStore();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const filtered = products.filter(
    (p) =>
      normalized(`${p.nombre} ${p.categoria}`).includes(normalized(query)) &&
      (!difficulty || p.dificultad === difficulty),
  );
  return (
    <PageTemplate className="container py-5">
      <Text as="span" className="eyebrow">
        Todo para el camino
      </Text>
      <Heading as="h1">Equipamiento de trekking</Heading>
      <Text>Encuentra el equipo para tu próxima aventura.</Text>
      <ProductFilters
        query={query}
        onQueryChange={setQuery}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />
      <Text role="status">{filtered.length} productos encontrados</Text>
      <CardGrid
        items={filtered}
        columnClass="col-sm-6 col-xl-4"
        renderItem={(product) => <ProductCard product={product} />}
      />
      {!filtered.length && (
        <Text>No encontramos productos con estos filtros.</Text>
      )}
    </PageTemplate>
  );
}
