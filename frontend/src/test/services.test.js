import { afterEach, describe, expect, it, vi } from "vitest";

import {
  deleteAccount,
  getUsers,
  login,
  saveAccount,
} from "../services/accounts";

import {
  readStorage,
  writeStorage,
} from "../services/storage";

import {
  embeddedList,
  request,
  submitReservation,
} from "../services/api";

// DATOS DE PRUEBA
const valid = {
  tipoDocumento: "rut",
  documento: "12.345.678-5",
  nombre: "Ana",
  apellidos: "Rojas",
  correo: "ANA@example.org",
  password: "Sendero2026!",
  telefono: "+56912345678",
  region: "Metropolitana de Santiago",
  comuna: "Santiago",
  direccion: "Alojamiento 123",
};

// LIMPIAR SIMULACIONES DESPUES DE CADA PRUEBA
afterEach(() => {
  vi.unstubAllGlobals();
});

// ============================================
// 1. PERSISTENCIA Y CUENTAS LOCALES
// ============================================

describe("Persistencia y cuentas locales", () => {

  it("recupera el respaldo ante JSON corrupto", () => {
    localStorage.setItem("prueba", "{");

    expect(readStorage("prueba", [])).toEqual([]);
  });

  it("informa errores de almacenamiento", () => {
    expect(() =>
      writeStorage(
        "x",
        {},
        {
          setItem: () => {
            throw Error("quota");
          },
        }
      )
    ).toThrow(/guardar/);
  });

  it("registra y permite iniciar sesion sin guardar contrasena en claro", async () => {
    const user = await saveAccount(valid);

    expect(user).toMatchObject({
      correo: "ana@example.org",
      documento: "123456785",
      rol: "Cliente",
    });

    expect(user).not.toHaveProperty("passwordHash");

    expect(
      JSON.stringify(getUsers())
    ).not.toContain("Sendero2026!");

    expect(
      await login(valid.correo, valid.password)
    ).toEqual(user);
  });

  it("rechaza contrasena incorrecta y correo inexistente", async () => {
    await saveAccount(valid);

    await expect(
      login(valid.correo, "mala")
    ).rejects.toThrow(/incorrectos/);

    await expect(
      login("otra@example.cl", "x")
    ).rejects.toThrow(/incorrectos/);
  });

  it("rechaza correo y documento duplicados", async () => {
    await saveAccount(valid);

    await expect(
      saveAccount(valid)
    ).rejects.toThrow(/correo/);

    await expect(
      saveAccount({
        ...valid,
        correo: "otra@example.cl",
      })
    ).rejects.toThrow(/documento/);
  });

  it("permite el mismo pasaporte para distintos paises", async () => {
    await saveAccount({
      ...valid,
      tipoDocumento: "pasaporte",
      documento: "AB12345",
      paisEmisor: "Francia",
    });

    await saveAccount({
      ...valid,
      tipoDocumento: "pasaporte",
      documento: "AB12345",
      paisEmisor: "Canadá",
      correo: "otro@example.ca",
    });

    expect(getUsers()).toHaveLength(2);
  });

  it("edita y elimina una cuenta", async () => {
    const user = await saveAccount(valid);

    await saveAccount(
      {
        ...valid,
        nombre: "Andrea",
      },
      user.id
    );

    expect(getUsers()).toHaveLength(1);

    expect(getUsers()[0].nombre).toBe("Andrea");

    deleteAccount(user.id);

    expect(getUsers()).toEqual([]);
  });

  it("admite las cuentas de demostracion con sus roles", async () => {
    expect(
      (await login("admin@duoc.cl", "Demo2026!")).rol
    ).toBe("Administrador");

    expect(
      (await login("vendedor@duoc.cl", "Demo2026!")).rol
    ).toBe("Vendedor");
  });
});

// ============================================
// 2. SERVICIOS API
// ============================================

describe("API con fetch simulado", () => {

  it("acepta listas directas y HAL", () => {
    expect(embeddedList([1])).toEqual([1]);

    expect(
      embeddedList({
        _embedded: {
          usuarios: [2],
        },
      })
    ).toEqual([2]);

    expect(embeddedList(null)).toEqual([]);
  });

  it("informa una respuesta HTTP invalida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      })
    );

    await expect(
      request("/api/rutas")
    ).rejects.toThrow(/503/);
  });

  it("acepta una respuesta sin contenido", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      })
    );

    expect(await request("/x")).toBeNull();
  });

  // ==========================================
  // 3. RESERVAS SEGURAS CON JWT
  // ==========================================

  it("envia una reserva con JWT sin permitir elegir usuarioId", async () => {

    // Simular respuesta exitosa del backend.
    const mock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 42,
        estadoPago: "PROCESANDO",
      }),
    });

    vi.stubGlobal("fetch", mock);

    // Enviar reserva con JWT de prueba.
    const saved = await submitReservation(
      {
        personas: "2",
        fecha: "2027-01-01",
        guia: true,
      },
      {
        id: 1,
      },
      [
        {
          id: 3,
        },
      ],
      "jwt-de-prueba"
    );

    // Comprobar respuesta.
    expect(saved.id).toBe(42);

    expect(saved.estadoPago).toBe("PROCESANDO");

    // Solo debe realizar una solicitud HTTP.
    expect(mock).toHaveBeenCalledTimes(1);

    const [url, options] = mock.mock.calls[0];

    // Comprobar endpoint seguro.
    expect(url).toContain("/auth/reservas");

    // Comprobar metodo POST.
    expect(options.method).toBe("POST");

    // Comprobar que se envia JWT.
    expect(
      options.headers.Authorization
    ).toBe("Bearer jwt-de-prueba");

    // Comprobar datos enviados.
    const body = JSON.parse(options.body);

    expect(body).toEqual({
      rutaId: 1,
      cantidadPersonas: 2,
      fechaReserva: "2027-01-01",
      necesitaGuia: true,
      equipamientos: [
        {
          equipamientoId: 3,
          cantidad: 1,
        },
      ],
    });

    // React no debe enviar usuarioId.
    // El backend lo obtiene del JWT.
    expect(body).not.toHaveProperty("usuarioId");
  });

  it("rechaza reservas cuando no existe JWT", async () => {

    // Simular la funcion fetch.
    const mock = vi.fn();

    vi.stubGlobal("fetch", mock);

    // Intentar reservar sin iniciar sesion.
    await expect(
      submitReservation(
        {
          personas: 1,
          fecha: "2027-01-01",
          guia: false,
        },
        {
          id: 1,
        },
        [],
        null
      )
    ).rejects.toThrow(
      "Debes iniciar sesión para realizar una reserva."
    );

    // No debe enviar ninguna solicitud.
    expect(mock).not.toHaveBeenCalled();
  });
});
