import Input from "../atoms/Input";
import Select from "../atoms/Select";
import Textarea from "../atoms/Textarea";
import Label from "../atoms/Label";
import Text from "../atoms/Text";

export default function FormField({
  name,
  label,
  value,
  onChange,
  error,
  hint,
  children,
  as,
  ...props
}) {
  const shared = {
    id: name,
    name,
    value,
    onChange,
    "aria-invalid": Boolean(error),
    "aria-describedby": `${name}-hint ${name}-error`,
    ...props,
  };
  const Control = children ? Select : as === "textarea" ? Textarea : Input;
  return (
    <div className="mb-3">
      <Label htmlFor={name}>{label}</Label>
      <Control
        {...shared}
        className={`${children ? "form-select" : "form-control"} ${error ? "is-invalid" : ""}`}
      >
        {children}
      </Control>
      <Text as="small" id={`${name}-hint`} className="form-text d-block">
        {hint}
      </Text>
      <Text
        as="small"
        id={`${name}-error`}
        className="invalid-feedback d-block"
        aria-live="polite"
      >
        {error}
      </Text>
    </div>
  );
}
