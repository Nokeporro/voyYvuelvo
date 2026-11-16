export function sanitizeCart(items, products) {
  if (!Array.isArray(items)) return [];
  const quantities = new Map();
  for (const item of items) {
    const product = products.find((p) => p.id === item?.id);
    if (
      !product ||
      product.stock < 1 ||
      !Number.isSafeInteger(item.cantidad) ||
      item.cantidad < 1
    )
      continue;
    quantities.set(
      product.id,
      Math.min(
        product.stock,
        (quantities.get(product.id) || 0) + item.cantidad,
      ),
    );
  }
  return [...quantities].map(([id, cantidad]) => ({ id, cantidad }));
}
export function addToCart(items, products, id, cantidad) {
  const product = products.find((p) => p.id === id);
  if (!product) throw Error("Producto no encontrado.");
  if (!Number.isSafeInteger(cantidad) || cantidad < 1)
    throw Error("Ingresa una cantidad entera mayor que cero.");
  const cart = sanitizeCart(items, products);
  const previous = cart.find((i) => i.id === id)?.cantidad || 0;
  if (previous + cantidad > product.stock)
    throw Error("La cantidad supera el stock disponible.");
  return [
    ...cart.filter((i) => i.id !== id),
    { id, cantidad: previous + cantidad },
  ];
}
export function cartTotals(items, products, coupon = "") {
  const subtotal = sanitizeCart(items, products).reduce(
    (sum, i) => sum + products.find((p) => p.id === i.id).precio * i.cantidad,
    0,
  );
  const descuento =
    coupon.trim().toUpperCase() === "AVENTURA10"
      ? Math.round(subtotal * 0.1)
      : 0;
  return { subtotal, descuento, total: subtotal - descuento };
}
