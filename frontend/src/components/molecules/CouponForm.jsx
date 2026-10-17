import Button from "../atoms/Button";
import Input from "../atoms/Input";
import Label from "../atoms/Label";
import Text from "../atoms/Text";

export default function CouponForm({ value, onChange, onApply }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply(value.trim().toUpperCase());
      }}
    >
      <Label htmlFor="cupon">Cupón de descuento</Label>
      <div className="input-group">
        <Input
          id="cupon"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button type="submit" className="btn btn-outline-dark">
          Aplicar
        </Button>
      </div>
      <Text as="small" className="form-text">
        Prueba AVENTURA10
      </Text>
    </form>
  );
}
