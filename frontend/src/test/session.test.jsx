import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { StoreProvider, useStore } from "../context/Store";

const SESSION_KEY = "vv-react-auth-v3";

// Generar un JWT simulado para las pruebas.
function crearToken(segundos = 3600) {
  const payload = btoa(
    JSON.stringify({
      sub: "admin_ep3",
      rol: "ADMINISTRADOR",
      exp: Math.floor(Date.now() / 1000) + segundos,
    })
  );

  return `cabecera.${payload}.firma`;
}

// Preparar un usuario de prueba.
function crearUsuario(token) {
  return {
    id: "admin_ep3",
    username: "admin_ep3",
    nombre: "admin_ep3",
    correo: "",
    rol: "Administrador",
    token,
  };
}

describe("Persistencia de sesión JWT", () => {

  // 1. Mantener la sesión después de recargar.
  it("recupera la sesión después de recargar la aplicación", () => {
    const token = crearToken();

    const primeraCarga = renderHook(() => useStore(), {
      wrapper: StoreProvider,
    });

    act(() => {
      primeraCarga.result.current.signIn(
        crearUsuario(token)
      );
    });

    expect(sessionStorage.getItem(SESSION_KEY))
      .toBe(token);

    primeraCarga.unmount();

    const segundaCarga = renderHook(() => useStore(), {
      wrapper: StoreProvider,
    });

    expect(segundaCarga.result.current.session.username)
      .toBe("admin_ep3");

    expect(segundaCarga.result.current.session.rol)
      .toBe("Administrador");

    expect(segundaCarga.result.current.authToken)
      .toBe(token);
  });

  // 2. Eliminar la sesión al cerrar sesión.
  it("elimina el token y no recupera una sesión cerrada", () => {
    const token = crearToken();

    const primeraCarga = renderHook(() => useStore(), {
      wrapper: StoreProvider,
    });

    act(() => {
      primeraCarga.result.current.signIn(
        crearUsuario(token)
      );
    });

    act(() => {
      primeraCarga.result.current.signOut();
    });

    expect(primeraCarga.result.current.session)
      .toBeNull();

    expect(primeraCarga.result.current.authToken)
      .toBeNull();

    expect(sessionStorage.getItem(SESSION_KEY))
      .toBeNull();

    primeraCarga.unmount();

    const segundaCarga = renderHook(() => useStore(), {
      wrapper: StoreProvider,
    });

    expect(segundaCarga.result.current.session)
      .toBeNull();
  });

  // 3. Rechazar tokens vencidos.
  it("no recupera una sesión con un token vencido", () => {
    sessionStorage.setItem(
      SESSION_KEY,
      crearToken(-60)
    );

    const { result } = renderHook(() => useStore(), {
      wrapper: StoreProvider,
    });

    expect(result.current.session).toBeNull();
    expect(result.current.authToken).toBeNull();

    expect(sessionStorage.getItem(SESSION_KEY))
      .toBeNull();
  });

  // 4. Rechazar tokens mal formados.
  it("no recupera una sesión con un token inválido", () => {
    sessionStorage.setItem(
      SESSION_KEY,
      "token-invalido"
    );

    const { result } = renderHook(() => useStore(), {
      wrapper: StoreProvider,
    });

    expect(result.current.session).toBeNull();
    expect(result.current.authToken).toBeNull();

    expect(sessionStorage.getItem(SESSION_KEY))
      .toBeNull();
  });

  // 5. Cerrar la sesión cuando vence el token.
  it("cierra automáticamente la sesión al vencer el JWT", () => {
    vi.useFakeTimers();

    const vista = renderHook(() => useStore(), {
      wrapper: StoreProvider,
    });

    try {
      const token = crearToken(2);

      act(() => {
        vista.result.current.signIn(
          crearUsuario(token)
        );
      });

      expect(vista.result.current.session)
        .not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(vista.result.current.session)
        .toBeNull();

      expect(vista.result.current.authToken)
        .toBeNull();

      expect(sessionStorage.getItem(SESSION_KEY))
        .toBeNull();

    } finally {
      vista.unmount();
      vi.useRealTimers();
    }
  });
});
