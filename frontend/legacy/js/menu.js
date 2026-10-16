/* GUÍA DE LECTURA: Controla la apertura y cierre del menú de navegación en pantallas pequeñas. Los comentarios explican bloques y funciones; las instrucciones ejecutables conservan su comportamiento. */
/* menu.js — abre y cierra el menú en pantallas pequeñas (si ya existe uno equivalente, se puede omitir) */
(function () {
  "use strict";
// Busca el botón y el contenedor que forman el menú adaptable.
  var btn = document.querySelector(".nav__toggle");
  var menu = document.getElementById("menu");
// Si esta página no tiene ese menú, se detiene sin provocar errores.
  if (!btn || !menu) { return; }
// Alterna la clase visual de apertura y mantiene aria-expanded al día.
  btn.addEventListener("click", function () {
    var abierto = menu.classList.toggle("abierto");
    btn.setAttribute("aria-expanded", String(abierto));
  });
})();
