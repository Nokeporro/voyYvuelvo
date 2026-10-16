import { useState } from "react";
import Field from "../components/Field";
import { validEmail } from "../utils/validation";
import { readStorage, writeStorage } from "../services/storage";
export default function Contact() {
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
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-lg-5">
          <span className="eyebrow">Estamos para ayudarte</span>
          <h1>¿En qué podemos ayudarte?</h1>
          <p className="lead">
            Cuéntanos qué necesitas para preparar tu próxima aventura.
          </p>
          <p>
            ¿Dudas sobre rutas, equipamiento o cómo registrarte desde el
            extranjero? Déjanos tu consulta.
          </p>
        </div>
        <div className="col-lg-7">
          <div className="form-panel">
            <h2 className="h4">Envíanos un mensaje</h2>
            <form onSubmit={submit} noValidate>
              {[
                ["nombre", "Nombre completo", { maxLength: 100 }],
                [
                  "correo",
                  "Correo electrónico",
                  { type: "email", maxLength: 100 },
                ],
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
                <Field
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
              <p role="status">{message}</p>
              <button className="btn btn-warning">
                Guardar mensaje de demostración →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
