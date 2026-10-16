/* GUÍA DE LECTURA: Controla el acceso al panel, sus datos de demostración y las vistas de resumen. Los comentarios explican bloques y funciones; las instrucciones ejecutables conservan su comportamiento. */
/* ==========================================================
   admin.js — lógica compartida del panel administrador
   - Protege las vistas según la sesión y el rol
   - Guarda productos y usuarios en localStorage (sin backend)
   - Pinta el dashboard y los listados

   CONTRATO CON LOGIN (Integrante 2): al iniciar sesión guardar
   localStorage.setItem("sesion", JSON.stringify({
     correo: "admin@duoc.cl", nombre: "Ana", rol: "Administrador" // o "Vendedor" / "Cliente"
   }));
   ========================================================== */
(function () {
  "use strict";

  var KEY_SESION = "sesion";
  var KEY_PROD = "vv_admin_productos";
  var KEY_USR = "vv_admin_usuarios";

  /* ---------- Datos iniciales (se cargan una sola vez) ---------- */
  var PRODUCTOS_INICIALES = [
    { codigo: "MOC-001", nombre: "Mochila de trekking 50L", descripcion: "Mochila con respaldo ventilado y funda de lluvia.", precio: 89990, stock: 14, stockCritico: 5, categoria: "Media", imagen: "" },
    { codigo: "ZAP-002", nombre: "Zapatillas de trekking", descripcion: "Suela de agarre para terreno mixto.", precio: 74990, stock: 4, stockCritico: 6, categoria: "Media", imagen: "" },
    { codigo: "CAP-003", nombre: "Capa impermeable", descripcion: "Liviana y plegable, con capucha ajustable.", precio: 39990, stock: 22, stockCritico: 8, categoria: "Fácil", imagen: "" },
    { codigo: "BAS-004", nombre: "Bastones de trekking (par)", descripcion: "Aluminio telescópico con correas acolchadas.", precio: 32990, stock: 9, stockCritico: 4, categoria: "Media", imagen: "" },
    { codigo: "LIN-005", nombre: "Linterna frontal recargable", descripcion: "300 lúmenes, tres modos de luz.", precio: 18990, stock: 30, stockCritico: 10, categoria: "Fácil", imagen: "" },
    { codigo: "CAR-006", nombre: "Carpa 3 estaciones", descripcion: "Para 2 personas, resiste viento fuerte.", precio: 189990, stock: 3, stockCritico: 3, categoria: "Alta", imagen: "" },
    { codigo: "SAC-007", nombre: "Saco de dormir -10 °C", descripcion: "Relleno sintético, apto para alta montaña.", precio: 129990, stock: 7, stockCritico: 3, categoria: "Alta", imagen: "" },
    { codigo: "PRO-008", nombre: "Protector solar FPS 50", descripcion: "Resistente al agua y al sudor.", precio: 9990, stock: 40, stockCritico: 12, categoria: "Fácil", imagen: "" }
  ];
  var USUARIOS_INICIALES = [
    { run: "11222333K", nombre: "Ana", apellidos: "Rojas Pérez", correo: "admin@duoc.cl", fechaNacimiento: "", tipo: "Administrador", region: "Región Metropolitana de Santiago", comuna: "Santiago", direccion: "Av. Providencia 1234", telefono: "", password: "1234" },
    { run: "12345678K", nombre: "Luis", apellidos: "Soto Díaz", correo: "vendedor@duoc.cl", fechaNacimiento: "", tipo: "Vendedor", region: "Región de Ñuble", comuna: "Chillán", direccion: "Calle Libertad 45", telefono: "", password: "1234" },
    { run: "18765432K", nombre: "Marta", apellidos: "Vega Lara", correo: "marta@gmail.com", fechaNacimiento: "1998-05-14", tipo: "Cliente", region: "Región del Biobío", comuna: "Concepción", direccion: "Pasaje Los Robles 8", telefono: "", password: "1234" }
  ];

  /* ---------- Almacenamiento ---------- */
  // Lee una lista guardada en el navegador; si aún no existe o el JSON está dañado, crea una copia inicial para que el panel pueda arrancar.
  function leer(key, inicial) {
    try {
      var crudo = localStorage.getItem(key);
      if (crudo) { return JSON.parse(crudo); }
    } catch (e) { /* datos dañados: se reinician */ }
    localStorage.setItem(key, JSON.stringify(inicial));
    return inicial.slice();
  }
  // Convierte una lista JavaScript a JSON y la guarda en localStorage para conservar los cambios entre visitas.
  function guardar(key, lista) { localStorage.setItem(key, JSON.stringify(lista)); }

  var VV = {
    getSesion: function () {
      try { return JSON.parse(localStorage.getItem(KEY_SESION)); } catch (e) { return null; }
    },
    getProductos: function () { return leer(KEY_PROD, PRODUCTOS_INICIALES); },
    saveProductos: function (l) { guardar(KEY_PROD, l); },
    getUsuarios: function () { return leer(KEY_USR, USUARIOS_INICIALES); },
    saveUsuarios: function (l) { guardar(KEY_USR, l); },
    formatoPrecio: function (n) {
      return "$" + Number(n).toLocaleString("es-CL", { maximumFractionDigits: 2 });
    },
    claseCategoria: function (c) {
      return { "Fácil": "insignia--facil", "Media": "insignia--media", "Alta": "insignia--alta" }[c] || "";
    },
    stockCritico: function (p) {
      return p.stockCritico !== "" && p.stockCritico !== null && p.stockCritico !== undefined && Number(p.stock) <= Number(p.stockCritico);
    }
  };
  window.VV = VV;

  /* ---------- Utilidad DOM segura (textContent, sin innerHTML) ---------- */
  // Crea un elemento HTML de forma segura y opcionalmente asigna clase y texto sin interpretar ese texto como etiquetas.
  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) { n.className = clase; }
    if (texto !== undefined) { n.textContent = texto; }
    return n;
  }

  /* ---------- Guardia de acceso por rol ---------- */
  var sesion = VV.getSesion();
  var rol = sesion && sesion.rol;
  var body = document.body;

  if (rol !== "Administrador" && rol !== "Vendedor") {
    window.location.replace("../login.html");
    return;
  }
  if (rol === "Vendedor" && body.dataset.soloAdmin === "true") {
    window.location.replace("productos-listado.html");
    return;
  }
  document.documentElement.dataset.rol = rol;

  document.addEventListener("DOMContentLoaded", function () {
    // Nombre y rol en el menú
    document.querySelectorAll("[data-sesion-nombre]").forEach(function (n) { n.textContent = sesion.nombre || sesion.correo; });
    document.querySelectorAll("[data-sesion-rol]").forEach(function (n) { n.textContent = rol; });

    // El vendedor no ve nada marcado como solo-admin
    if (rol === "Vendedor") {
      document.querySelectorAll("[data-solo-admin]").forEach(function (n) { n.hidden = true; });
    }

    // Menú lateral en móvil
    var btn = document.getElementById("btn-menu");
    var side = document.getElementById("sidebar");
    if (btn && side) {
      btn.addEventListener("click", function () {
        var abierto = side.classList.toggle("abierto");
        btn.setAttribute("aria-expanded", String(abierto));
      });
    }

    // Cerrar sesión
    var salir = document.getElementById("btn-salir");
    if (salir) {
      salir.addEventListener("click", function () {
        localStorage.removeItem(KEY_SESION);
        window.location.href = "../index.html";
      });
    }

    var pagina = body.dataset.pagina;
    if (pagina === "dashboard") { pintarDashboard(); }
    if (pagina === "productos-listado") { pintarProductos(); }
    if (pagina === "usuarios-listado") { pintarUsuarios(); }
  });

  /* ---------- Dashboard ---------- */
  // Calcula y muestra los totales de productos, usuarios y productos con stock crítico.
  function pintarDashboard() {
    var prods = VV.getProductos();
    var usrs = VV.getUsuarios();
    var criticos = prods.filter(VV.stockCritico).length;
    var datos = { "n-productos": prods.length, "n-usuarios": usrs.length, "n-criticos": criticos };
    Object.keys(datos).forEach(function (id) {
      var n = document.getElementById(id);
      if (n) { n.textContent = datos[id]; }
    });
  }

  /* ---------- Listado de productos ---------- */
  // Construye la tabla de productos, aplica la búsqueda y agrega acciones disponibles para el rol actual.
  function pintarProductos() {
    var tbody = document.getElementById("tbody");
    var buscador = document.getElementById("buscador");
    var aviso = document.getElementById("aviso");
    var esAdmin = rol === "Administrador";
    var params = new URLSearchParams(window.location.search);
    if (params.get("ok") && aviso) {
      aviso.textContent = params.get("ok") === "creado" ? "Producto creado correctamente." : "Cambios guardados correctamente.";
      aviso.hidden = false;
    }

    // Vuelve a dibujar las filas según el texto de búsqueda actual.
// Reconstruye la tabla administrativa usando los datos filtrados por el texto de búsqueda.
  function dibujar() {
      var q = (buscador.value || "").trim().toLowerCase();
      var lista = VV.getProductos().filter(function (p) {
        return !q || (p.codigo + " " + p.nombre + " " + p.categoria).toLowerCase().indexOf(q) !== -1;
      });
      tbody.textContent = "";
      if (!lista.length) {
        var fila = el("tr"); var td = el("td", "vacio", "No hay productos que coincidan con la búsqueda.");
        td.colSpan = 6; fila.appendChild(td); tbody.appendChild(fila); return;
      }
      lista.forEach(function (p) {
        var tr = el("tr");
        tr.appendChild(el("td", "", p.codigo));
        tr.appendChild(el("td", "", p.nombre));
        var tdCat = el("td"); tdCat.appendChild(el("span", "insignia " + VV.claseCategoria(p.categoria), p.categoria)); tr.appendChild(tdCat);
        tr.appendChild(el("td", "", VV.formatoPrecio(p.precio)));
        var tdStock = el("td", "", String(p.stock) + " ");
        if (VV.stockCritico(p)) { tdStock.appendChild(el("span", "insignia insignia--alerta", "Stock crítico")); }
        tr.appendChild(tdStock);
        var tdAcc = el("td", "acciones");
        var ver = el("a", "btn btn--borde btn--sm", esAdmin ? "Editar" : "Ver detalle");
        ver.href = "producto-editar.html?codigo=" + encodeURIComponent(p.codigo);
        ver.setAttribute("aria-label", (esAdmin ? "Editar " : "Ver detalle de ") + p.nombre);
        tdAcc.appendChild(ver);
        if (esAdmin) {
          var del = el("button", "btn btn--peligro btn--sm", "Eliminar");
          del.type = "button";
          del.setAttribute("aria-label", "Eliminar " + p.nombre);
          del.addEventListener("click", function () {
            if (window.confirm("¿Eliminar el producto «" + p.nombre + "»? Esta acción no se puede deshacer.")) {
              VV.saveProductos(VV.getProductos().filter(function (x) { return x.codigo !== p.codigo; }));
              dibujar();
            }
          });
          tdAcc.appendChild(del);
        }
        tr.appendChild(tdAcc);
        tbody.appendChild(tr);
      });
    }
    buscador.addEventListener("input", dibujar);
    dibujar();
  }

  /* ---------- Listado de usuarios ---------- */
  // Construye la tabla de usuarios y sus acciones para el administrador.
  function pintarUsuarios() {
    var tbody = document.getElementById("tbody");
    var buscador = document.getElementById("buscador");
    var aviso = document.getElementById("aviso");
    var params = new URLSearchParams(window.location.search);
    if (params.get("ok") && aviso) {
      aviso.textContent = params.get("ok") === "creado" ? "Usuario creado correctamente." : "Cambios guardados correctamente.";
      aviso.hidden = false;
    }
    function dibujar() {
      var q = (buscador.value || "").trim().toLowerCase();
      var lista = VV.getUsuarios().filter(function (u) {
        return !q || (u.run + " " + u.nombre + " " + u.apellidos + " " + u.correo + " " + u.tipo).toLowerCase().indexOf(q) !== -1;
      });
      tbody.textContent = "";
      if (!lista.length) {
        var fila = el("tr"); var td = el("td", "vacio", "No hay usuarios que coincidan con la búsqueda.");
        td.colSpan = 6; fila.appendChild(td); tbody.appendChild(fila); return;
      }
      lista.forEach(function (u) {
        var tr = el("tr");
        tr.appendChild(el("td", "", u.run));
        tr.appendChild(el("td", "", u.nombre + " " + u.apellidos));
        tr.appendChild(el("td", "", u.correo));
        var tdTipo = el("td"); tdTipo.appendChild(el("span", "insignia", u.tipo)); tr.appendChild(tdTipo);
        tr.appendChild(el("td", "", u.comuna + ", " + u.region));
        var tdAcc = el("td", "acciones");
        var ed = el("a", "btn btn--borde btn--sm", "Editar");
        ed.href = "usuario-editar.html?run=" + encodeURIComponent(u.run);
        ed.setAttribute("aria-label", "Editar a " + u.nombre + " " + u.apellidos);
        tdAcc.appendChild(ed);
        var del = el("button", "btn btn--peligro btn--sm", "Eliminar");
        del.type = "button";
        del.setAttribute("aria-label", "Eliminar a " + u.nombre + " " + u.apellidos);
        del.addEventListener("click", function () {
          if (u.correo === sesion.correo) { window.alert("No puedes eliminar tu propia cuenta mientras tienes la sesión iniciada."); return; }
          if (window.confirm("¿Eliminar al usuario " + u.nombre + " " + u.apellidos + "?")) {
            VV.saveUsuarios(VV.getUsuarios().filter(function (x) { return x.run !== u.run; }));
            dibujar();
          }
        });
        tdAcc.appendChild(del);
        tr.appendChild(tdAcc);
        tbody.appendChild(tr);
      });
    }
    buscador.addEventListener("input", dibujar);
    dibujar();
  }
})();
