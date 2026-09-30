/* menu.js — abre y cierra el menú en pantallas pequeñas (si ya existe uno equivalente, se puede omitir) */
(function () {
  "use strict";
  var btn = document.querySelector(".nav__toggle");
  var menu = document.getElementById("menu");
  if (!btn || !menu) { return; }
  btn.addEventListener("click", function () {
    var abierto = menu.classList.toggle("abierto");
    btn.setAttribute("aria-expanded", String(abierto));
  });
})();
