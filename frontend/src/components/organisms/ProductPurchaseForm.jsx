import Label from "../atoms/Label";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
export default function ProductPurchaseForm({
  product,
  quantity,
  onQuantityChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <Label className="form-label" htmlFor="cantidad">
        Cantidad
      </Label>
      <Input
        className="form-control mb-3 quantity"
        id="cantidad"
        type="number"
        min="1"
        max={product.stock}
        value={quantity}
        onChange={(e) => onQuantityChange(e.target.value)}
        required
      />
      <Button
        type="submit"
        className="btn btn-warning"
        disabled={product.stock < 1}
      >
        {product.stock ? "Agregar al carrito" : "Sin stock"}
      </Button>
    </form>
  );
}
