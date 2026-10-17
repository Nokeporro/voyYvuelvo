import Button from "../atoms/Button";

export default function ConfirmationPrompt({
  children,
  onConfirm,
  onCancel,
  role,
}) {
  return (
    <div className="alert alert-warning" role={role}>
      {children}{" "}
      <Button className="btn btn-danger btn-sm ms-2" onClick={onConfirm}>
        Confirmar eliminación
      </Button>
      <Button className="btn btn-outline-dark btn-sm ms-2" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}
