// Carruseles independientes para las tarjetas de rutas.
document.querySelectorAll("img[data-carrusel]").forEach((imagen) => {
    const contenedor = imagen.closest(".ruta-foto");

    if (!contenedor) return;

    const fotos = imagen.dataset.carrusel
        .split(",")
        .map((ruta) => ruta.trim())
        .filter(Boolean);

    if (fotos.length < 2) return;

    const nombreRuta = imagen.alt;
    const movimientoReducido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let indice = 0;
    let temporizador = null;
    let pausado = movimientoReducido.matches;
    let punteroEncima = false;

    contenedor.setAttribute("role", "region");
    contenedor.setAttribute(
        "aria-label",
        `Galería de ${nombreRuta}`
    );

    function crearBoton(clase, texto, etiqueta) {
        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = clase;
        boton.textContent = texto;
        boton.setAttribute("aria-label", etiqueta);

        return boton;
    }

    const anterior = crearBoton(
        "carrusel-flecha carrusel-anterior",
        "‹",
        `Imagen anterior de ${nombreRuta}`
    );

    const siguiente = crearBoton(
        "carrusel-flecha carrusel-siguiente",
        "›",
        `Imagen siguiente de ${nombreRuta}`
    );

    const contador = document.createElement("span");
    contador.className = "carrusel-contador";
    contador.setAttribute("aria-hidden", "true");

    const pausa = crearBoton(
        "carrusel-pausa",
        "",
        ""
    );

    contenedor.append(anterior, siguiente, contador, pausa);

    function mostrarImagen(nuevoIndice) {
        indice = (nuevoIndice + fotos.length) % fotos.length;

        imagen.src = fotos[indice];
        imagen.alt =
            `${nombreRuta}: imagen ${indice + 1} de ${fotos.length}`;

        contador.textContent = `${indice + 1} / ${fotos.length}`;
    }

    function actualizarBotonPausa() {
        pausa.textContent = pausado ? "Reanudar" : "Pausar";
        pausa.setAttribute(
            "aria-label",
            `${pausado ? "Reanudar" : "Pausar"} imágenes de ${nombreRuta}`
        );
    }

    function detener() {
        window.clearInterval(temporizador);
        temporizador = null;
    }

    function iniciar() {
        detener();

        // No cambia imágenes mientras alguien usa los controles,
        // pasa el cursor por la tarjeta o tiene otra pestaña abierta.
        if (
            pausado ||
            punteroEncima ||
            document.hidden ||
            contenedor.contains(document.activeElement)
        ) {
            return;
        }

        temporizador = window.setInterval(() => {
            mostrarImagen(indice + 1);
        }, 5000);
    }

    anterior.addEventListener("click", () => {
        mostrarImagen(indice - 1);
        iniciar();
    });

    siguiente.addEventListener("click", () => {
        mostrarImagen(indice + 1);
        iniciar();
    });

    pausa.addEventListener("click", () => {
        pausado = !pausado;
        actualizarBotonPausa();
        iniciar();
    });

    contenedor.addEventListener("mouseenter", () => {
        punteroEncima = true;
        detener();
    });

    contenedor.addEventListener("mouseleave", () => {
        punteroEncima = false;
        iniciar();
    });

    contenedor.addEventListener("focusin", detener);

    contenedor.addEventListener("focusout", () => {
        // Espera a que el foco termine de cambiar de elemento.
        window.setTimeout(iniciar, 0);
    });

    document.addEventListener("visibilitychange", iniciar);

    movimientoReducido.addEventListener("change", (evento) => {
        pausado = evento.matches;
        actualizarBotonPausa();
        iniciar();
    });

    mostrarImagen(0);
    actualizarBotonPausa();
    iniciar();
});