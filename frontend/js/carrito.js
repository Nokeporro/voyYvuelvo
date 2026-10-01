/* GUÍA DE LECTURA: Contiene las operaciones reutilizables del carrito y su almacenamiento local. Los comentarios explican bloques y funciones; las instrucciones ejecutables conservan su comportamiento. */
/* Carrito compartido. Guarda IDs y cantidades; consulta precios en el catálogo. */
(() => {
 'use strict';
 const CLAVE='voy-vuelvo-carrito-v1';
 const catalogo=()=>typeof productos==='undefined'?[]:productos;
// Recupera elementos guardados, comprueba que sigan existiendo en el catálogo y corrige cantidades fuera de stock.
 function leer(){
  let datos;try{datos=JSON.parse(localStorage.getItem(CLAVE)||'[]');}catch{return [];}
  if(!Array.isArray(datos))return [];
  const mapa=new Map();
  for(const item of datos){if(!item||!Number.isSafeInteger(item.cantidad)||item.cantidad<1)continue;
   const producto=catalogo().find(p=>String(p.id)===String(item.id));
   if(!producto||!Number.isInteger(producto.stock)||producto.stock<=0)continue;
   mapa.set(producto.id,Math.min(producto.stock,(mapa.get(producto.id)||0)+item.cantidad));
  }
  return [...mapa].map(([id,cantidad])=>({id,cantidad}));
 }
// Actualiza el número de unidades que aparece junto al acceso al carrito.
 function contador(){const n=leer().reduce((s,i)=>s+i.cantidad,0);document.querySelectorAll('#contador-carrito').forEach(el=>el.textContent=n);}
// Guarda el estado nuevo y notifica a la interfaz para que vuelva a dibujarse.
 function guardar(items){try{localStorage.setItem(CLAVE,JSON.stringify(items));}catch{throw Error('No se pudo guardar el carrito. Revisa si el navegador permite almacenamiento local.');}contador();window.dispatchEvent(new Event('carrito:actualizado'));}
// Añade un producto y rechaza cantidades inválidas o superiores al inventario.
 function agregar(id,cantidad){const p=catalogo().find(p=>String(p.id)===String(id));if(!p)throw Error('Producto no encontrado.');if(!Number.isSafeInteger(cantidad)||cantidad<1)throw Error('Ingresa una cantidad entera mayor que cero.');const items=leer(),item=items.find(i=>i.id===p.id);if((item?.cantidad||0)+cantidad>p.stock)throw Error('La cantidad total en tu carrito supera el stock disponible.');if(item)item.cantidad+=cantidad;else items.push({id:p.id,cantidad});guardar(items);}
// Cambia la cantidad de una línea del carrito tras comprobar el stock.
 function cambiar(id,cantidad){const p=catalogo().find(p=>p.id===id);if(!p||!Number.isSafeInteger(cantidad)||cantidad<1||cantidad>p.stock)throw Error('La cantidad debe estar entre 1 y el stock disponible.');guardar(leer().map(i=>i.id===id?{id,cantidad}:i));}
 window.Carrito={leer,agregar,cambiar,eliminar:id=>guardar(leer().filter(i=>i.id!==id)),vaciar:()=>guardar([]),contador,clave:CLAVE};
 window.addEventListener('storage',e=>{if(e.key===CLAVE||e.key===null){contador();window.dispatchEvent(new Event('carrito:actualizado'));}});
 contador();
})();
