'use strict';
(() => {
 const id=new URLSearchParams(location.search).get('id');
 const producto=productos.find(p=>String(p.id)===id);
 const $=id=>document.getElementById(id);
 if(!producto){$('no-encontrado').hidden=false;return;}
 $('detalle').hidden=false;document.title=producto.nombre+' | Voy & Vuelvo';
 $('nombre').textContent=producto.nombre;$('descripcion').textContent=producto.descripcion;
 $('categoria').textContent=producto.categoria;$('imagen').src=producto.imagen;$('imagen').alt=producto.nombre;
 $('precio').textContent=new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(producto.precio);
 $('stock').textContent=producto.stock>0?`Stock disponible: ${producto.stock} unidades`:'Producto agotado';
 $('dificultad').textContent='Dificultad sugerida del catálogo: '+({facil:'Fácil',media:'Media',alta:'Alta'}[producto.dificultad]||producto.dificultad);
 $('cantidad').max=producto.stock;$('agregar').disabled=producto.stock<=0;$('cantidad').disabled=producto.stock<=0;
 $('agregar-form').addEventListener('submit',e=>{e.preventDefault();try{Carrito.agregar(producto.id,Number($('cantidad').value));$('mensaje').textContent='Producto agregado. Puedes seguir comprando o ver tu carrito.';}catch(error){$('mensaje').textContent=error.message;}});
})();
