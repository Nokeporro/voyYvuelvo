import { createContext, useContext, useEffect, useState } from "react";
import { initialProducts } from "../data/products";
import { readStorage, writeStorage } from "../services/storage";
import { addToCart, sanitizeCart } from "../utils/cart";
const StoreContext = createContext(null);
export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const saved = readStorage("vv-react-products-v2", null);
    return Array.isArray(saved)
      ? saved
      : initialProducts.map((p) => ({
          ...p,
          codigo: `VV-${String(p.id).padStart(3, "0")}`,
          stockCritico: 3,
        }));
  });
  const [rawCart, setCart] = useState(() =>
    readStorage("voy-vuelvo-carrito-v1", []),
  );
  const [session, setSession] = useState(() =>
    readStorage("vv-react-session-v2", null, sessionStorage),
  );
  useEffect(() => {
    function sync(event) {
      if (event.key === "voy-vuelvo-carrito-v1" || event.key === null)
        setCart(readStorage("voy-vuelvo-carrito-v1", []));
      if (event.key === "vv-react-products-v2" || event.key === null) {
        const saved = readStorage("vv-react-products-v2", initialProducts);
        if (Array.isArray(saved)) setProducts(saved);
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const cart = sanitizeCart(rawCart, products);
  function saveCart(next) {
    writeStorage("voy-vuelvo-carrito-v1", next);
    setCart(next);
  }
  function saveProducts(next) {
    writeStorage("vv-react-products-v2", next);
    setProducts(next);
  }
  function signIn(user) {
    writeStorage("vv-react-session-v2", user, sessionStorage);
    setSession(user);
  }
  function signOut() {
    sessionStorage.removeItem("vv-react-session-v2");
    setSession(null);
  }
  function changeQuantity(id, cantidad) {
    const product = products.find((p) => p.id === id);
    if (
      !product ||
      !Number.isSafeInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > product.stock
    )
      throw Error("La cantidad debe estar entre 1 y el stock disponible.");
    saveCart(cart.map((i) => (i.id === id ? { id, cantidad } : i)));
  }
  return (
    <StoreContext.Provider
      value={{
        products,
        saveProducts,
        cart,
        add: (id, n) => saveCart(addToCart(cart, products, id, n)),
        changeQuantity,
        remove: (id) => saveCart(cart.filter((i) => i.id !== id)),
        clear: () => saveCart([]),
        session,
        signIn,
        signOut,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
export const useStore = () => useContext(StoreContext);
