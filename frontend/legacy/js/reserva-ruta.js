/* GUÍA DE LECTURA: Muestra una ruta, calcula una reserva y se comunica con el backend cuando está disponible. Los comentarios explican bloques y funciones; las instrucciones ejecutables conservan su comportamiento. */
(() => {
  'use strict';
  const API = 'http://localhost:8080';
  const dinero = n => new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 }).format(Number(n || 0));
  const idRuta = Number(new URLSearchParams(location.search).get('ruta')) || 1;

  const fallbackRutas = {
    1: { id:1, nombre:'Circuito Base Torres', ubicacion:'Torres del Paine · Magallanes', dificultad:'Alta', precio:210000, cupoMaximo:12, aptoNinos:false, aptoMascotas:false, duracion:'4 días', imagen:'img/portada1.jpg', descripcion:'Una experiencia de varios días entre montañas, miradores y uno de los paisajes más reconocidos de la Patagonia.' },
    2: { id:2, nombre:'Laguna del Inca', ubicacion:'Cajón del Maipo · Metropolitana', dificultad:'Fácil', precio:35000, cupoMaximo:24, aptoNinos:true, aptoMascotas:true, duracion:'1 día', imagen:'img/portada2.jpg', descripcion:'Una alternativa de un día para disfrutar del paisaje cordillerano y una caminata de dificultad accesible.' },
    3: { id:3, nombre:'Sendero Los Lirios', ubicacion:'Parque Conguillío · Araucanía', dificultad:'Media', precio:78000, cupoMaximo:18, aptoNinos:true, aptoMascotas:false, duracion:'2 días', imagen:'img/sendero-lirios-2.png', descripcion:'Recorre bosque nativo y naturaleza volcánica en una salida para quienes ya tienen algo de experiencia.' }
  };

  const fallbackEquipos = {
    'Fácil': [
      { id:1, nombre:'Mochila Trekking', descripcion:'Mochila para agua, abrigo y accesorios.', valorArriendo:7000, disponible:true },
      { id:2, nombre:'Linterna Frontal', descripcion:'Iluminación recargable para el regreso.', valorArriendo:4000, disponible:true }
    ],
    'Media': [
      { id:3, nombre:'Carpa de Montaña', descripcion:'Carpa resistente para rutas de más de un día.', valorArriendo:18000, disponible:true },
      { id:4, nombre:'Chaqueta Outdoor', descripcion:'Capa para viento y cambios de clima.', valorArriendo:10000, disponible:true },
      { id:5, nombre:'Saco de Dormir', descripcion:'Saco térmico para campamento.', valorArriendo:9000, disponible:true }
    ],
    'Alta': [
      { id:6, nombre:'Bastones de Trekking', descripcion:'Apoyo para pendientes y terreno exigente.', valorArriendo:6000, disponible:true },
      { id:7, nombre:'Botas de Trekking', descripcion:'Calzado para senderos de montaña.', valorArriendo:12000, disponible:true }
    ]
  };

  const imagenesEquipamiento = {
    'mochila trekking':'img/mochila.png',
    'linterna frontal':'img/linterna.png',
    'carpa de montaña':'img/carpa.png',
    'chaqueta outdoor':'img/chaqueta.png',
    'saco de dormir':'img/saco-dormir.png',
    'bastones de trekking':'img/bastones.png',
    'botas de trekking':'img/botas.png'
  };

  let ruta = fallbackRutas[idRuta] || fallbackRutas[1];
  let equipos = [];
  const $ = id => document.getElementById(id);

  // Admite respuestas API que vienen como arreglo directo o dentro del formato _embedded de Spring.
  function embeddedList(data) {
    if (Array.isArray(data)) return data;
    if (!data || !data._embedded) return [];
    const first = Object.values(data._embedded).find(Array.isArray);
    return first || [];
  }

  // Envía una petición HTTP, interpreta la respuesta y convierte respuestas de error en errores legibles.
  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const raw = await response.text();
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
    if (!response.ok) {
      const msg = typeof data === 'string' ? data : (data?.message || data?.error || `Error ${response.status}`);
      throw new Error(msg);
    }
    return data;
  }

  // Coloca en la página los datos de la ruta seleccionada y prepara el límite de personas.
  function pintarRuta() {
    $('titulo-ruta').textContent = ruta.nombre;
    $('ruta-ubicacion').textContent = ruta.ubicacion;
    $('ruta-descripcion').textContent = ruta.descripcion || 'Reserva esta ruta y agrega el equipamiento que necesites.';
    $('ruta-duracion').textContent = '◷ ' + (ruta.duracion || 'Según programa');
    $('ruta-dificultad').textContent = '▲ ' + ruta.dificultad;
    $('ruta-cupos').textContent = `${ruta.cupoMaximo ?? '—'} cupos disponibles`;
    $('ruta-apto').textContent = ruta.aptoNinos ? (ruta.aptoMascotas ? 'Niños y mascotas' : 'Apta para niños') : 'Experiencia recomendada';
    $('ruta-imagen').src = ruta.imagen || fallbackRutas[idRuta]?.imagen || 'img/montana-sendero.png';
    $('personas').max = ruta.cupoMaximo || 99;
    document.title = `Reservar ${ruta.nombre} | Voy & Vuelvo`;
    actualizarResumen();
  }


  // Elige la imagen del equipamiento desde la API o desde el mapa local de imágenes.
  function obtenerImagenEquipo(equipo) {
    const nombre = String(equipo?.nombre || '').trim().toLowerCase();
    return equipo?.imagen || imagenesEquipamiento[nombre] || 'img/mochila.png';
  }

  // Dibuja las opciones de arriendo de equipamiento y actualiza el resumen al seleccionarlas.
  function pintarEquipos() {
    const cont = $('equipamiento-opciones');
    cont.replaceChildren();
    if (!equipos.length) {
      const p = document.createElement('p'); p.textContent = 'No hay equipamiento recomendado disponible para esta ruta.'; cont.append(p); return;
    }
    equipos.filter(e => e.disponible !== false).forEach(e => {
      const label = document.createElement('label');
      label.className = 'equipamiento-opcion';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = e.id;
      input.dataset.precio = e.valorArriendo;
      input.dataset.nombre = e.nombre;
      input.className = 'equipamiento-selector';

      const contenido = document.createElement('span');
      contenido.className = 'equipamiento-opcion__contenido';

      const media = document.createElement('span');
      media.className = 'equipamiento-opcion__media';
      const img = document.createElement('img');
      img.src = obtenerImagenEquipo(e);
      img.alt = e.nombre;
      img.loading = 'lazy';
      media.append(img);

      const texto = document.createElement('span');
      texto.className = 'equipamiento-opcion__texto';
      const strong = document.createElement('strong');
      strong.textContent = e.nombre;
      const small = document.createElement('small');
      small.textContent = e.descripcion || 'Equipamiento recomendado para esta dificultad.';
      texto.append(strong, small);

      contenido.append(media, texto);

      const footer = document.createElement('span');
      footer.className = 'equipamiento-opcion__footer';
      const precio = document.createElement('span');
      precio.className = 'equipamiento-precio';
      precio.textContent = dinero(e.valorArriendo) + ' / arriendo';
      const accion = document.createElement('span');
      accion.className = 'equipamiento-accion';
      accion.textContent = 'Agregar';
      footer.append(precio, accion);

      label.append(input, contenido, footer);
      cont.append(label);

      const sincronizarEstado = () => {
        label.classList.toggle('seleccionado', input.checked);
        accion.textContent = input.checked ? 'Agregado' : 'Agregar';
      };
      input.addEventListener('change', () => {
        sincronizarEstado();
        actualizarResumen();
      });
      sincronizarEstado();
    });
  }

  // Devuelve los equipos marcados en formato listo para calcular el precio y enviar al backend.
  function seleccionados() {
    return [...document.querySelectorAll('#equipamiento-opciones input:checked')].map(input => ({ equipamientoId:Number(input.value), cantidad:1, precio:Number(input.dataset.precio || 0), nombre:input.dataset.nombre }));
  }

  // Calcula el costo de la ruta por persona más el arriendo del equipamiento elegido.
  function actualizarResumen() {
    const personas = Math.max(1, Number($('personas').value || 1));
    const totalRuta = Number(ruta.precio || 0) * personas;
    const totalEquipo = seleccionados().reduce((s, e) => s + e.precio, 0);
    $('resumen-ruta').textContent = dinero(totalRuta);
    $('resumen-equipo').textContent = dinero(totalEquipo);
    $('resumen-total').textContent = dinero(totalRuta + totalEquipo);
  }

  // Intenta cargar ruta y equipo recomendado desde el Gateway; si falla, utiliza información de respaldo.
  async function cargarDesdeApi() {
    try {
      const data = await fetchJson(`${API}/api/rutas/${idRuta}`);
      ruta = { ...ruta, ...data, duracion:ruta.duracion, imagen:ruta.imagen, descripcion:ruta.descripcion };
    } catch (_) { /* fallback visual */ }
    pintarRuta();

    try {
      const data = await fetchJson(`${API}/api/equipamiento/recomendacion/${idRuta}`);
      const lista = embeddedList(data);
      equipos = lista.length ? lista : (fallbackEquipos[ruta.dificultad] || []);
    } catch (_) {
      equipos = fallbackEquipos[ruta.dificultad] || fallbackEquipos[fallbackRutas[idRuta]?.dificultad] || [];
    }
    pintarEquipos();
    actualizarResumen();
  }

  // Busca el correo en el servicio de usuarios y crea un registro básico si aún no existe.
  async function obtenerOCrearUsuario() {
    const email = $('email').value.trim().toLowerCase();
    const usuariosData = await fetchJson(`${API}/api/usuarios`);
    const usuarios = embeddedList(usuariosData);
    const existente = usuarios.find(u => String(u.email || '').toLowerCase() === email);
    if (existente) return existente;
    return fetchJson(`${API}/api/usuarios`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ nombre:$('nombre').value.trim(), email, telefono:$('telefono').value.trim() })
    });
  }

  // Comprueba contacto, fecha futura y cantidad de personas antes de enviar una reserva.
  function validar() {
    const fecha = $('fecha').value;
    const personas = Number($('personas').value);
    if (!$('nombre').value.trim() || !$('email').validity.valid || !$('telefono').value.trim() || !fecha) return 'Completa correctamente tus datos de contacto y la fecha.';
    if (!Number.isInteger(personas) || personas < 1) return 'La cantidad de personas debe ser mayor a cero.';
    if (ruta.cupoMaximo && personas > ruta.cupoMaximo) return `La ruta tiene un máximo de ${ruta.cupoMaximo} cupos disponibles.`;
    const hoy = new Date(); hoy.setHours(0,0,0,0); const elegida = new Date(fecha + 'T00:00:00');
    if (elegida <= hoy) return 'Selecciona una fecha posterior a hoy.';
    return '';
  }

  $('personas').addEventListener('input', actualizarResumen);
  const manana = new Date(); manana.setDate(manana.getDate()+1); $('fecha').min = manana.toISOString().slice(0,10);

  $('form-reserva').addEventListener('submit', async event => {
    event.preventDefault();
    const feedback = $('reserva-feedback'); feedback.className = 'reserva-feedback';
    const error = validar(); if (error) { feedback.textContent = error; feedback.classList.add('error'); return; }
    const boton = event.submitter; boton.disabled = true; boton.textContent = 'Registrando reserva…';
    try {
      const usuario = await obtenerOCrearUsuario();
      const payload = {
        usuarioId: usuario.id,
        rutaId: ruta.id || idRuta,
        cantidadPersonas: Number($('personas').value),
        fechaReserva: $('fecha').value,
        necesitaGuia: $('guia').checked,
        equipamientos: seleccionados().map(({equipamientoId,cantidad}) => ({equipamientoId,cantidad}))
      };
      const reserva = await fetchJson(`${API}/api/reservas`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      localStorage.setItem('voy-vuelvo-ultima-reserva', JSON.stringify({ ...reserva, rutaNombre:ruta.nombre, equipamientos:seleccionados() }));
      feedback.textContent = `Reserva #${reserva.id} creada correctamente. Estado de pago: ${reserva.estadoPago || 'PROCESANDO'}.`;
      feedback.classList.add('ok');
    } catch (e) {
      const borrador = { rutaId:idRuta, rutaNombre:ruta.nombre, fecha:$('fecha').value, personas:Number($('personas').value), necesitaGuia:$('guia').checked, equipamientos:seleccionados() };
      localStorage.setItem('voy-vuelvo-reserva-borrador', JSON.stringify(borrador));
      feedback.textContent = `No se pudo conectar con el backend: ${e.message}. La selección quedó guardada como borrador en este navegador.`;
      feedback.classList.add('error');
    } finally {
      boton.disabled = false; boton.textContent = 'Confirmar reserva';
    }
  });

  cargarDesdeApi();
})();
