import { useState } from "react";
import { Link } from "react-router-dom";
import Field from "../components/Field";
import { regions } from "../data/regions";
import { validateRegistration } from "../utils/validation";
import { saveAccount } from "../services/accounts";
export const emptyRegistration = {
  tipoDocumento: "rut",
  documento: "",
  paisEmisor: "",
  nombre: "",
  apellidos: "",
  correo: "",
  password: "",
  confirmacion: "",
  telefono: "",
  region: "",
  comuna: "",
  direccion: "",
  acepta: false,
};
export function RegistrationForm({
  initial = emptyRegistration,
  onSave = saveAccount,
  admin = false,
}) {
  const [data, setData] = useState({
    ...initial,
    password: "",
    confirmacion: "",
    acepta: false,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  function change(e) {
    const { name, value, type, checked } = e.target;
    const next = { ...data, [name]: type === "checkbox" ? checked : value };
    if (name === "region") next.comuna = "";
    if (name === "tipoDocumento") {
      next.documento = "";
      next.paisEmisor = "";
      next.region = "";
      next.comuna = "";
      setErrors({});
    } else if (Object.keys(errors).length)
      setErrors(validateRegistration(next));
    setData(next);
    setMessage("");
    setSuccess(false);
  }
  async function submit(e) {
    e.preventDefault();
    const nextErrors = validateRegistration(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setMessage("Revisa los campos marcados para continuar.");
      e.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await onSave(data);
      setSuccess(true);
      setMessage(
        admin
          ? "Usuario guardado correctamente."
          : "¡Tu cuenta está creada! Ya puedes iniciar sesión.",
      );
      setData({ ...emptyRegistration });
    } catch (error) {
      setSuccess(false);
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  const field = (name, label, props = {}) => (
    <Field
      key={name}
      name={name}
      label={label}
      value={data[name]}
      onChange={change}
      error={errors[name]}
      {...props}
    />
  );
  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label={admin ? "Formulario de usuario" : "Crear cuenta"}
    >
      <div className="row g-3">
        <div className="col-md-6">
          {field("tipoDocumento", "Tipo de documento", {
            children: (
              <>
                <option value="rut">RUT chileno</option>
                <option value="pasaporte">Pasaporte</option>
              </>
            ),
          })}
        </div>
        <div className="col-md-6">
          {field(
            "documento",
            data.tipoDocumento === "rut" ? "RUT" : "Número de pasaporte",
            {
              required: true,
              maxLength: data.tipoDocumento === "rut" ? 12 : 20,
              hint:
                data.tipoDocumento === "rut"
                  ? "Con o sin puntos y guion. Ejemplo: 12.345.678-5."
                  : "Entre 5 y 20 letras o números. Se valida el formato, no la autenticidad.",
            },
          )}
        </div>
      </div>
      {data.tipoDocumento === "pasaporte" &&
        field("paisEmisor", "País emisor del pasaporte", {
          required: true,
          maxLength: 80,
          autoComplete: "country-name",
        })}
      <div className="row g-3">
        <div className="col-md-6">
          {field("nombre", "Nombre", {
            required: true,
            maxLength: 50,
            autoComplete: "given-name",
          })}
        </div>
        <div className="col-md-6">
          {field("apellidos", "Apellidos", {
            required: true,
            maxLength: 100,
            autoComplete: "family-name",
          })}
        </div>
      </div>
      {field("correo", "Correo electrónico", {
        type: "email",
        required: true,
        maxLength: 100,
        autoComplete: "email",
        hint: "Puedes usar tu correo habitual, sea cual sea su dominio.",
      })}
      <div className="row g-3">
        <div className="col-md-6">
          {field("password", "Contraseña", {
            type: "password",
            required: true,
            minLength: 8,
            maxLength: 64,
            autoComplete: "new-password",
            hint: admin
              ? "Al editar, establece una nueva contraseña."
              : "Entre 8 y 64 caracteres.",
          })}
        </div>
        <div className="col-md-6">
          {field("confirmacion", "Confirmar contraseña", {
            type: "password",
            required: true,
            autoComplete: "new-password",
          })}
        </div>
      </div>
      {field("telefono", "Teléfono de contacto", {
        type: "tel",
        required: true,
        autoComplete: "tel",
        hint: "Incluye el código de país para que podamos contactarte.",
      })}
      {data.tipoDocumento === "rut" && (
        <div className="row g-3">
          <div className="col-md-6">
            {field("region", "Región", {
              required: true,
              children: (
                <>
                  <option value="">Selecciona una región</option>
                  {regions.map((r) => (
                    <option key={r.region}>{r.region}</option>
                  ))}
                </>
              ),
            })}
          </div>
          <div className="col-md-6">
            {field("comuna", "Comuna", {
              required: true,
              disabled: !data.region,
              children: (
                <>
                  <option value="">Selecciona una comuna</option>
                  {(
                    regions.find((r) => r.region === data.region)?.comunas || []
                  ).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </>
              ),
            })}
          </div>
        </div>
      )}
      {field("direccion", "Domicilio o alojamiento en Chile", {
        required: true,
        maxLength: 300,
        autoComplete: "street-address",
        hint: "Para visitantes, indica el alojamiento o dirección de contacto durante tu estadía.",
      })}
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="acepta"
          name="acepta"
          checked={data.acepta}
          onChange={change}
          aria-invalid={Boolean(errors.acepta)}
          aria-describedby="acepta-error"
        />
        <label className="form-check-label" htmlFor="acepta">
          Acepto el uso de mis datos para gestionar mi cuenta y mis solicitudes.
        </label>
        <small id="acepta-error" className="invalid-feedback d-block">
          {errors.acepta}
        </small>
      </div>
      <p
        role="status"
        className={
          message ? `alert ${success ? "alert-success" : "alert-danger"}` : ""
        }
      >
        {message}
      </p>
      <button className="btn btn-warning w-100" disabled={busy}>
        {busy ? "Guardando…" : admin ? "Guardar usuario" : "Crear cuenta"}
      </button>
      {success && !admin && (
        <Link className="btn btn-outline-dark w-100 mt-3" to="/login">
          Iniciar sesión
        </Link>
      )}
    </form>
  );
}
export default function Register() {
  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-lg-5">
          <span className="eyebrow">Tu próximo camino empieza aquí</span>
          <h1>
            La aventura
            <br />
            no tiene fronteras.
          </h1>
          <p className="lead">
            Regístrate con tu RUT o pasaporte y prepara tu próxima experiencia
            de trekking en Chile.
          </p>
          <img
            className="registration-photo"
            src="/img/montana-sendero.png"
            alt="Sendero entre montañas de Chile"
          />
          <p className="mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link className="text-link" to="/login">
              Inicia sesión →
            </Link>
          </p>
        </div>
        <section className="col-lg-7">
          <div className="form-panel">
            <h2 className="h4 mb-4">Crea tu cuenta</h2>
            <RegistrationForm />
            <p className="demo-note mt-3 mb-0">
              Demostración académica: tu cuenta se guarda en este navegador. Usa
              datos de prueba.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
