import { describe, expect, it } from "vitest";
import { addToCart, cartTotals, sanitizeCart } from "../utils/cart";
const products = [
  { id: 1, stock: 3, precio: 10000 },
  { id: 2, stock: 0, precio: 5000 },
];
describe("Reglas del carrito", () => {
  it("agrega y acumula cantidades sin mutar el estado previo", () => {
    const before = [{ id: 1, cantidad: 1 }];
    expect(addToCart(before, products, 1, 2)).toEqual([{ id: 1, cantidad: 3 }]);
    expect(before[0].cantidad).toBe(1);
  });
  it("rechaza la suma que supera stock", () =>
    expect(() => addToCart([{ id: 1, cantidad: 2 }], products, 1, 2)).toThrow(
      /stock/,
    ));
  it.each([0, -1, 1.5, NaN])("rechaza cantidad inválida %s", (n) =>
    expect(() => addToCart([], products, 1, n)).toThrow(/entera/),
  );
  it("rechaza productos inexistentes", () =>
    expect(() => addToCart([], products, 99, 1)).toThrow(/encontrado/));
  it("descarta datos corruptos, agotados y duplicados fuera del límite", () =>
    expect(
      sanitizeCart(
        [
          null,
          { id: 99, cantidad: 1 },
          { id: 2, cantidad: 1 },
          { id: 1, cantidad: -1 },
          { id: 1, cantidad: 2 },
          { id: 1, cantidad: 2 },
        ],
        products,
      ),
    ).toEqual([{ id: 1, cantidad: 3 }]));
  it("tolera un almacenamiento que no es una lista", () =>
    expect(sanitizeCart({}, products)).toEqual([]));
  it("calcula el descuento y el total en CLP", () =>
    expect(
      cartTotals([{ id: 1, cantidad: 2 }], products, " aventura10 "),
    ).toEqual({ subtotal: 20000, descuento: 2000, total: 18000 }));
  it("no descuenta un cupón desconocido", () =>
    expect(cartTotals([{ id: 1, cantidad: 1 }], products, "otro").total).toBe(
      10000,
    ));
});
