import ProductPurchaseForm from "../components/organisms/ProductPurchaseForm";
import PageTemplate from "../components/templates/PageTemplate";

import Heading from "../components/atoms/Heading";
import Text from "../components/atoms/Text";
import Image from "../components/atoms/Image";
import AppLink from "../components/atoms/AppLink";
import SplitTemplate from "../components/templates/SplitTemplate";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../context/Store.jsx";

import { money } from "../utils/validation.js";
import { NotFound } from "./NotFound.jsx";
export function ProductDetail() {
  const { id } = useParams();
  const { products, add } = useStore();
  const product = products.find((p) => String(p.id) === id);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  if (!product) return <NotFound />;
  return (
    <PageTemplate className="container py-5">
      <AppLink className="text-link" to="/productos">
        ← Volver al catálogo
      </AppLink>
      <SplitTemplate
        className="row g-5 mt-2"
        introClass="col-md-6"
        contentClass="col-md-6"
        intro={
          <>
            <Image
              className="detail-photo"
              src={product.imagen || "/img/mochila.png"}
              alt={product.nombre}
            />
          </>
        }
      >
        <Text as="span" className="eyebrow">
          {product.categoria}
        </Text>
        <Heading as="h1">{product.nombre}</Heading>
        <Text>{product.descripcion}</Text>
        <Text className="h3 my-4">{money(product.precio)}</Text>
        <Text>Stock disponible: {product.stock} unidades</Text>
        <ProductPurchaseForm
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onSubmit={(e) => {
            e.preventDefault();
            try {
              add(product.id, Number(quantity));
              setMessage("Producto agregado al carrito.");
            } catch (e) {
              setMessage(e.message);
            }
          }}
        />
        <Text className="mt-3" role="status">
          {message}
        </Text>
        <AppLink to="/carrito" className="text-link">
          Ver carrito →
        </AppLink>
      </SplitTemplate>
    </PageTemplate>
  );
}
