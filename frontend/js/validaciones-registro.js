/* GUÍA DE LECTURA: Valida los campos de registro; comprueba el RUN y las opciones de región/comuna. Los comentarios explican bloques y funciones; las instrucciones ejecutables conservan su comportamiento. */
(() => {
  const form = document.querySelector("#registro-form");
  if (!form) return;

  const fields = {
    run: form.elements.run,
    nombre: form.elements.nombre,
    apellidos: form.elements.apellidos,
    correo: form.elements.correo,
    contrasena: form.elements.contrasena,
    region: form.elements.region,
    comuna: form.elements.comuna,
    direccion: form.elements.direccion
  };
  const feedback = document.querySelector("#registro-feedback");
  const allowedDomains = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];
  const maxLengths = { nombre: 50, apellidos: 100, correo: 100, direccion: 300 };

// Guarda referencias a los selectores para poblar comunas según la región escogida.
  const regionSelect = fields.region;
  const communeSelect = fields.comuna;
  (window.REGIONES_COMUNAS || []).forEach(({ region }) => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    regionSelect.append(option);
  });

// Cuando cambia la región, reemplaza las opciones de comuna por las correspondientes.
  regionSelect.addEventListener("change", () => {
    communeSelect.replaceChildren(new Option("Selecciona una comuna", ""));
    const selected = window.REGIONES_COMUNAS?.find(({ region }) => region === regionSelect.value);
    (selected?.comunas || []).forEach((comuna) => communeSelect.add(new Option(comuna, comuna)));
    communeSelect.disabled = !selected;
    validate("region");
    validate("comuna");
  });

  // Verifica el formato y el dígito verificador chileno del RUN mediante módulo 11.
  function isValidRun(value) {
    const run = value.trim().toUpperCase();
    if (!/^\d{6,8}[0-9K]$/.test(run)) return false;
    const body = run.slice(0, -1);
    let factor = 2;
    let sum = 0;
    for (let index = body.length - 1; index >= 0; index -= 1) {
      sum += Number(body[index]) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }
    const remainder = 11 - (sum % 11);
    const expected = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
    return run.endsWith(expected);
  }

  // Devuelve un mensaje vacío si el correo cumple las reglas o una explicación del problema.
  function emailMessage(value) {
    if (!value) return "El correo es obligatorio.";
    if (value.length > 100) return "El correo no puede superar los 100 caracteres.";
    const match = value.match(/^[^\s@]+@([^\s@]+)$/);
    if (!match) return "Ingresa un correo con formato válido.";
    if (!allowedDomains.includes(match[1].toLowerCase())) return "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    return "";
  }

  // Valida el campo solicitado y actualiza el mensaje y el estado accesible de ese campo.
  function validate(name) {
    const input = fields[name];
    const value = input.value.trim();
    let message = "";
    if (name === "run") {
      if (!value) message = "El RUN es obligatorio.";
      else if (/[.\-\s]/.test(value)) message = "Escribe el RUN sin puntos ni guion.";
      else if (!/^\d{6,8}[0-9kK]$/.test(value)) message = "El RUN debe tener entre 7 y 9 caracteres: números y dígito verificador.";
      else if (!isValidRun(value)) message = "El dígito verificador del RUN no es válido.";
    } else if (name === "correo") {
      message = emailMessage(value);
    } else if (name === "contrasena") {
      if (!value) message = "La contraseña es obligatoria.";
      else if (value.length < 4 || value.length > 10) message = "Usa entre 4 y 10 caracteres.";
    } else if (name === "region") {
      if (!value) message = "Selecciona una región.";
    } else if (name === "comuna") {
      if (!value) message = "Selecciona una comuna.";
    } else if (!value) {
      message = name === "apellidos" ? "Los apellidos son obligatorios." : name === "nombre" ? "El nombre es obligatorio." : "La dirección es obligatoria.";
    } else if (value.length > maxLengths[name]) {
      message = `No puede superar los ${maxLengths[name]} caracteres.`;
    }

    const error = document.getElementById(`${name}-error`);
    error.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  }

  Object.entries(fields).forEach(([name, input]) => {
    input.addEventListener("input", () => validate(name));
    input.addEventListener("change", () => validate(name));
    input.addEventListener("blur", () => validate(name));
  });

  form.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword);
      const visible = input.type === "password";
      input.type = visible ? "text" : "password";
      button.textContent = visible ? "Ocultar" : "Mostrar";
      button.setAttribute("aria-label", visible ? "Ocultar contraseña" : "Mostrar contraseña");
    });
  });

// Detiene el envío normal, valida todos los campos y muestra el resultado de la validación.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.className = "form-feedback";
    const validity = Object.keys(fields).map(validate);
    if (validity.some((valid) => !valid)) {
      feedback.textContent = "Revisa los campos marcados para completar el registro.";
      feedback.classList.add("is-error");
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    feedback.textContent = "¡Datos validados! El formulario está listo para conectarse al registro de usuarios.";
    feedback.classList.add("is-success");
    form.querySelector('button[type="submit"]').focus();
  });
})();
