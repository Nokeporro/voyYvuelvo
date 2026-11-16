import Heading from "../atoms/Heading";
import Text from "../atoms/Text";
import Image from "../atoms/Image";
import AppLink from "../atoms/AppLink";

import { money } from "../../utils/validation.js";
export function ProductCard({ product }) {
  return (
    <article className="adventure-card h-100">
      <AppLink to={`/productos/${product.id}`}>
        <Image
          className="product-photo"
          src={product.imagen || "/img/mochila.png"}
          alt={product.nombre}
          loading="lazy"
        />
      </AppLink>
      <div className="p-4">
        <Text as="span" className="eyebrow">
          {product.categoria}
        </Text>
        <Heading as="h3" className="h5 mt-2">
          <AppLink to={`/productos/${product.id}`}>{product.nombre}</AppLink>
        </Heading>
        <Text>{product.descripcion}</Text>
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <strong>{money(product.precio)}</strong>
          <AppLink
            className="btn btn-outline-dark btn-sm"
            to={`/productos/${product.id}`}
          >
            Ver producto →
          </AppLink>
        </div>
      </div>
    </article>
  );
}
