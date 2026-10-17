import SectionHeading from "../molecules/SectionHeading";
import CardGrid from "./CardGrid";

import { ProductCard } from "../molecules/ProductCard.jsx";

export default function FeaturedProducts({ products }) {
  return (
    <section className="py-5">
      <SectionHeading
        title="Equípate para tu aventura"
        eyebrow="Prepara tu próxima salida"
        description="Lleva contigo lo necesario para disfrutar del camino."
        to="/productos"
        linkLabel="Ver equipamiento →"
      />
      <CardGrid
        items={products.filter((p) => p.destacado).slice(0, 3)}
        columnClass="col-md-6 col-xl-4"
        renderItem={(product) => <ProductCard product={product} />}
      />
    </section>
  );
}
