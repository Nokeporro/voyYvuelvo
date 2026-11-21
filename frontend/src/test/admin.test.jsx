import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import App from "../App";
import { StoreProvider, useStore } from "../context/Store";
import { getUsers, saveAccount } from "../services/accounts";
import { loginBackend } from "../services/auth.js";

// ============================================
// 1. CONFIGURACION DE LAS PRUEBAS
// ============================================

// Simular la autenticacion con el backend.
// Estas pruebas no realizan solicitudes reales.
vi.mock("../services/auth.js", () => ({
  loginBackend: vi.fn(),
}));

// Limpiar las simulaciones despues de cada prueba.
afterEach(() => {
  vi.clearAllMocks();
});

// Crear un JWT simulado para las pruebas.
// No es un token real del backend.
function crearTokenPrueba(username, rol) {
  const payload = btoa(
    JSON.stringify({
      sub: username,
      rol,
    })
  );

  return `cabecera.${payload}.firma`;
}

// Mostrar el formulario de inicio de sesion.
function mostrarLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </MemoryRouter>
  );
}

// Preparar una sesion de prueba en Store.jsx.
// No utilizamos el sessionStorage antiguo.
function SesionDePrueba({ rol }) {
  const { session, signIn } = useStore();

  useEffect(() => {
    signIn({
      token: "token-simulado-para-pruebas",
      username: "equipo",
      nombre: "Equipo",
      rol,
    });
  }, []);

  return session ? <App /> : null;
}

// Abrir cualquier pantalla con una sesion simulada.
function show(path, role = "Administrador") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <SesionDePrueba rol={role} />
      </StoreProvider>
    </MemoryRouter>
  );
}

// ============================================
// 2. ACCESO Y PERMISOS
// ============================================

describe("Acceso y permisos en componentes", () => {

  // ------------------------------------------
  // PRUEBA 1: LOGIN ADMINISTRADOR
  // ------------------------------------------

  it("inicia sesion de administrador con JWT y permite cerrarla", async () => {
    const user = userEvent.setup();

    loginBackend.mockResolvedValueOnce(
      crearTokenPrueba("admin_ep3", "ADMINISTRADOR")
    );

    mostrarLogin();

    await user.type(
      screen.getByLabelText("Nombre de usuario"),
      "admin_ep3"
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "ClaveDePrueba123!"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Ingresar",
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: "Hola, admin_ep3",
      })
    ).toBeInTheDocument();

    expect(loginBackend).toHaveBeenCalledWith(
      "admin_ep3",
      "ClaveDePrueba123!"
    );

    // Verificar que no se utilice el sistema antiguo.
    expect(
      sessionStorage.getItem("vv-react-session-v2")
    ).toBeNull();

    // Cerrar sesion.
    await user.click(
      screen.getByRole("button", {
        name: "Salir",
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: "Iniciar sesión",
      })
    ).toBeInTheDocument();
  });

  // ------------------------------------------
  // PRUEBA 2: VALIDACIONES DE LOGIN
  // ------------------------------------------

  it("muestra validaciones y rechaza credenciales incorrectas", async () => {
    const user = userEvent.setup();

    mostrarLogin();

    // Intentar ingresar sin completar los campos.
    await user.click(
      screen.getByRole("button", {
        name: "Ingresar",
      })
    );

    expect(
      screen.getByLabelText("Nombre de usuario")
    ).toHaveAttribute("aria-invalid", "true");

    loginBackend.mockRejectedValueOnce(
      new Error("Usuario o contraseña incorrectos.")
    );

    // Ingresar credenciales incorrectas.
    await user.type(
      screen.getByLabelText("Nombre de usuario"),
      "usuario_incorrecto"
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "Incorrecta123!"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Ingresar",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("alert")
      ).toHaveTextContent("incorrectos");
    });
  });

  // ------------------------------------------
  // PRUEBA 3: LOGIN CLIENTE
  // ------------------------------------------

  it("inicia sesion de cliente con JWT y abre las rutas", async () => {
    const user = userEvent.setup();

    loginBackend.mockResolvedValueOnce(
      crearTokenPrueba("cliente_ep3", "CLIENTE")
    );

    mostrarLogin();

    await user.type(
      screen.getByLabelText("Nombre de usuario"),
      "cliente_ep3"
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "ClaveDePrueba123!"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Ingresar",
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: "Encuentra tu próxima ruta",
      })
    ).toBeInTheDocument();

    expect(loginBackend).toHaveBeenCalledOnce();
  });

  // ------------------------------------------
  // PRUEBA 4: PERMISOS VENDEDOR
  // ------------------------------------------

  it("limita al vendedor a consultar productos", async () => {
    const user = userEvent.setup();

    show("/admin/productos", "Vendedor");

    await screen.findByRole("heading", {
      name: "Productos",
    });

    // El vendedor no puede crear productos.
    expect(
      screen.queryByRole("link", {
        name: "Nuevo producto",
      })
    ).not.toBeInTheDocument();

    // Puede consultar el detalle.
    await user.click(
      screen.getAllByRole("link", {
        name: "Ver detalle",
      })[0]
    );

    expect(
      screen.getByRole("heading", {
        name: "Detalle de producto",
      })
    ).toBeInTheDocument();

    // No puede modificar los campos.
    expect(
      screen.getByLabelText("Nombre", {
        exact: true,
      })
    ).toBeDisabled();

    expect(
      screen.queryByRole("button", {
        name: "Guardar producto",
      })
    ).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // PRUEBA 5: BLOQUEAR CLIENTE
  // ------------------------------------------

  it("deniega la ruta administrativa a un cliente", async () => {
    show("/admin", "Cliente");

    expect(
      await screen.findByRole("heading", {
        name: "Acceso restringido",
      })
    ).toBeInTheDocument();
  });

  // ------------------------------------------
  // PRUEBA 6: RESTRINGIR USUARIOS AL VENDEDOR
  // ------------------------------------------

  it("redirige al vendedor fuera de usuarios", async () => {
    show("/admin/usuarios", "Vendedor");

    expect(
      await screen.findByRole("heading", {
        name: "Productos",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Usuarios",
      })
    ).not.toBeInTheDocument();
  });
});

// ============================================
// 3. ADMINISTRACION INTEGRADA CON LA TIENDA
// ============================================

describe("Administración integrada con la tienda", () => {

  // ------------------------------------------
  // PRUEBA 7: CRUD DE PRODUCTOS
  // ------------------------------------------
  // CAMBIO: esta prueba permite hasta 15 segundos.
  // Las demas mantienen el limite predeterminado.

  it("crea, edita y elimina un producto", async () => {
    const user = userEvent.setup();

    show("/admin/productos");

    // CREAR PRODUCTO
    await user.click(
      await screen.findByRole("link", {
        name: "Nuevo producto",
      })
    );

    // Comprobar validaciones del formulario.
    await user.click(
      screen.getByRole("button", {
        name: "Guardar producto",
      })
    );

    expect(
      screen.getByText(/código único/)
    ).toBeInTheDocument();

    // Completar los campos.
    for (const [label, value] of [
      ["Código", "NEW-001"],
      ["Nombre", "Equipo nuevo"],
      ["Precio CLP", "15990"],
      ["Stock", "5"],
      ["Stock crítico", "2"],
    ]) {
      await user.type(
        screen.getByLabelText(label, {
          exact: true,
        }),
        value
      );
    }

    await user.click(
      screen.getByRole("button", {
        name: "Guardar producto",
      })
    );

    expect(
      await screen.findByText("Equipo nuevo")
    ).toBeInTheDocument();

    // EDITAR PRODUCTO
    const row = screen
      .getByText("Equipo nuevo")
      .closest("tr");

    await user.click(
      within(row).getByRole("link", {
        name: "Editar",
      })
    );

    await user.clear(
      screen.getByLabelText("Nombre", {
        exact: true,
      })
    );

    await user.type(
      screen.getByLabelText("Nombre", {
        exact: true,
      }),
      "Equipo actualizado"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Guardar producto",
      })
    );

    expect(
      await screen.findByText("Equipo actualizado")
    ).toBeInTheDocument();

    // COMPROBAR PRODUCTO EN LA TIENDA
    await user.click(
      within(
        screen.getByRole("navigation", {
          name: "Navegación principal",
        })
      ).getByRole("link", {
        name: "Productos",
        exact: true,
      })
    );

    await user.type(
      screen.getByLabelText("Buscar productos"),
      "Equipo actualizado"
    );

    expect(
      screen.getByRole("heading", {
        name: "Equipo actualizado",
      })
    ).toBeInTheDocument();

    // VOLVER AL PANEL ADMINISTRATIVO
    await user.click(
      screen.getByRole("link", {
        name: "Panel",
        exact: true,
      })
    );

    await user.click(
      screen
        .getByRole("navigation", {
          name: "Administración",
        })
        .querySelector(
          'a[href="/admin/productos"]'
        )
    );

    // CANCELAR ELIMINACION
    await user.click(
      screen.getByRole("button", {
        name: "Eliminar Equipo actualizado",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Cancelar",
      })
    );

    expect(
      screen.getByText("Equipo actualizado")
    ).toBeInTheDocument();

    // CONFIRMAR ELIMINACION
    await user.click(
      screen.getByRole("button", {
        name: "Eliminar Equipo actualizado",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Confirmar eliminación",
      })
    );

    expect(
      screen.queryByText("Equipo actualizado")
    ).not.toBeInTheDocument();

  }, 15000); // Tiempo maximo: 15 segundos.

  // ------------------------------------------
  // PRUEBA 8: ADMINISTRACION DE USUARIOS
  // ------------------------------------------

  it("edita una cuenta de demostracion y permite eliminarla", async () => {
    // Registrar cuenta local de prueba.
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

    // EDITAR USUARIO
    await user.click(
      await screen.findByRole("link", {
        name: "Editar",
      })
    );

    await user.clear(
      screen.getByLabelText("Nombre", {
        exact: true,
      })
    );

    await user.type(
      screen.getByLabelText("Nombre", {
        exact: true,
      }),
      "María"
    );

    await user.type(
      screen.getByLabelText("Contraseña", {
        exact: true,
      }),
      "Nueva2026!"
    );

    await user.type(
      screen.getByLabelText(
        "Confirmar contraseña"
      ),
      "Nueva2026!"
    );

    await user.click(
      screen.getByLabelText(/Acepto el uso/)
    );

    await user.selectOptions(
      screen.getByLabelText("Rol del usuario"),
      "Vendedor"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Guardar usuario",
      })
    );

    expect(
      await screen.findByText(
        "Usuario guardado correctamente."
      )
    ).toBeInTheDocument();

    expect(getUsers()[0]).toMatchObject({
      nombre: "María",
      rol: "Vendedor",
      documento: "AB123456",
    });

    // REGRESAR AL LISTADO
    await user.click(
      screen.getByRole("link", {
        name: "← Volver al listado",
      })
    );

    // ELIMINAR USUARIO
    await user.click(
      screen.getByRole("button", {
        name: "Eliminar",
        exact: true,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Confirmar eliminación",
      })
    );

    expect(
      screen.getByText(
        "Aún no hay cuentas registradas."
      )
    ).toBeInTheDocument();
  });
});
