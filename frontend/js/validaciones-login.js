(() => {
  const form = document.querySelector("#login-form");
  if (!form) return;

  const email = form.elements.correo;
  const password = form.elements.contrasena;
  const feedback = document.querySelector("#login-feedback");
  const allowedDomains = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

  function validateEmail() {
    const value = email.value.trim();
    let message = "";
    if (!value) message = "El correo es obligatorio.";
    else if (value.length > 100) message = "El correo no puede superar los 100 caracteres.";
    else {
      const match = value.match(/^[^\s@]+@([^\s@]+)$/);
      if (!match) message = "Ingresa un correo con formato válido.";
      else if (!allowedDomains.includes(match[1].toLowerCase())) message = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }
    return showField(email, "correo-error", message);
  }

  function validatePassword() {
    const value = password.value;
    let message = "";
    if (!value) message = "La contraseña es obligatoria.";
    else if (value.length < 4 || value.length > 10) message = "La contraseña debe tener entre 4 y 10 caracteres.";
    return showField(password, "contrasena-error", message);
  }

  function showField(input, errorId, message) {
    const error = document.getElementById(errorId);
    error.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  }

  function showPasswordToggle() {
    form.querySelectorAll("[data-toggle-password]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.togglePassword);
        const visible = input.type === "password";
        input.type = visible ? "text" : "password";
        button.textContent = visible ? "Ocultar" : "Mostrar";
        button.setAttribute("aria-label", visible ? "Ocultar contraseña" : "Mostrar contraseña");
      });
    });
  }

  email.addEventListener("input", validateEmail);
  email.addEventListener("blur", validateEmail);
  password.addEventListener("input", validatePassword);
  password.addEventListener("blur", validatePassword);
  showPasswordToggle();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.className = "form-feedback";
    const valid = validateEmail() & validatePassword();
    if (!valid) {
      feedback.textContent = "Revisa los campos marcados antes de continuar.";
      feedback.classList.add("is-error");
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    feedback.textContent = "Formato correcto. La autenticación requiere conectar este formulario a un servicio de usuarios.";
    feedback.classList.add("is-success");
  });
})();
