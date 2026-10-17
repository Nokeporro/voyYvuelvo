/* GUÍA DE LECTURA: Define el catálogo de ejemplo que utilizan las páginas de productos y carrito. Los comentarios explican bloques y funciones; las instrucciones ejecutables conservan su comportamiento. */
// Catálogo de ejemplo de Voy & Vuelvo.
// Los precios están expresados en pesos chilenos.

// Cada producto es un objeto: id lo identifica; nombre y descripción explican qué es; precio e imagen alimentan la ficha; categoría y dificultad ayudan a clasificarlo; stock limita la compra; destacado indica si aparece en portada.
const productos = [
    {
        id: 1,
        nombre: "Mochila Trekking",
        descripcion:
            "Organiza y lleva tu equipo para tus caminatas y salidas al aire libre.",
        precio: 39990,
        imagen: "img/mochila.png",
        categoria: "Mochilas",
        dificultad: "facil",
        stock: 10,
        destacado: true
    },
    {
        id: 2,
        nombre: "Carpa de Montaña",
        descripcion:
            "Prepara tu espacio de descanso para escapadas de camping y aventuras de varios días.",
        precio: 89990,
        imagen: "img/carpa.png",
        categoria: "Camping",
        dificultad: "media",
        stock: 5,
        destacado: true
    },
    {
        id: 3,
        nombre: "Bastones de Trekking",
        descripcion:
            "Complementa tu equipo con bastones de apoyo para caminar por senderos y pendientes.",
        precio: 29990,
        imagen: "img/bastones.png",
        categoria: "Accesorios",
        dificultad: "alta",
        stock: 8,
        destacado: true
    },
    {
        id: 4,
        nombre: "Chaqueta Outdoor",
        descripcion:
            "Una capa exterior para complementar tu vestimenta durante las salidas a la naturaleza.",
        precio: 54990,
        imagen: "img/chaqueta.png",
        categoria: "Vestuario",
        dificultad: "media",
        stock: 12,
        destacado: false
    },
    {
        id: 5,
        nombre: "Botas de Trekking",
        descripcion:
            "Calzado de caña alta para completar tu equipo de caminata en rutas de montaña.",
        precio: 69990,
        imagen: "img/botas.png",
        categoria: "Calzado",
        dificultad: "alta",
        stock: 7,
        destacado: false
    },
    {
        id: 6,
        nombre: "Saco de Dormir",
        descripcion:
            "Incluye un espacio de descanso en tu equipaje para tus próximas noches de camping.",
        precio: 44990,
        imagen: "img/saco-dormir.png",
        categoria: "Camping",
        dificultad: "media",
        stock: 6,
        destacado: false
    },
    {
        id: 7,
        nombre: "Linterna Frontal",
        descripcion:
            "Ilumina tu entorno y mantén las manos libres al organizar tu equipo en el campamento.",
        precio: 19990,
        imagen: "img/linterna.png",
        categoria: "Iluminación",
        dificultad: "facil",
        stock: 15,
        destacado: false
    }
]
