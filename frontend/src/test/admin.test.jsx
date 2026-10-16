import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "../context/Store";
import { getUsers, saveAccount } from "../services/accounts";
import App from "../App";
function show(path, role = "Administrador") {
  sessionStorage.setItem(
    "vv-react-session-v2",
    JSON.stringify({
      id: "demo",
      nombre: "Equipo",
      correo: "demo@example.cl",
      rol: role,
    }),
  );
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </MemoryRouter>,
  );
}
describe("Acceso y permisos en componentes", () => {
  it("inicia sesión de administrador y permite cerrarla", async () => {
    const user = userEvent.setup();
    show("/login", "Cliente");
    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "admin@duoc.cl",
    );
    await user.type(screen.getByLabelText("Contraseña"), "Demo2026!");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(
      await screen.findByRole("heading", { name: "Hola, Administrador" }),
    ).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem("vv-react-session-v2")).rol).toBe(
      "Administrador",
    );
    await user.click(screen.getByRole("button", { name: "Salir" }));
    expect(
      await screen.findByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });
  it("muestra validaciones y rechaza credenciales erróneas", async () => {
    const user = userEvent.setup();
    show("/login");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "no@example.cl",
    );
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("incorrectos");
  });
  it("inicia sesión de cliente registrado y abre las rutas", async () => {
    const data = {
      nombre: "Ana",
      apellidos: "Rojas",
      correo: "ana@example.cl",
      password: "Sendero2026!",
      tipoDocumento: "pasaporte",
      documento: "AB123456",
      paisEmisor: "España",
      direccion: "Hotel",
      telefono: "+56912345678",
    };
    await saveAccount(data);
    const user = userEvent.setup();
    show("/login");
    await user.type(screen.getByLabelText("Correo electrónico"), data.correo);
    await user.type(screen.getByLabelText("Contraseña"), data.password);
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(
      await screen.findByRole("heading", { name: "Encuentra tu próxima ruta" }),
    ).toBeInTheDocument();
  });
  it("bloquea un cliente y limita al vendedor a consultar productos", async () => {
    const user = userEvent.setup();
    show("/admin/productos", "Vendedor");
    expect(
      screen.queryByRole("link", { name: "Nuevo producto" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getAllByRole("link", { name: "Ver detalle" })[0]);
    expect(
      screen.getByRole("heading", { name: "Detalle de producto" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre", { exact: true })).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Guardar producto" }),
    ).not.toBeInTheDocument();
  });
  it("deniega la ruta de administración a un cliente", () => {
    show("/admin", "Cliente");
    expect(
      screen.getByRole("heading", { name: "Acceso restringido" }),
    ).toBeInTheDocument();
  });
  it("redirige al vendedor fuera del mantenedor de usuarios", async () => {
    show("/admin/usuarios", "Vendedor");
    expect(
      await screen.findByRole("heading", { name: "Productos" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Usuarios" }),
    ).not.toBeInTheDocument();
  });
});
describe("Administración integrada con la tienda", () => {
  it("crea un producto, lo edita, consulta el catálogo y lo elimina", async () => {
    const user = userEvent.setup();
    show("/admin/productos");
    await user.click(screen.getByRole("link", { name: "Nuevo producto" }));
    await user.click(screen.getByRole("button", { name: "Guardar producto" }));
    expect(screen.getByText(/código único/)).toBeInTheDocument();
    for (const [label, value] of [
      ["Código", "NEW-001"],
      ["Nombre", "Equipo nuevo"],
      ["Precio CLP", "15990"],
      ["Stock", "5"],
      ["Stock crítico", "2"],
    ])
      await user.type(screen.getByLabelText(label, { exact: true }), value);
    await user.click(screen.getByRole("button", { name: "Guardar producto" }));
    expect(await screen.findByText("Equipo nuevo")).toBeInTheDocument();
    const row = screen.getByText("Equipo nuevo").closest("tr");
    await user.click(within(row).getByRole("link", { name: "Editar" }));
    await user.clear(screen.getByLabelText("Nombre", { exact: true }));
    await user.type(
      screen.getByLabelText("Nombre", { exact: true }),
      "Equipo actualizado",
    );
    await user.click(screen.getByRole("button", { name: "Guardar producto" }));
    expect(await screen.findByText("Equipo actualizado")).toBeInTheDocument();
    await user.click(
      within(
        screen.getByRole("navigation", { name: "Navegación principal" }),
      ).getByRole("link", { name: "Productos", exact: true }),
    );
    await user.type(
      screen.getByLabelText("Buscar productos"),
      "Equipo actualizado",
    );
    expect(
      screen.getByRole("heading", { name: "Equipo actualizado" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Panel", exact: true }));
    await user.click(
      screen
        .getByRole("navigation", { name: "Administración" })
        .querySelector('a[href="/admin/productos"]'),
    );
    await user.click(
      screen.getByRole("button", { name: "Eliminar Equipo actualizado" }),
    );
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByText("Equipo actualizado")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Eliminar Equipo actualizado" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Confirmar eliminación" }),
    );
    expect(screen.queryByText("Equipo actualizado")).not.toBeInTheDocument();
  });
  it("edita una cuenta con pasaporte y permite eliminarla", async () => {
    await saveAccount({
      nombre: "Marie",
      apellidos: "Dupont",
      correo: "marie@example.fr",
      password: "Sendero2026!",
      tipoDocumento: "pasaporte",
      documento: "AB123456",
      paisEmisor: "Francia",
      direccion: "Hotel Santiago",
      telefono: "+33612345678",
    });
    const user = userEvent.setup();
    show("/admin/usuarios");
    await user.click(screen.getByRole("link", { name: "Editar" }));
    await user.clear(screen.getByLabelText("Nombre", { exact: true }));
    await user.type(screen.getByLabelText("Nombre", { exact: true }), "María");
    await user.type(
      screen.getByLabelText("Contraseña", { exact: true }),
      "Nueva2026!",
    );
    await user.type(
      screen.getByLabelText("Confirmar contraseña"),
      "Nueva2026!",
    );
    await user.click(screen.getByLabelText(/Acepto el uso/));
    await user.selectOptions(
      screen.getByLabelText("Rol del usuario"),
      "Vendedor",
    );
    await user.click(screen.getByRole("button", { name: "Guardar usuario" }));
    expect(
      await screen.findByText("Usuario guardado correctamente."),
    ).toBeInTheDocument();
    expect(getUsers()[0]).toMatchObject({
      nombre: "María",
      rol: "Vendedor",
      documento: "AB123456",
    });
    await user.click(screen.getByRole("link", { name: "← Volver al listado" }));
    await user.click(
      screen.getByRole("button", { name: "Eliminar", exact: true }),
    );
    await user.click(
      screen.getByRole("button", { name: "Confirmar eliminación" }),
    );
    expect(
      screen.getByText("Aún no hay cuentas registradas."),
    ).toBeInTheDocument();
  });
});
