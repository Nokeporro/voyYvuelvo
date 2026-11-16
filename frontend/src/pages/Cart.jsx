import PageTemplate from "../components/templates/PageTemplate";
import Button from "../components/atoms/Button";
import AppLink from "../components/atoms/AppLink";
import Heading from "../components/atoms/Heading";
import Text from "../components/atoms/Text";
import TotalsSummary from "../components/molecules/TotalsSummary";
import CartItem from "../components/molecules/CartItem";
import CouponForm from "../components/molecules/CouponForm";
import { useState } from "react";

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
    <PageTemplate className="container py-5">
      <Text as="span" className="eyebrow">
        Prepara tu aventura
      </Text>
      <Heading as="h1">Tu carrito</Heading>
      <Text role="status">{message}</Text>
      {!cart.length ? (
        <div className="empty-panel">
          <Heading as="h2" className="h4">
            Tu carrito está vacío
          </Heading>
          <Text>Encuentra el equipo para tu próxima ruta.</Text>
          <AppLink className="btn btn-warning" to="/productos">
            Explorar productos
          </AppLink>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            {cart.map((item) => {
              const p = products.find((p) => p.id === item.id);
              return (
                <CartItem
                  key={item.id}
                  product={p}
                  quantity={item.cantidad}
                  onQuantityChange={(quantity) =>
                    act(() => changeQuantity(p.id, quantity))
                  }
                  onRemove={() => act(() => remove(p.id))}
                />
              );
            })}
            <Button
              className="btn btn-outline-danger mt-3"
              onClick={() => act(clear)}
            >
              Vaciar carrito
            </Button>
          </div>
          <aside className="col-lg-4">
            <div className="form-panel">
              <Heading as="h2" className="h4">
                Resumen
              </Heading>
              <TotalsSummary
                items={[
                  {
                    label: "Subtotal",
                    value: money(totals.subtotal),
                    emphasis: false,
                  },
                  {
                    label: "Descuento",
                    value: money(totals.descuento),
                    emphasis: false,
                  },
                  {
                    label: "Total",
                    value: money(totals.total),
                    emphasis: true,
                  },
                ]}
              />
              <CouponForm
                value={coupon}
                onChange={setCoupon}
                onApply={(code) => {
                  setApplied(code === "AVENTURA10" ? code : "");
                  setMessage(
                    code === "AVENTURA10"
                      ? "Cupón aplicado: 10% de descuento."
                      : "Cupón no válido.",
                  );
                }}
              />
              <Text className="demo-note mt-4">
                Compra de demostración. Esta entrega no procesa pagos ni genera
                pedidos.
              </Text>
              <AppLink className="text-link" to="/productos">
                Seguir explorando →
              </AppLink>
            </div>
          </aside>
        </div>
      )}
    </PageTemplate>
  );
}
