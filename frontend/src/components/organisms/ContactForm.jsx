import Button from "../atoms/Button";
import Text from "../atoms/Text";
import { useState } from "react";
import FormField from "../molecules/FormField.jsx";
import { validEmail } from "../../utils/validation.js";
import { readStorage, writeStorage } from "../../services/storage.js";
export default function ContactForm() {
  const [data, setData] = useState({ nombre: "", correo: "", comentario: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  function submit(e) {
    e.preventDefault();
    const invalid = {};
    if (!data.nombre.trim() || data.nombre.length > 100)
      invalid.nombre = "Ingresa tu nombre (máximo 100 caracteres).";
    if (!validEmail(data.correo)) invalid.correo = "Ingresa un correo válido.";
    if (!data.comentario.trim() || data.comentario.length > 500)
      invalid.comentario = "Escribe un mensaje de hasta 500 caracteres.";
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      setMessage("Revisa los campos marcados.");
      return;
    }
    try {
      const saved = readStorage("vv-react-messages", []);
      writeStorage("vv-react-messages", [
        ...(Array.isArray(saved) ? saved : []),
        { ...data, id: crypto.randomUUID() },
      ]);
      setMessage(
        "Mensaje guardado como demostración en este navegador. No se ha enviado al equipo.",
      );
      setData({ nombre: "", correo: "", comentario: "" });
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <form onSubmit={submit} noValidate>
      {[
        ["nombre", "Nombre completo", { maxLength: 100 }],
        ["correo", "Correo electrónico", { type: "email", maxLength: 100 }],
        [
          "comentario",
          "¿Cómo podemos ayudarte?",
          {
            as: "textarea",
            rows: 5,
            maxLength: 500,
            hint: `${data.comentario.length} / 500`,
          },
        ],
      ].map(([name, label, props]) => (
        <FormField
          key={name}
          name={name}
          label={label}
          value={data[name]}
          onChange={(e) => setData({ ...data, [name]: e.target.value })}
          error={errors[name]}
          required
          {...props}
        />
      ))}
      <Text role="status">{message}</Text>
      <Button type="submit" className="btn btn-warning">
        Guardar mensaje de demostración →
      </Button>
    </form>
  );
}
