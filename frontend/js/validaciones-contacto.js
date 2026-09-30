(() => {
  const form = document.querySelector("#contacto-form");
  if (!form) return;

  const name = form.elements.nombre;
  const email = form.elements.correo;
  const comment = form.elements.comentario;
  const feedback = document.querySelector("#contacto-feedback");
  const counter = document.querySelector("#comentario-count");
  const allowedDomains = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

  function setError(input, message) {
    document.getElementById(`${input.name}-error`).textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  }

  function validateName() {
    const value = name.value.trim();
    let error = "";
    if (!value) error = "El nombre es obligatorio.";
    else if (value.length > 100) error = "El nombre no puede superar los 100 caracteres.";
    return setError(name, error);
  }

  function validateEmail() {
    const value = email.value.trim();
    let error = "";
    if (!value) error = "El correo es obligatorio.";
    else if (value.length > 100) error = "El correo no puede superar los 100 caracteres.";
    else {
      const match = value.match(/^[^\s@]+@([^\s@]+)$/);
      if (!match) error = "Ingresa un correo con formato válido.";
      else if (!allowedDomains.includes(match[1].toLowerCase())) error = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }
    return setError(email, error);
  }

  function validateComment() {
    const value = comment.value.trim();
    let error = "";
    if (!value) error = "El comentario es obligatorio.";
    else if (comment.value.length > 500) error = "El comentario no puede superar los 500 caracteres.";
    counter.textContent = `${comment.value.length} / 500`;
    counter.classList.toggle("field-error", comment.value.length > 500);
    return setError(comment, error);
  }

  name.addEventListener("input", validateName);
  name.addEventListener("blur", validateName);
  email.addEventListener("input", validateEmail);
  email.addEventListener("blur", validateEmail);
  comment.addEventListener("input", validateComment);
  comment.addEventListener("blur", validateComment);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.className = "form-feedback";
    const valid = validateName() & validateEmail() & validateComment();
    if (!valid) {
      feedback.textContent = "Revisa los campos marcados antes de enviar tu mensaje.";
      feedback.classList.add("is-error");
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    feedback.textContent = "¡Gracias! El mensaje fue validado. El envío real requiere conectar un servicio de contacto.";
    feedback.classList.add("is-success");
    form.reset();
    counter.textContent = "0 / 500";
    [name, email, comment].forEach((input) => {
      input.removeAttribute("aria-invalid");
      document.getElementById(`${input.name}-error`).textContent = "";
    });
  });
})();
