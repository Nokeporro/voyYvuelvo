import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "../context/Store";
import App from "../App";
const show = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </MemoryRouter>,
  );
describe("Contenido editorial y buscador", () => {
  it.each([
    ["/nosotros", "La aventura se disfruta más cuando vuelves."],
    ["/blogs", "Noticias importantes"],
    [
      "/blogs/1",
      "Tres capas para rutas exigentes: cómo vestirte cuando el clima cambia",
    ],
    ["/blogs/2", "Tu primera ruta de un día: qué llevar en la mochila"],
  ])("conserva contenido de %s", (path, title) => {
    show(path);
    expect(
      screen.getByRole("heading", { name: title, level: 1 }),
    ).toBeInTheDocument();
  });
  it("busca destinos desde el formulario de inicio", async () => {
    const user = userEvent.setup();
    show("/");
    await user.type(screen.getByLabelText("Destino o región"), "Torres");
    await user.type(screen.getByLabelText("Fecha"), "2027-06-01");
    await user.click(screen.getByRole("button", { name: "Buscar rutas →" }));
    expect(
      screen.getByRole("heading", { name: "Encuentra tu próxima ruta" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 rutas");
    expect(screen.getByText(/2027-06-01/)).toBeInTheDocument();
  });
});
