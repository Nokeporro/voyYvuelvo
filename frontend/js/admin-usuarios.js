/* GUÍA DE LECTURA: Valida y guarda los formularios de alta y edición de usuarios del panel. Los comentarios explican bloques y funciones; las instrucciones ejecutables conservan su comportamiento. */
/* ==========================================================
   admin-usuarios.js
   Formulario de usuario del administrador (nuevo y editar).
   Reglas: README punto 14 — Registro / mantenedor de usuario.
   Requiere admin.js (VV) y regiones-comunas.js (REGIONES_COMUNAS).
   ========================================================== */
(function () {
  "use strict";

  var form = document.getElementById("form-usuario");
  if (!form || !window.VV) { return; }

  var modo = document.body.dataset.modo;               // "nuevo" | "editar"
  var DOMINIOS = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
  var campos = ["run", "nombre", "apellidos", "correo", "correo2", "fechaNacimiento", "tipo", "region", "comuna", "direccion", "telefono", "password", "password2"];
  var f = {};
  campos.forEach(function (id) { f[id] = document.getElementById(id); });

  /* ---------- RUN ----------
     El README (CP-11) da por válido 19011022K, que NO cumple el dígito verificador
     (módulo 11). Por eso la verificación matemática queda desactivada por defecto.
     Cambiar a true si el docente pide validar el dígito verificador real. */
  var VALIDAR_DIGITO_VERIFICADOR = false;
  // Calcula el dígito verificador RUN con el algoritmo módulo 11; la opción que lo aplica se controla en VALIDAR_DIGITO_VERIFICADOR.
  function dvEsperado(cuerpo) {
    var suma = 0, factor = 2;
    for (var i = cuerpo.length - 1; i >= 0; i--) {
      suma += Number(cuerpo.charAt(i)) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }
    var dv = 11 - (suma % 11);
    return dv === 11 ? "0" : dv === 10 ? "K" : String(dv);
  }

  /* ---------- Reglas ---------- */
  var reglas = {
    run: function (v) {
      v = v.trim().toUpperCase();
      if (!v) { return "El RUN es obligatorio."; }
      if (/[.\-]/.test(v)) { return "Formato de RUN inválido: escríbelo sin puntos ni guion, por ejemplo 19011022K."; }
      if (v.length < 7 || v.length > 9) { return "El RUN está fuera de rango: debe tener entre 7 y 9 caracteres (tiene " + v.length + ")."; }
      if (!/^\d+[0-9K]$/.test(v)) { return "Formato de RUN inválido: solo números y una K final como dígito verificador."; }
      if (VALIDAR_DIGITO_VERIFICADOR && dvEsperado(v.slice(0, -1)) !== v.slice(-1)) { return "El RUN no es válido: el dígito verificador no coincide."; }
      if (modo === "nuevo" && VV.getUsuarios().some(function (u) { return u.run === v; })) { return "Ya existe un usuario con este RUN."; }
      return "";
    },
    nombre: function (v) {
      v = v.trim();
      if (!v) { return "El nombre es obligatorio."; }
      if (v.length > 50) { return "El nombre excede el máximo de 50 caracteres (tiene " + v.length + ")."; }
      return "";
    },
    apellidos: function (v) {
      v = v.trim();
      if (!v) { return "Los apellidos son obligatorios."; }
      if (v.length > 100) { return "Los apellidos exceden el máximo de 100 caracteres (tienen " + v.length + ")."; }
      return "";
    },
    correo: function (v) {
      v = v.trim().toLowerCase();
      if (!v) { return "El correo es obligatorio."; }
      if (v.length > 100) { return "El correo excede el máximo de 100 caracteres."; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { return "Escribe un correo válido, por ejemplo nombre@duoc.cl."; }
      var ok = DOMINIOS.some(function (d) { return v.slice(-d.length) === d; });
      if (!ok) { return "Dominio no válido: solo se aceptan @duoc.cl, @profesor.duoc.cl o @gmail.com."; }
      if (modo === "nuevo" && VV.getUsuarios().some(function (u) { return u.correo.toLowerCase() === v; })) { return "Ya existe un usuario con este correo."; }
      return "";
    },
    correo2: function (v) {
      if (!f.correo.value.trim() && !v.trim()) { return ""; }
      return v.trim().toLowerCase() === f.correo.value.trim().toLowerCase() ? "" : "Los correos no coinciden.";
    },
    fechaNacimiento: function (v) {                       // opcional
      if (!v) { return ""; }
      var d = new Date(v + "T00:00:00");
      if (isNaN(d.getTime())) { return "Ingresa una fecha válida."; }
      if (d > new Date()) { return "La fecha de nacimiento no puede ser futura."; }
      if (d.getFullYear() < 1900) { return "Ingresa una fecha posterior a 1900."; }
      return "";
    },
    tipo: function (v) { return v ? "" : "El tipo de usuario es obligatorio."; },
    region: function (v) { return v ? "" : "La región es obligatoria."; },
    comuna: function (v) {
      if (!f.region.value) { return "Primero selecciona una región."; }
      return v ? "" : "La comuna es obligatoria.";
    },
    direccion: function (v) {
      v = v.trim();
      if (!v) { return "La dirección es obligatoria."; }
      if (v.length > 300) { return "La dirección excede el máximo de 300 caracteres (tiene " + v.length + ")."; }
      return "";
    },
    telefono: function (v) {                              // opcional (mockup)
      v = v.trim();
      if (!v) { return ""; }
      if (!/^\+?\d{8,12}$/.test(v)) { return "El teléfono debe tener entre 8 y 12 dígitos, sin espacios."; }
      return "";
    },
    password: function (v) {
      if (!v) { return modo === "nuevo" ? "La contraseña es obligatoria." : ""; }
      if (v.length < 4 || v.length > 10) { return "La contraseña debe tener entre 4 y 10 caracteres (tiene " + v.length + ")."; }
      return "";
    },
    password2: function (v) {
      if (!f.password.value && !v) { return ""; }
      return v === f.password.value ? "" : "Las contraseñas no coinciden.";
    }
  };

  // Aplica la regla del campo indicado, comunica el error a lectores de pantalla y marca visualmente el campo si corresponde.
  function validar(id, tocar) {
    var msg = reglas[id](f[id].value);
    document.getElementById("error-" + id).textContent = msg;
    f[id].setAttribute("aria-invalid", msg ? "true" : "false");
    if (tocar) { f[id].classList.add("tocado"); }
    return !msg;
  }

  /* ---------- Región → comunas ---------- */
  // Llena el selector de regiones a partir del catálogo compartido de regiones y comunas.
  function cargarRegiones() {
    REGIONES_COMUNAS.forEach(function (r) {
      var o = document.createElement("option"); o.value = r.nombre; o.textContent = r.nombre; f.region.appendChild(o);
    });
  }
  // Muestra solo las comunas de la región elegida y opcionalmente restaura la comuna al editar.
  function cargarComunas(comunaSeleccionada) {
    f.comuna.textContent = "";
    var base = document.createElement("option");
    base.value = ""; base.textContent = "-- Selecciona la comuna --"; f.comuna.appendChild(base);
    var reg = REGIONES_COMUNAS.filter(function (r) { return r.nombre === f.region.value; })[0];
    f.comuna.disabled = !reg;
    if (!reg) { return; }
    reg.comunas.forEach(function (c) {
      var o = document.createElement("option"); o.value = c; o.textContent = c; f.comuna.appendChild(o);
    });
    if (comunaSeleccionada) { f.comuna.value = comunaSeleccionada; }
  }
  cargarRegiones(); cargarComunas();
  f.region.addEventListener("change", function () { cargarComunas(); f.comuna.classList.remove("tocado"); document.getElementById("error-comuna").textContent = ""; });

  /* ---------- Sugerencias dinámicas ---------- */
  var contDir = document.getElementById("contador-direccion");
  f.direccion.addEventListener("input", function () { contDir.textContent = f.direccion.value.length + " / 300 caracteres"; });

  campos.forEach(function (id) {
    var evento = (id === "tipo" || id === "region" || id === "comuna" || id === "fechaNacimiento") ? "change" : "input";
    f[id].addEventListener(evento, function () {
      if (f[id].classList.contains("tocado") || evento === "change") { validar(id, true); }
      if (id === "correo" && f.correo2.classList.contains("tocado")) { validar("correo2", true); }
      if (id === "password" && f.password2.classList.contains("tocado")) { validar("password2", true); }
    });
    f[id].addEventListener("blur", function () { validar(id, true); });
  });

  /* ---------- Modo editar ---------- */
  var alertaForm = document.getElementById("alerta-form");
  var original = null;
  if (modo === "editar") {
    var runUrl = new URLSearchParams(window.location.search).get("run");
    original = VV.getUsuarios().filter(function (u) { return u.run === runUrl; })[0];
    if (!original) {
      alertaForm.textContent = "No encontramos el usuario solicitado. Vuelve al listado y elígelo de nuevo.";
      alertaForm.className = "alerta alerta--error"; alertaForm.hidden = false; form.hidden = true; return;
    }
    ["run", "nombre", "apellidos", "correo", "correo2", "fechaNacimiento", "tipo", "direccion", "telefono"].forEach(function (id) { f[id].value = original[id] || ""; });
    f.run.readOnly = true; f.correo2.value = original.correo;
    f.region.value = original.region; cargarComunas(original.comuna);
    contDir.textContent = f.direccion.value.length + " / 300 caracteres";
  }

  /* ---------- Envío ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var primero = null;
    campos.forEach(function (id) { if (!validar(id, true) && !primero) { primero = f[id]; } });
    if (primero) {
      alertaForm.textContent = "Revisa los campos marcados en rojo antes de guardar.";
      alertaForm.className = "alerta alerta--error"; alertaForm.hidden = false; primero.focus(); return;
    }
    var usuario = {
      run: f.run.value.trim().toUpperCase(),
      nombre: f.nombre.value.trim(),
      apellidos: f.apellidos.value.trim(),
      correo: f.correo.value.trim().toLowerCase(),
      fechaNacimiento: f.fechaNacimiento.value,
      tipo: f.tipo.value,
      region: f.region.value,
      comuna: f.comuna.value,
      direccion: f.direccion.value.trim(),
      telefono: f.telefono.value.trim(),
      // Solo demostración académica: en un sistema real la contraseña nunca se guarda en el navegador.
      password: f.password.value || (original ? original.password : "")
    };
    var lista = VV.getUsuarios();
    if (modo === "editar") {
      lista = lista.map(function (u) { return u.run === original.run ? usuario : u; });
    } else {
      lista.push(usuario);
    }
    VV.saveUsuarios(lista);
    window.location.href = "usuarios-listado.html?ok=" + (modo === "editar" ? "editado" : "creado");
  });
})();
