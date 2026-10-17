import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deleteAccount,
  getUsers,
  login,
  saveAccount,
} from "../services/accounts";
import { readStorage, writeStorage } from "../services/storage";
import { embeddedList, request, submitReservation } from "../services/api";
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
afterEach(() => vi.unstubAllGlobals());
describe("Persistencia y cuentas locales", () => {
  it("recupera el respaldo ante JSON corrupto", () => {
    localStorage.setItem("prueba", "{");
    expect(readStorage("prueba", [])).toEqual([]);
  });
  it("informa errores de almacenamiento", () =>
    expect(() =>
      writeStorage(
        "x",
        {},
        {
          setItem: () => {
            throw Error("quota");
          },
        },
      ),
    ).toThrow(/guardar/));
  it("registra, normaliza y permite iniciar sesión sin guardar contraseña en claro", async () => {
    const user = await saveAccount(valid);
    expect(user).toMatchObject({
      correo: "ana@example.org",
      documento: "123456785",
      rol: "Cliente",
    });
    expect(user).not.toHaveProperty("passwordHash");
    expect(JSON.stringify(getUsers())).not.toContain("Sendero2026!");
    expect(await login(valid.correo, valid.password)).toEqual(user);
  });
  it("rechaza contraseña incorrecta y correo inexistente", async () => {
    await saveAccount(valid);
    await expect(login(valid.correo, "mala")).rejects.toThrow(/incorrectos/);
    await expect(login("otra@example.org", "x")).rejects.toThrow(/incorrectos/);
  });
  it("rechaza correo y documento duplicados", async () => {
    await saveAccount(valid);
    await expect(saveAccount(valid)).rejects.toThrow(/correo/);
    await expect(
      saveAccount({ ...valid, correo: "otra@example.cl" }),
    ).rejects.toThrow(/documento/);
  });
  it("permite el mismo pasaporte para distintos países emisores", async () => {
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
    await saveAccount({ ...valid, nombre: "Andrea" }, user.id);
    expect(getUsers()).toHaveLength(1);
    expect(getUsers()[0].nombre).toBe("Andrea");
    deleteAccount(user.id);
    expect(getUsers()).toEqual([]);
  });
  it("admite las cuentas de demostración con sus roles", async () => {
    expect((await login("admin@duoc.cl", "Demo2026!")).rol).toBe(
      "Administrador",
    );
    expect((await login("vendedor@duoc.cl", "Demo2026!")).rol).toBe("Vendedor");
  });
});
describe("API con fetch simulado", () => {
  it("acepta listas directas y HAL", () => {
    expect(embeddedList([1])).toEqual([1]);
    expect(embeddedList({ _embedded: { usuarios: [2] } })).toEqual([2]);
    expect(embeddedList(null)).toEqual([]);
  });
  it("informa respuesta HTTP inválida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );
    await expect(request("/api/rutas")).rejects.toThrow(/503/);
  });
  it("acepta una respuesta sin contenido", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 204 }),
    );
    expect(await request("/x")).toBeNull();
  });
  it("reutiliza usuario existente y envía el contrato de reserva", async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 8, email: "ana@example.org" }],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 42 }) });
    vi.stubGlobal("fetch", mock);
    const saved = await submitReservation(
      {
        nombre: "Ana",
        email: "ANA@example.org",
        telefono: "12345678",
        personas: "2",
        fecha: "2027-01-01",
        guia: true,
      },
      { id: 1 },
      [{ id: 3 }],
    );
    expect(saved.id).toBe(42);
    expect(JSON.parse(mock.mock.calls[1][1].body)).toEqual({
      usuarioId: 8,
      rutaId: 1,
      cantidadPersonas: 2,
      fechaReserva: "2027-01-01",
      necesitaGuia: true,
      equipamientos: [{ equipamientoId: 3, cantidad: 1 }],
    });
  });
  it("crea el usuario si no existe antes de reservar", async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 9 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 43 }) });
    vi.stubGlobal("fetch", mock);
    expect(
      (
        await submitReservation(
          {
            nombre: "Ana",
            email: "a@example.cl",
            telefono: "12345678",
            personas: 1,
            fecha: "2027-01-01",
            guia: false,
          },
          { id: 1 },
          [],
        )
      ).id,
    ).toBe(43);
    expect(mock).toHaveBeenCalledTimes(3);
  });
});
