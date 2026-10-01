/* GUÍA DE LECTURA: Busca el producto indicado en la URL y rellena su ficha de detalle. Los comentarios explican bloques y funciones; las instrucciones ejecutables conservan su comportamiento. */
'use strict';
(() => {
// Lee el parámetro id de la dirección para saber qué producto mostrar.
 const id=new URLSearchParams(location.search).get('id');
// Busca ese identificador en el catálogo cargado por productos-data.js.
 const producto=productos.find(p=>String(p.id)===id);
 const $=id=>document.getElementById(id);
// Si el producto no existe, muestra el aviso correspondiente y termina la ejecución.
 if(!producto){$('no-encontrado').hidden=false;return;}
// Rellena los datos visibles de la ficha, incluidos precio, stock e imagen.
 $('detalle').hidden=false;document.title=producto.nombre+' | Voy & Vuelvo';
 $('nombre').textContent=producto.nombre;$('descripcion').textContent=producto.descripcion;
 $('categoria').textContent=producto.categoria;$('imagen').src=producto.imagen;$('imagen').alt=producto.nombre;
 $('precio').textContent=new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(producto.precio);
 $('stock').textContent=producto.stock>0?`Stock disponible: ${producto.stock} unidades`:'Producto agotado';
 $('dificultad').textContent='Dificultad sugerida del catálogo: '+({facil:'Fácil',media:'Media',alta:'Alta'}[producto.dificultad]||producto.dificultad);
 $('cantidad').max=producto.stock;$('agregar').disabled=producto.stock<=0;$('cantidad').disabled=producto.stock<=0;
// Al enviar el formulario, pide al carrito agregar la cantidad seleccionada y muestra el resultado.
 $('agregar-form').addEventListener('submit',e=>{e.preventDefault();try{Carrito.agregar(producto.id,Number($('cantidad').value));$('mensaje').textContent='Producto agregado. Puedes seguir comprando o ver tu carrito.';}catch(error){$('mensaje').textContent=error.message;}});
})();
