/* ==========================================================
   validaciones-producto.js
   Formulario de producto del administrador (nuevo y editar).
   Reglas: README punto 14 — Producto (mantenedor administrador).
   Validación en tiempo real (input/blur) + al enviar.
   Requiere admin.js (objeto global VV).
   ========================================================== */
(function () {
  "use strict";

  var form = document.getElementById("form-producto");
  if (!form || !window.VV) { return; }

  var modo = document.body.dataset.modo;            // "nuevo" | "editar"
  var esVendedor = (VV.getSesion() || {}).rol === "Vendedor";
  var campos = ["codigo", "nombre", "descripcion", "precio", "stock", "stockCritico", "categoria", "imagen"];
  var f = {};
  campos.forEach(function (id) { f[id] = document.getElementById(id); });

  /* ---------- Helpers ---------- */
  function numero(texto) {
    // Acepta coma o punto decimal. Devuelve NaN si no es un número válido.
    var t = String(texto).trim().replace(",", ".");
    return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
  }
  function esEntero(texto) { return /^-?\d+$/.test(String(texto).trim()); }

  /* ---------- Reglas: cada función devuelve un mensaje o "" ---------- */
  var reglas = {
    codigo: function (v) {
      v = v.trim();
      if (!v) { return "El código es obligatorio."; }
      if (v.length < 3) { return "El código debe tener mínimo 3 caracteres (tiene " + v.length + ")."; }
      if (modo === "nuevo") {
        var existe = VV.getProductos().some(function (p) { return p.codigo.toLowerCase() === v.toLowerCase(); });
        if (existe) { return "Ya existe un producto con el código «" + v + "». Usa uno distinto."; }
      }
      return "";
    },
    nombre: function (v) {
      v = v.trim();
      if (!v) { return "El nombre es obligatorio."; }
      if (v.length > 100) { return "El nombre excede el máximo de 100 caracteres (tiene " + v.length + ")."; }
      return "";
    },
    descripcion: function (v) {
      if (v.length > 500) { return "La descripción excede el máximo de 500 caracteres (tiene " + v.length + ")."; }
      return "";
    },
    precio: function (v) {
      if (!v.trim()) { return "El precio es obligatorio (usa 0 si el producto es gratuito)."; }
      var n = numero(v);
      if (isNaN(n)) { return "El precio debe ser un número, por ejemplo 12990 o 12990.50."; }
      if (n < 0) { return "El precio no puede ser negativo. El mínimo es 0."; }
      return "";
    },
    stock: function (v) {
      if (!v.trim()) { return "El stock es obligatorio (usa 0 si no hay unidades)."; }
      if (!esEntero(v)) { return "El stock debe ser un número entero, sin decimales."; }
      if (Number(v) < 0) { return "El stock no puede ser negativo. El mínimo es 0."; }
      return "";
    },
    stockCritico: function (v) {
      if (!v.trim()) { return ""; }                    // opcional
      if (!esEntero(v)) { return "El stock crítico debe ser un número entero, sin decimales."; }
      if (Number(v) < 0) { return "El stock crítico no puede ser negativo. El mínimo es 0."; }
      return "";
    },
    categoria: function (v) {
      return v ? "" : "La categoría es obligatoria: elige Fácil, Media o Alta.";
    },
    imagen: function () {
      var archivo = f.imagen.files && f.imagen.files[0];
      if (!archivo) { return ""; }                     // opcional
      if (!/^image\/(png|jpe?g|webp|gif)$/.test(archivo.type)) { return "El archivo debe ser una imagen PNG, JPG, WEBP o GIF."; }
      if (archivo.size > 2 * 1024 * 1024) { return "La imagen pesa más de 2 MB. Elige una más liviana."; }
      return "";
    }
  };

  /* ---------- Mostrar / limpiar error ---------- */
  function validar(id, marcarTocado) {
    var campo = f[id];
    var msg = reglas[id](campo.value);
    var caja = document.getElementById("error-" + id);
    caja.textContent = msg;
    campo.setAttribute("aria-invalid", msg ? "true" : "false");
    if (marcarTocado) { campo.classList.add("tocado"); }
    return !msg;
  }

  /* ---------- Sugerencias dinámicas ---------- */
  var contDesc = document.getElementById("contador-descripcion");
  function actualizarContador() {
    var n = f.descripcion.value.length;
    contDesc.textContent = n + " / 500 caracteres";
  }
  var avisoStock = document.getElementById("aviso-stock");
  function actualizarAvisoStock() {
    avisoStock.textContent = "";
    if (f.stock.value.trim() === "" || f.stockCritico.value.trim() === "") { return; }
    if (!esEntero(f.stock.value) || !esEntero(f.stockCritico.value)) { return; }
    if (Number(f.stock.value) <= Number(f.stockCritico.value)) {
      avisoStock.textContent = "Alerta: el stock (" + f.stock.value + ") es igual o inferior al stock crítico (" + f.stockCritico.value + "). Conviene reponer.";
    }
  }

  campos.forEach(function (id) {
    var evento = (id === "categoria" || id === "imagen") ? "change" : "input";
    f[id].addEventListener(evento, function () {
      // el error solo aparece tras el primer intento en ese campo
      if (f[id].classList.contains("tocado") || evento === "change") { validar(id, true); }
      if (id === "descripcion") { actualizarContador(); }
      if (id === "stock" || id === "stockCritico") { actualizarAvisoStock(); }
    });
    f[id].addEventListener("blur", function () { validar(id, true); });
  });
  actualizarContador();

  /* ---------- Modo editar: cargar producto ---------- */
  var alertaForm = document.getElementById("alerta-form");
  var original = null;
  if (modo === "editar") {
    var codigoUrl = new URLSearchParams(window.location.search).get("codigo");
    original = VV.getProductos().filter(function (p) { return p.codigo === codigoUrl; })[0];
    if (!original) {
      alertaForm.textContent = "No encontramos el producto solicitado. Vuelve al listado y elígelo de nuevo.";
      alertaForm.className = "alerta alerta--error"; alertaForm.hidden = false;
      form.hidden = true; return;
    }
    f.codigo.value = original.codigo; f.codigo.readOnly = true;
    f.nombre.value = original.nombre;
    f.descripcion.value = original.descripcion || "";
    f.precio.value = original.precio;
    f.stock.value = original.stock;
    f.stockCritico.value = original.stockCritico === undefined ? "" : original.stockCritico;
    f.categoria.value = original.categoria;
    if (original.imagen) { document.getElementById("imagen-actual").textContent = "Imagen actual: " + original.imagen; }
    actualizarContador(); actualizarAvisoStock();
  }

  /* ---------- Vendedor: solo lectura ---------- */
  if (esVendedor) {
    var titulo = document.querySelector("h1"); if (titulo) { titulo.textContent = "Detalle del producto"; }
    campos.forEach(function (id) { f[id].disabled = true; });
    var guardar = document.getElementById("btn-guardar");
    if (guardar) { guardar.hidden = true; }
    return;
  }

  /* ---------- Envío ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var primeroInvalido = null;
    campos.forEach(function (id) {
      if (!validar(id, true) && !primeroInvalido) { primeroInvalido = f[id]; }
    });
    if (primeroInvalido) {
      alertaForm.textContent = "Revisa los campos marcados en rojo antes de guardar.";
      alertaForm.className = "alerta alerta--error"; alertaForm.hidden = false;
      primeroInvalido.focus();
      return;
    }

    var archivo = f.imagen.files && f.imagen.files[0];
    var producto = {
      codigo: f.codigo.value.trim(),
      nombre: f.nombre.value.trim(),
      descripcion: f.descripcion.value.trim(),
      precio: numero(f.precio.value),
      stock: Number(f.stock.value),
      stockCritico: f.stockCritico.value.trim() === "" ? "" : Number(f.stockCritico.value),
      categoria: f.categoria.value,
      imagen: archivo ? archivo.name : (original ? original.imagen : "")
    };

    var lista = VV.getProductos();
    if (modo === "editar") {
      lista = lista.map(function (p) { return p.codigo === original.codigo ? producto : p; });
    } else {
      lista.push(producto);
    }
    VV.saveProductos(lista);
    window.location.href = "productos-listado.html?ok=" + (modo === "editar" ? "editado" : "creado");
  });
})();
