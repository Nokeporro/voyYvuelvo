import { describe, expect, it } from "vitest";
import {
  normalizeDocument,
  validRut,
  validEmail,
  validateRegistration,
  validateReservation,
  tomorrow,
} from "../utils/validation";
export const validRegistration = {
  tipoDocumento: "rut",
  documento: "12.345.678-5",
  paisEmisor: "",
  nombre: "Ana",
  apellidos: "Rojas",
  correo: "ana@example.org",
  password: "Sendero2026!",
  confirmacion: "Sendero2026!",
  telefono: "+56912345678",
  region: "Metropolitana de Santiago",
  comuna: "Santiago",
  direccion: "Alojamiento 123",
  acepta: true,
};
describe("Identificación y registro", () => {
  it.each(["123456785", "12.345.678-5", "1.000.005-K", "1000005k"])(
    "acepta RUT válido %s",
    (rut) => expect(validRut(rut)).toBe(true),
  );
  it.each(["123456789", "00000000", "ABC123", "123", "12.345.678-K", ""])(
    "rechaza RUT inválido %s",
    (rut) => expect(validRut(rut)).toBe(false),
  );
  it("normaliza puntos, espacios y guion", () =>
    expect(normalizeDocument(" 6.731.195-k ")).toBe("6731195K"));
  it("permite un correo extranjero", () =>
    expect(validEmail("visita@example.fr")).toBe(true));
  it.each(["a@", "sin-correo", "a b@correo.cl", "a@b", ""])(
    "rechaza correo %s",
    (value) => expect(validEmail(value)).toBe(false),
  );
  it("valida el registro completo con RUT", () =>
    expect(validateRegistration(validRegistration)).toEqual({}));
  it("admite pasaporte y alojamiento sin exigir región/comuna chilena", () =>
    expect(
      validateRegistration({
        ...validRegistration,
        tipoDocumento: "pasaporte",
        documento: "AB1234567",
        paisEmisor: "Francia",
        region: "",
        comuna: "",
      }),
    ).toEqual({}));
  it("exige el país emisor y formato de pasaporte", () =>
    expect(
      validateRegistration({
        ...validRegistration,
        tipoDocumento: "pasaporte",
        documento: "AB-12",
        paisEmisor: "",
      }),
    ).toMatchObject({
      documento: expect.any(String),
      paisEmisor: expect.any(String),
    }));
  it("rechaza comuna ajena a la región", () =>
    expect(
      validateRegistration({ ...validRegistration, comuna: "Temuco" }),
    ).toHaveProperty("comuna"));
  it("rechaza contraseñas distintas y falta de consentimiento", () =>
    expect(
      validateRegistration({
        ...validRegistration,
        confirmacion: "otro",
        acepta: false,
      }),
    ).toMatchObject({
      confirmacion: expect.any(String),
      acepta: expect.any(String),
    }));
  it("marca campos vacíos y contraseña corta", () =>
    expect(Object.keys(validateRegistration({}))).toEqual(
      expect.arrayContaining([
        "nombre",
        "apellidos",
        "direccion",
        "correo",
        "password",
        "telefono",
        "acepta",
      ]),
    ));
});
describe("Reserva", () => {
  const route = { cupoMaximo: 12 };
  const data = {
    nombre: "Ana",
    email: "ana@example.cl",
    telefono: "+56912345678",
    fecha: tomorrow(),
    personas: 2,
  };
  it("acepta fecha futura y cantidad dentro del cupo", () =>
    expect(validateReservation(data, route)).toBe(""));
  it("rechaza fecha pasada", () =>
    expect(
      validateReservation({ ...data, fecha: "2000-01-01" }, route),
    ).toMatch(/posterior/));
  it("rechaza fecha inválida", () =>
    expect(validateReservation({ ...data, fecha: "no-fecha" }, route)).toMatch(
      /fecha/,
    ));
  it("rechaza fechas inexistentes aunque Date las normalice", () =>
    expect(
      validateReservation({ ...data, fecha: "2030-02-31" }, route),
    ).toMatch(/fecha/));
  it.each([0, 13, 1.5])("rechaza cantidad %s", (personas) =>
    expect(validateReservation({ ...data, personas }, route)).toMatch(
      /entre 1 y 12/,
    ),
  );
  it("rechaza contactos inválidos", () =>
    expect(validateReservation({ ...data, email: "malo" }, route)).toMatch(
      /contacto/,
    ));
});
