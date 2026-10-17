import Image from "../atoms/Image";
import Input from "../atoms/Input";
import Label from "../atoms/Label";
import Text from "../atoms/Text";
import { money } from "../../utils/validation";

export default function RentalOption({ item, selected, onChange }) {
  return (
    <Label className={`rental-card ${selected ? "selected" : ""}`}>
      <Image src={item.imagen} alt="" />
      <Text as="span">
        <strong>{item.nombre}</strong>
        <Text as="small" className="d-block">
          {money(Number(item.valorArriendo))} / arriendo
        </Text>
      </Text>
      <Input
        type="checkbox"
        className=""
        checked={selected}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={`Arrendar ${item.nombre}`}
      />
    </Label>
  );
}
