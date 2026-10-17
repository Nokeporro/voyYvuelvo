import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/Store";
import { cartTotals } from "../utils/cart";
import { money } from "../utils/validation";
export default function Cart() {
  const { cart, products, changeQuantity, remove, clear } = useStore();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState("");
  const [message, setMessage] = useState("");
  const totals = cartTotals(cart, products, applied);
  function act(fn) {
    try {
      fn();
      setMessage("Carrito actualizado.");
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <div className="container py-5">
      <span className="eyebrow">Prepara tu aventura</span>
      <h1>Tu carrito</h1>
      <p role="status">{message}</p>
      {!cart.length ? (
        <div className="empty-panel">
          <h2 className="h4">Tu carrito está vacío</h2>
          <p>Encuentra el equipo para tu próxima ruta.</p>
          <Link className="btn btn-warning" to="/productos">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            {cart.map((item) => {
              const p = products.find((p) => p.id === item.id);
              return (
                <article className="cart-row" key={item.id}>
                  <img src={p.imagen || "/img/mochila.png"} alt={p.nombre} />
                  <div className="flex-grow-1">
                    <Link to={`/productos/${p.id}`}>
                      <h2 className="h5">{p.nombre}</h2>
                    </Link>
                    <p>{money(p.precio)} por unidad</p>
                    <label className="form-label" htmlFor={`cantidad-${p.id}`}>
                      Cantidad de {p.nombre}
                    </label>
                    <input
                      className="form-control quantity"
                      id={`cantidad-${p.id}`}
                      type="number"
                      min="1"
                      max={p.stock}
                      value={item.cantidad}
                      onChange={(e) =>
                        act(() => changeQuantity(p.id, Number(e.target.value)))
                      }
                    />
                  </div>
                  <div className="text-end">
                    <strong>{money(p.precio * item.cantidad)}</strong>
                    <button
                      className="btn btn-link text-danger d-block"
                      onClick={() => act(() => remove(p.id))}
                    >
                      Eliminar {p.nombre}
                    </button>
                  </div>
                </article>
              );
            })}
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() => act(clear)}
            >
              Vaciar carrito
            </button>
          </div>
          <aside className="col-lg-4">
            <div className="form-panel">
              <h2 className="h4">Resumen</h2>
              <dl className="totals">
                <dt>Subtotal</dt>
                <dd>{money(totals.subtotal)}</dd>
                <dt>Descuento</dt>
                <dd>{money(totals.descuento)}</dd>
                <dt>Total</dt>
                <dd>
                  <strong>{money(totals.total)}</strong>
                </dd>
              </dl>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const code = coupon.trim().toUpperCase();
                  setApplied(code === "AVENTURA10" ? code : "");
                  setMessage(
                    code === "AVENTURA10"
                      ? "Cupón aplicado: 10% de descuento."
                      : "Cupón no válido.",
                  );
                }}
              >
                <label className="form-label" htmlFor="cupon">
                  Cupón de descuento
                </label>
                <div className="input-group">
                  <input
                    className="form-control"
                    id="cupon"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <button className="btn btn-outline-dark">Aplicar</button>
                </div>
                <small className="form-text">Prueba AVENTURA10</small>
              </form>
              <p className="demo-note mt-4">
                Compra de demostración. Esta entrega no procesa pagos ni genera
                pedidos.
              </p>
              <Link className="text-link" to="/productos">
                Seguir explorando →
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
