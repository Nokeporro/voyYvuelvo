import AppLink from "../atoms/AppLink";
import Button from "../atoms/Button";
import Text from "../atoms/Text";
import Label from "../atoms/Label";
import Input from "../atoms/Input";
import { useState } from "react";

import FormField from "../molecules/FormField.jsx";
import { regions } from "../../data/regions.js";
import { validateRegistration } from "../../utils/validation.js";
import { saveAccount } from "../../services/accounts.js";

// DATOS INICIALES DEL FORMULARIO
export const emptyRegistration = {
  username: "",
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
  backend = false,
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

  // ACTUALIZAR CAMPOS
  function change(e) {
    const { name, value, type, checked } = e.target;

    const next = {
      ...data,
      [name]: type === "checkbox" ? checked : value,
    };

    if (name === "region") {
      next.comuna = "";
    }

    if (name === "tipoDocumento") {
      next.documento = "";
      next.paisEmisor = "";
      next.region = "";
      next.comuna = "";
      setErrors({});
    } else if (Object.keys(errors).length) {
      const nuevosErrores = validateRegistration(next);

      if (
        backend &&
        !admin &&
        !/^[A-Za-z0-9._-]{3,30}$/.test(
          next.username?.trim() || ""
        )
      ) {
        nuevosErrores.username =
          "Usa entre 3 y 30 caracteres: letras, números, puntos, guiones o guion bajo.";
      }

      setErrors(nuevosErrores);
    }

    setData(next);
    setMessage("");
    setSuccess(false);
  }

  // GUARDAR CUENTA
  async function submit(e) {
    e.preventDefault();

    const nextErrors = validateRegistration(data);

    // Validar username para cuentas del backend.
    if (
      backend &&
      !admin &&
      !/^[A-Za-z0-9._-]{3,30}$/.test(
        data.username?.trim() || ""
      )
    ) {
      nextErrors.username =
        "Usa entre 3 y 30 caracteres: letras, números, puntos, guiones o guion bajo.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessage(
        "Revisa los campos marcados para continuar."
      );

      e.currentTarget.elements
        .namedItem(Object.keys(nextErrors)[0])
        ?.focus();

      return;
    }

    setBusy(true);
    setMessage("");

    try {
      // El servicio depende del formulario:
      // Backend para registro público.
      // Almacenamiento local para administración demo.
      await onSave(data);

      setSuccess(true);

      setMessage(
        admin
          ? "Usuario guardado correctamente."
          : "¡Tu cuenta está creada! Ya puedes iniciar sesión."
      );

      setData({ ...emptyRegistration });

    } catch (error) {
      setSuccess(false);
      setMessage(
        error.message || "No se pudo registrar la cuenta."
      );
    } finally {
      setBusy(false);
    }
  }

  // CREAR CAMPOS
  const field = (name, label, props = {}) => (
    <FormField
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
      aria-label={
        admin ? "Formulario de usuario" : "Crear cuenta"
      }
    >
      {/* NOMBRE DE USUARIO PARA JWT */}
      {backend && !admin &&
        field("username", "Nombre de usuario", {
          required: true,
          minLength: 3,
          maxLength: 30,
          autoComplete: "username",
          hint:
            "Este será tu usuario para iniciar sesión.",
        })}

      {/* DOCUMENTO DE IDENTIDAD */}
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
            data.tipoDocumento === "rut"
              ? "RUT"
              : "Número de pasaporte",
            {
              required: true,
              maxLength:
                data.tipoDocumento === "rut" ? 12 : 20,
              hint:
                data.tipoDocumento === "rut"
                  ? "Con o sin puntos y guion. Ejemplo: 12.345.678-5."
                  : "Entre 5 y 20 letras o números.",
            }
          )}
        </div>
      </div>

      {/* PASAPORTE */}
      {data.tipoDocumento === "pasaporte" &&
        field("paisEmisor", "País emisor del pasaporte", {
          required: true,
          maxLength: 80,
          autoComplete: "country-name",
        })}

      {/* NOMBRE Y APELLIDOS */}
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

      {/* CORREO */}
      {field("correo", "Correo electrónico", {
        type: "email",
        required: true,
        maxLength: 100,
        autoComplete: "email",
        hint:
          "Puedes usar tu correo habitual, sea cual sea su dominio.",
      })}

      {/* CONTRASEÑAS */}
      <div className="row g-3">
        <div className="col-md-6">
          {field("password", "Contraseña", {
            type: "password",
            required: true,
            minLength: 8,
            maxLength: 64,
            autoComplete: "new-password",
          })}
        </div>

        <div className="col-md-6">
          {field(
            "confirmacion",
            "Confirmar contraseña",
            {
              type: "password",
              required: true,
              autoComplete: "new-password",
            }
          )}
        </div>
      </div>

      {/* TELÉFONO */}
      {field("telefono", "Teléfono de contacto", {
        type: "tel",
        required: true,
        autoComplete: "tel",
        hint:
          "Incluye el código de país para que podamos contactarte.",
      })}

      {/* REGIÓN Y COMUNA */}
      {data.tipoDocumento === "rut" && (
        <div className="row g-3">
          <div className="col-md-6">
            {field("region", "Región", {
              required: true,
              children: (
                <>
                  <option value="">
                    Selecciona una región
                  </option>

                  {regions.map((r) => (
                    <option key={r.region}>
                      {r.region}
                    </option>
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
                  <option value="">
                    Selecciona una comuna
                  </option>

                  {(
                    regions.find(
                      (r) => r.region === data.region
                    )?.comunas || []
                  ).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </>
              ),
            })}
          </div>
        </div>
      )}

      {/* DIRECCIÓN */}
      {field(
        "direccion",
        "Domicilio o alojamiento en Chile",
        {
          required: true,
          maxLength: 300,
          autoComplete: "street-address",
          hint:
            "Para visitantes, indica el alojamiento o dirección de contacto durante tu estadía.",
        }
      )}

      {/* ACEPTACIÓN */}
      <div className="form-check mb-3">
        <Input
          className="form-check-input"
          type="checkbox"
          id="acepta"
          name="acepta"
          checked={data.acepta}
          onChange={change}
          aria-invalid={Boolean(errors.acepta)}
          aria-describedby="acepta-error"
        />

        <Label
          className="form-check-label"
          htmlFor="acepta"
        >
          Acepto el uso de mis datos para gestionar
          mi cuenta y mis solicitudes.
        </Label>

        <Text
          as="small"
          id="acepta-error"
          className="invalid-feedback d-block"
        >
          {errors.acepta}
        </Text>
      </div>

      {/* MENSAJES */}
      <Text
        role="status"
        className={
          message
            ? `alert ${
                success
                  ? "alert-success"
                  : "alert-danger"
              }`
            : ""
        }
      >
        {message}
      </Text>

      {/* BOTÓN */}
      <Button
        type="submit"
        className="btn btn-warning w-100"
        disabled={busy}
      >
        {busy
          ? "Guardando…"
          : admin
            ? "Guardar usuario"
            : "Crear cuenta"}
      </Button>

      {/* INICIAR SESIÓN */}
      {success && !admin && (
        <AppLink
          className="btn btn-outline-dark w-100 mt-3"
          to="/login"
        >
          Iniciar sesión
        </AppLink>
      )}
    </form>
  );
}
