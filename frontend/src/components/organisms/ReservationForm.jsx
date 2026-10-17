import Button from "../atoms/Button";
import Text from "../atoms/Text";
import Input from "../atoms/Input";
import Label from "../atoms/Label";
import TotalsSummary from "../molecules/TotalsSummary";

import { apiEnabled } from "../../services/api.js";

import { money, tomorrow } from "../../utils/validation.js";
import FormField from "../molecules/FormField.jsx";

export default function ReservationForm({
  data,
  change,
  route,
  equipmentTotal,
  total,
  message,
  busy,
  submit,
  restore,
  apiEnabled,
}) {
  return (
    <form onSubmit={submit} noValidate>
      {[
        ["nombre", "Nombre completo", { autoComplete: "name" }],
        [
          "email",
          "Correo electrónico",
          { type: "email", autoComplete: "email" },
        ],
        ["telefono", "Teléfono", { type: "tel", autoComplete: "tel" }],
        ["fecha", "Fecha de salida", { type: "date", min: tomorrow() }],
        [
          "personas",
          "Personas",
          { type: "number", min: 1, max: route.cupoMaximo },
        ],
      ].map(([name, label, props]) => (
        <FormField
          key={name}
          name={name}
          label={label}
          value={data[name]}
          onChange={change}
          required
          {...props}
        />
      ))}
      <Label className="form-check mb-4">
        <Input
          className="form-check-input"
          name="guia"
          type="checkbox"
          checked={data.guia}
          onChange={change}
        />
        Solicitar guía (precio por confirmar)
      </Label>
      <TotalsSummary
        items={[
          {
            label: "Ruta por persona",
            value: money(Number(route.precio)),
            emphasis: false,
          },
          { label: "Arriendo", value: money(equipmentTotal), emphasis: false },
          { label: "Total estimado", value: money(total), emphasis: true },
        ]}
      />
      <Text className="small">
        El total no incluye un eventual servicio de guía.
      </Text>
      <Text role="status">{message}</Text>
      <Button type="submit" disabled={busy} className="btn btn-warning w-100">
        {busy
          ? "Guardando…"
          : apiEnabled
            ? "Confirmar reserva"
            : "Guardar borrador de reserva"}
      </Button>
      <Button
        className="btn btn-link w-100 mt-2"
        type="button"
        onClick={restore}
      >
        Recuperar borrador
      </Button>
    </form>
  );
}
