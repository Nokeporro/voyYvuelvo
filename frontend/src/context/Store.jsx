
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { initialProducts } from "../data/products";
import { readStorage, writeStorage } from "../services/storage";
import { addToCart, sanitizeCart } from "../utils/cart";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {

  // PRODUCTOS
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

  // CARRITO DE COMPRAS
  const [rawCart, setCart] = useState(() =>
    readStorage("voy-vuelvo-carrito-v1", [])
  );

  // AUTENTICACIÓN JWT
  // El token permanece solamente en memoria.
  const [session, setSession] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Eliminar sesiones locales antiguas de la EP2.
  useEffect(() => {
    sessionStorage.removeItem("vv-react-session-v2");
  }, []);

  // SINCRONIZACIÓN DE PRODUCTOS Y CARRITO
  useEffect(() => {
    function sync(event) {

      if (
        event.key === "voy-vuelvo-carrito-v1" ||
        event.key === null
      ) {
        setCart(
          readStorage("voy-vuelvo-carrito-v1", [])
        );
      }

      if (
        event.key === "vv-react-products-v2" ||
        event.key === null
      ) {
        const saved = readStorage(
          "vv-react-products-v2",
          initialProducts
        );

        if (Array.isArray(saved)) {
          setProducts(saved);
        }
      }
    }

    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("storage", sync);
    };
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

  // INICIAR SESIÓN CON JWT
  function signIn(user) {

    if (!user?.token) {
      throw new Error(
        "No se recibió un token de autenticación."
      );
    }

    const { token, ...profile } = user;

    // Guardar token únicamente en memoria.
    setAuthToken(token);

    // Guardar los datos visibles del usuario.
    setSession(profile);
  }

  // CERRAR SESIÓN
  function signOut() {
    setAuthToken(null);
    setSession(null);

    // Limpiar sesiones de la versión anterior.
    sessionStorage.removeItem("vv-react-session-v2");
  }

  // MODIFICAR CANTIDADES DEL CARRITO
  function changeQuantity(id, cantidad) {

    const product = products.find(
      (p) => p.id === id
    );

    if (
      !product ||
      !Number.isSafeInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > product.stock
    ) {
      throw Error(
        "La cantidad debe estar entre 1 y el stock disponible."
      );
    }

    saveCart(
      cart.map((i) =>
        i.id === id
          ? { id, cantidad }
          : i
      )
    );
  }

  return (
    <StoreContext.Provider
      value={{

        // Productos
        products,
        saveProducts,

        // Carrito
        cart,
        add: (id, n) =>
          saveCart(addToCart(cart, products, id, n)),
        changeQuantity,
        remove: (id) =>
          saveCart(cart.filter((i) => i.id !== id)),
        clear: () => saveCart([]),

        // Autenticación
        session,
        authToken,
        signIn,
        signOut,

      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
