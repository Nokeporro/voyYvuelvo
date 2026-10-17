import AppLink from "../atoms/AppLink";
import Button from "../atoms/Button";
import Heading from "../atoms/Heading";
import Image from "../atoms/Image";
import Input from "../atoms/Input";
import Label from "../atoms/Label";
import Text from "../atoms/Text";
import { money } from "../../utils/validation";

export default function CartItem({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}) {
  return (
    <article className="cart-row">
      <Image src={product.imagen || "/img/mochila.png"} alt={product.nombre} />
      <div className="flex-grow-1">
        <AppLink to={`/productos/${product.id}`}>
          <Heading as="h2" className="h5">
            {product.nombre}
          </Heading>
        </AppLink>
        <Text>{money(product.precio)} por unidad</Text>
        <Label htmlFor={`cantidad-${product.id}`}>
          Cantidad de {product.nombre}
        </Label>
        <Input
          className="form-control quantity"
          id={`cantidad-${product.id}`}
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
        />
      </div>
      <div className="text-end">
        <strong>{money(product.precio * quantity)}</strong>
        <Button className="btn btn-link text-danger d-block" onClick={onRemove}>
          Eliminar {product.nombre}
        </Button>
      </div>
    </article>
  );
}
