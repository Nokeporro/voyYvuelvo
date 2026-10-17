import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { StoreProvider } from "../context/Store";
import { RegistrationForm } from "../components/organisms/RegistrationForm.jsx";
import { Products } from "../pages/Products.jsx";
import { ProductDetail } from "../pages/ProductDetail.jsx";
import { RoutesCatalog } from "../pages/RoutesCatalog.jsx";
import Cart from "../pages/Cart";
import Contact from "../pages/Contact";
import Reservation from "../pages/Reservation";
import App from "../App";
import { tomorrow } from "../utils/validation";
function show(element, path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>{element}</StoreProvider>
    </MemoryRouter>,
  );
}
async function fillPassport(user) {
  await user.selectOptions(
    screen.getByLabelText("Tipo de documento"),
    "pasaporte",
  );
  for (const [label, value] of [
    ["Número de pasaporte", "AB1234567"],
    ["País emisor del pasaporte", "Francia"],
    ["Nombre", "Marie"],
    ["Apellidos", "Dupont"],
    ["Correo electrónico", "marie@example.fr"],
    ["Contraseña", "Sendero2026!"],
    ["Confirmar contraseña", "Sendero2026!"],
    ["Teléfono de contacto", "+33612345678"],
    ["Domicilio o alojamiento en Chile", "Hotel Santiago 123"],
  ]) {
    await user.click(screen.getByLabelText(label, { exact: true }));
    await user.paste(value);
  }
  await user.click(screen.getByLabelText(/Acepto el uso/));
}
describe("Componentes de registro", () => {
  it("cambia RUT por pasaporte y muestra país emisor", async () => {
    const user = userEvent.setup();
    show(<RegistrationForm />);
    expect(screen.getByLabelText("RUT")).toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText("Tipo de documento"),
      "pasaporte",
    );
    expect(screen.getByLabelText("Número de pasaporte")).toBeInTheDocument();
    expect(screen.queryByLabelText("RUT")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Región")).not.toBeInTheDocument();
  });
  it("bloquea envío vacío, marca errores accesibles y enfoca primer campo", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    show(<RegistrationForm onSave={onSave} />);
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nombre", { exact: true })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Nombre", { exact: true })).toHaveFocus();
  });
  it("envía datos de un visitante extranjero y muestra confirmación", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({});
    show(<RegistrationForm onSave={onSave} />);
    await fillPassport(user);
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoDocumento: "pasaporte",
          paisEmisor: "Francia",
          documento: "AB1234567",
        }),
      ),
    );
    expect(
      await screen.findByText(/Tu cuenta está creada/),
    ).toBeInTheDocument();
  });
  it("muestra errores de persistencia sin anunciar éxito", async () => {
    const user = userEvent.setup();
    show(
      <RegistrationForm
        onSave={vi.fn().mockRejectedValue(Error("Sin espacio disponible"))}
      />,
    );
    await fillPassport(user);
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(
      await screen.findByText("Sin espacio disponible"),
    ).toBeInTheDocument();
  });
  it("limpia comuna al cambiar de región", async () => {
    const user = userEvent.setup();
    show(<RegistrationForm />);
    await user.selectOptions(
      screen.getByLabelText("Región"),
      "Metropolitana de Santiago",
    );
    await user.selectOptions(screen.getByLabelText("Comuna"), "Santiago");
    await user.selectOptions(screen.getByLabelText("Región"), "Valparaíso");
    expect(screen.getByLabelText("Comuna")).toHaveValue("");
    expect(
      screen.queryByRole("option", { name: "Santiago" }),
    ).not.toBeInTheDocument();
  });
});
describe("Catálogo, filtros y carrito en el DOM", () => {
  it("filtra productos por texto y dificultad", async () => {
    const user = userEvent.setup();
    show(<Products />);
    await user.type(screen.getByLabelText("Buscar productos"), "mochila");
    expect(
      screen.getByRole("heading", { name: "Mochila Trekking" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Carpa de Montaña" }),
    ).not.toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText("Dificultad recomendada"),
      "alta",
    );
    expect(screen.getByRole("status")).toHaveTextContent("0 productos");
  });
  it("filtra rutas por categoría y destino", async () => {
    const user = userEvent.setup();
    show(<RoutesCatalog />);
    await user.click(screen.getByRole("button", { name: "Bosque" }));
    expect(screen.getByRole("status")).toHaveTextContent("1 rutas");
    expect(
      screen.getByRole("heading", { name: "Sendero Los Lirios" }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Destino o región"), "no existe");
    expect(screen.getByRole("status")).toHaveTextContent("0 rutas");
  });
  it("agrega un producto, modifica cantidad, aplica cupón y elimina", async () => {
    const user = userEvent.setup();
    show(
      <Routes>
        <Route path="/productos/:id" element={<ProductDetail />} />
        <Route path="/carrito" element={<Cart />} />
      </Routes>,
      "/productos/1",
    );
    await user.click(
      screen.getByRole("button", { name: "Agregar al carrito" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Producto agregado");
    await user.click(screen.getByRole("link", { name: "Ver carrito →" }));
    expect(
      screen.getByRole("heading", { name: "Tu carrito" }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText("Cupón de descuento"), "AVENTURA10");
    await user.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(screen.getByRole("status")).toHaveTextContent("10%");
    expect(JSON.parse(localStorage.getItem("voy-vuelvo-carrito-v1"))).toEqual([
      { id: 1, cantidad: 1 },
    ]);
    await user.click(
      screen.getByRole("button", { name: "Eliminar Mochila Trekking" }),
    );
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });
  it("rechaza stock excedido en ficha", async () => {
    const user = userEvent.setup();
    show(
      <Routes>
        <Route path="/productos/:id" element={<ProductDetail />} />
      </Routes>,
      "/productos/1",
    );
    await user.click(
      screen.getByRole("button", { name: "Agregar al carrito" }),
    );
    await user.clear(screen.getByLabelText("Cantidad"));
    await user.type(screen.getByLabelText("Cantidad"), "10");
    await user.click(
      screen.getByRole("button", { name: "Agregar al carrito" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/stock/);
  });
});
describe("Navegación, contacto y reservas", () => {
  it("mantiene el enlace HTML antiguo al registro", async () => {
    show(<App />, "/registro.html");
    expect(
      await screen.findByRole("heading", { name: "Crea tu cuenta" }),
    ).toBeInTheDocument();
  });
  it("abre y cierra el menú móvil mediante estado", async () => {
    const user = userEvent.setup();
    show(<App />);
    const menu = screen.getByRole("button", { name: "Abrir menú" });
    expect(menu).toHaveAttribute("aria-expanded", "false");
    await user.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
  });
  it("redirige un visitante del panel a login", async () => {
    show(<App />, "/admin");
    expect(
      await screen.findByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });
  it("muestra página no encontrada para un producto inexistente", () => {
    show(<App />, "/productos/999");
    expect(
      screen.getByRole("heading", { name: "Página no encontrada" }),
    ).toBeInTheDocument();
  });
  it("bloquea contacto vacío y guarda solo una simulación válida", async () => {
    const user = userEvent.setup();
    show(<Contact />);
    await user.click(screen.getByRole("button", { name: /Guardar mensaje/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Revisa");
    await user.type(screen.getByLabelText("Nombre completo"), "Ana");
    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "ana@example.cl",
    );
    await user.type(
      screen.getByLabelText("¿Cómo podemos ayudarte?"),
      "Quiero conocer las rutas.",
    );
    await user.click(screen.getByRole("button", { name: /Guardar mensaje/ }));
    expect(screen.getByRole("status")).toHaveTextContent("No se ha enviado");
    expect(JSON.parse(localStorage.getItem("vv-react-messages"))).toHaveLength(
      1,
    );
  });
  it("calcula arriendo y guarda borrador sin fingir confirmación", async () => {
    const user = userEvent.setup();
    show(
      <Routes>
        <Route path="/rutas/:id" element={<Reservation />} />
      </Routes>,
      "/rutas/1",
    );
    await user.click(screen.getByLabelText("Arrendar Bastones de Trekking"));
    for (const [label, value] of [
      ["Nombre completo", "Ana"],
      ["Correo electrónico", "ana@example.org"],
      ["Teléfono", "+56912345678"],
    ])
      await user.type(screen.getByLabelText(label), value);
    await user.type(screen.getByLabelText("Fecha de salida"), tomorrow());
    await user.click(
      screen.getByRole("button", { name: "Guardar borrador de reserva" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Aún no existe una reserva confirmada",
    );
    const draft = JSON.parse(
      localStorage.getItem("voy-vuelvo-reserva-borrador"),
    );
    expect(draft.total).toBe(215000);
    expect(draft.equipamientos).toHaveLength(1);
  });
});
