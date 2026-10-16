/* GUÍA DE LECTURA: Transforma los datos del carrito en la interfaz que ve la persona. Los comentarios explican bloques y funciones; las instrucciones ejecutables conservan su comportamiento. */
'use strict';
(() => {
 const $=id=>document.getElementById(id);
 const dinero=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n);
// Crea elementos y les asigna texto como texto plano para evitar interpretar contenido como HTML.
 const crear=(tag,texto,clase)=>{const el=document.createElement(tag);if(texto!==undefined)el.textContent=texto;if(clase)el.className=clase;return el;};
// Ejecuta una modificación del carrito y convierte errores en mensajes visibles.
 function ejecutar(accion){try{accion();$('mensaje').textContent='Carrito actualizado.';}catch(e){$('mensaje').textContent=e.message;}}
// Dibuja cada producto y recalcula cantidades, subtotales y total mostrado.
 function pintar(){const items=Carrito.leer();$('vacio').hidden=items.length>0;$('carrito-contenido').hidden=!items.length;$('lista-carrito').replaceChildren();let total=0,unidades=0;
 for(const item of items){const p=productos.find(p=>p.id===item.id);total+=p.precio*item.cantidad;unidades+=item.cantidad;
 const card=crear('article',undefined,'item-carrito');const img=crear('img');img.src=p.imagen;img.alt=p.nombre;
 const contenido=crear('div'),h2=crear('h2'),enlace=crear('a',p.nombre);enlace.href='detalle-producto.html?id='+encodeURIComponent(p.id);h2.append(enlace);contenido.append(h2,crear('p',dinero(p.precio)+' por unidad'));
 const controles=crear('div',undefined,'controles');
 const menos=crear('button','−');menos.type='button';menos.dataset.foco='menos-'+p.id;menos.setAttribute('aria-label','Reducir cantidad de '+p.nombre);menos.disabled=item.cantidad<=1;
 const mas=crear('button','+');mas.type='button';mas.dataset.foco='mas-'+p.id;mas.setAttribute('aria-label','Aumentar cantidad de '+p.nombre);mas.disabled=item.cantidad>=p.stock;
 menos.onclick=()=>ejecutar(()=>Carrito.cambiar(p.id,item.cantidad-1));mas.onclick=()=>ejecutar(()=>Carrito.cambiar(p.id,item.cantidad+1));
 const cantidad=crear('span',String(item.cantidad));cantidad.setAttribute('aria-label',item.cantidad+' unidades');
 const quitar=crear('button','Eliminar','eliminar');quitar.type='button';quitar.setAttribute('aria-label','Eliminar '+p.nombre);quitar.onclick=()=>ejecutar(()=>Carrito.eliminar(p.id));
 controles.append(menos,cantidad,mas,quitar);contenido.append(controles,crear('strong','Subtotal: '+dinero(p.precio*item.cantidad)));card.append(img,contenido);$('lista-carrito').append(card);
 }
 $('unidades').textContent=unidades;$('subtotal').textContent=dinero(total);$('total').textContent=dinero(total);
 }
// Vacía el carrito solo después de pedir confirmación.
 $('vaciar').onclick=()=>{if(window.confirm('¿Quieres eliminar todos los productos del carrito?'))ejecutar(()=>Carrito.vaciar());};
 window.addEventListener('carrito:actualizado',()=>{const foco=document.activeElement?.dataset.foco;pintar();if(foco){const btn=[...document.querySelectorAll('[data-foco]')].find(b=>b.dataset.foco===foco);if(btn&&!btn.disabled)btn.focus();}});pintar();
})();
