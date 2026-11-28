import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { initialProducts } from "../data/products";
import { readStorage, writeStorage } from "../services/storage";
import { addToCart, sanitizeCart } from "../utils/cart";
import { refreshBackend } from "../services/auth.js";

const StoreContext = createContext(null);

const SESSION_KEY = "vv-react-auth-v3";

// Renovar cinco minutos antes del vencimiento.
const REFRESH_MARGIN = 5 * 60 * 1000;

// Duracion maxima de la sesion: ocho horas.
const SESSION_LIMIT = 8 * 60 * 60 * 1000;

const ROLES = {
  ADMINISTRADOR: "Administrador",
  VENDEDOR: "Vendedor",
  CLIENTE: "Cliente",
};

// 1. LEER INFORMACION DEL JWT
function leerToken(token) {

  try {

    const partes = token.split(".");

    if (partes.length !== 3) {
      return null;
    }

    const contenido = partes[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const datos = JSON.parse(atob(contenido));

    if (
      !datos.sub ||
      !ROLES[datos.rol] ||
      !Number.isFinite(datos.exp) ||
      datos.exp * 1000 <= Date.now()
    ) {
      return null;
    }

    return datos;

  } catch {
    return null;
  }
}

// 2. RECUPERAR SESION AL RECARGAR
function recuperarSesion() {

  try {

    const token =
      sessionStorage.getItem(SESSION_KEY);

    if (!token) {
      return null;
    }

    const datos = leerToken(token);

    if (!datos) {
      return null;
    }

    return {
      token,
      profile: {
        id: datos.sub,
        username: datos.sub,
        nombre: datos.sub,
        correo: "",
        rol: ROLES[datos.rol],
      },
    };

  } catch {
    return null;
  }
}

export function StoreProvider({ children }) {

  // 3. PRODUCTOS
  const [products, setProducts] = useState(() => {

    const saved = readStorage(
      "vv-react-products-v2",
      null
    );

    return Array.isArray(saved)
      ? saved
      : initialProducts.map((p) => ({
          ...p,
          codigo: `VV-${String(p.id).padStart(3, "0")}`,
          stockCritico: 3,
        }));
  });

  // 4. CARRITO DE COMPRAS
  const [rawCart, setCart] = useState(() =>
    readStorage("voy-vuelvo-carrito-v1", [])
  );

  // 5. AUTENTICACION JWT
  const [auth, setAuth] = useState(recuperarSesion);

  const session = auth?.profile ?? null;
  const authToken = auth?.token ?? null;

  const tokenActual = useRef(authToken);

  // 6. INICIAR SESION
  function signIn(user) {

    if (!user?.token) {
      throw new Error(
        "No se recibió un token de autenticación."
      );
    }

    const { token, ...profile } = user;

    tokenActual.current = token;

    setAuth({
      token,
      profile,
    });

    if (leerToken(token)) {
      sessionStorage.setItem(SESSION_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  // 7. CERRAR SESION
  function signOut() {

    tokenActual.current = null;

    setAuth(null);

    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("vv-react-session-v2");
  }

  // 8. CONTROLAR VENCIMIENTO Y RENOVACION
  useEffect(() => {

    sessionStorage.removeItem("vv-react-session-v2");

    if (!authToken) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }

    const datos = leerToken(authToken);

    if (!datos) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }

    const vencimiento = datos.exp * 1000;

    const tiempoRestante =
      vencimiento - Date.now();

    const controller = new AbortController();

    let cancelado = false;
    let temporizadorRenovacion;

    // Cerrar sesion cuando vence el JWT.
    const temporizadorVencimiento = setTimeout(() => {

      if (tokenActual.current === authToken) {
        signOut();
      }

    }, tiempoRestante);

    // Renovar la sesion mediante el backend.
    async function renovarSesion() {

      try {

        const nuevoToken = await refreshBackend(
          authToken,
          controller.signal
        );

        if (
          cancelado ||
          tokenActual.current !== authToken
        ) {
          return;
        }

        const nuevosDatos = leerToken(nuevoToken);

        // Comprobar identidad, rol y vencimiento.
        if (
          !nuevosDatos ||
          nuevosDatos.sub !== datos.sub ||
          nuevosDatos.rol !== datos.rol ||
          nuevosDatos.inicioSesion !== datos.inicioSesion ||
          nuevosDatos.exp <= datos.exp
        ) {
          return;
        }

        // Guardar el nuevo JWT.
        sessionStorage.setItem(
          SESSION_KEY,
          nuevoToken
        );

        tokenActual.current = nuevoToken;

        setAuth({
          token: nuevoToken,
          profile: {
            id: nuevosDatos.sub,
            username: nuevosDatos.sub,
            nombre: nuevosDatos.sub,
            correo: "",
            rol: ROLES[nuevosDatos.rol],
          },
        });

      } catch (error) {

        if (
          cancelado ||
          tokenActual.current !== authToken
        ) {
          return;
        }

        // Si el backend rechaza los permisos,
        // finalizar la sesion.
        if (
          error.status === 401 ||
          error.status === 403
        ) {
          signOut();
        }

        // Si falla la conexion, conservar el token
        // actual hasta su vencimiento.
      }
    }

    // Comprobar el limite absoluto de la sesion.
    // Los tokens antiguos sin inicioSesion no se
    // renuevan automaticamente.
    if (Number.isFinite(datos.inicioSesion)) {

      const limiteSesion = Math.floor(
        (datos.inicioSesion + SESSION_LIMIT) / 1000
      ) * 1000;

      if (vencimiento < limiteSesion) {

        const tiempoRenovacion = Math.max(
          0,
          tiempoRestante - REFRESH_MARGIN
        );

        temporizadorRenovacion = setTimeout(
          renovarSesion,
          tiempoRenovacion
        );
      }
    }

    // Limpiar temporizadores y solicitudes pendientes.
    return () => {

      cancelado = true;

      controller.abort();

      clearTimeout(temporizadorVencimiento);
      clearTimeout(temporizadorRenovacion);
    };

  }, [authToken]);

  // 9. SINCRONIZAR PRODUCTOS Y CARRITO
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

  // 10. GUARDAR CARRITO
  function saveCart(next) {

    writeStorage("voy-vuelvo-carrito-v1", next);

    setCart(next);
  }

  // 11. GUARDAR PRODUCTOS
  function saveProducts(next) {

    writeStorage("vv-react-products-v2", next);

    setProducts(next);
  }

  // 12. MODIFICAR CANTIDAD DEL CARRITO
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

        // Autenticacion
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
