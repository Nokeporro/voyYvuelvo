import { useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useStore } from "../context/Store";
import { deleteAccount, getUsers, saveAccount } from "../services/accounts";
import { RegistrationForm, emptyRegistration } from "./Register";
import Field from "../components/Field";
import { money } from "../utils/validation";
import { NotFound } from "./Catalog";
export function AdminLayout() {
  const { session } = useStore();
  if (!session) return <Navigate to="/login" replace />;
  if (!["Administrador", "Vendedor"].includes(session.rol))
    return (
      <div className="container py-5">
        <h1>Acceso restringido</h1>
        <p>Este panel está disponible para personal autorizado.</p>
      </div>
    );
  return (
    <div className="container py-5">
      <span className="eyebrow">Panel de {session.rol}</span>
      <nav
        className="d-flex flex-wrap gap-3 py-3 mb-4 border-bottom"
        aria-label="Administración"
      >
        <NavLink to="/admin" end>
          Resumen
        </NavLink>
        <NavLink to="/admin/productos">Productos</NavLink>
        {session.rol === "Administrador" && (
          <NavLink to="/admin/usuarios">Usuarios</NavLink>
        )}
      </nav>
      <Outlet />
    </div>
  );
}
export function Dashboard() {
  const { products, session } = useStore();
  return (
    <>
      <h1>Hola, {session.nombre}</h1>
      <p>Gestiona el equipamiento y las cuentas de Voy &amp; Vuelvo.</p>
      <div className="row g-4 mt-2">
        {[
          [products.length, "Productos en catálogo"],
          [
            products.filter((p) => p.stock <= p.stockCritico).length,
            "Con stock crítico",
          ],
          ...(session.rol === "Administrador"
            ? [[getUsers().length, "Cuentas registradas"]]
            : []),
        ].map(([n, label]) => (
          <div className="col-md-4" key={label}>
            <div className="form-panel">
              <strong className="display-5">{n}</strong>
              <p className="mb-0">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="demo-note mt-4">
        Panel académico con datos guardados en este navegador.
      </p>
    </>
  );
}
export function AdminProducts() {
  const { products, saveProducts, session } = useStore();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(null);
  const isAdmin = session.rol === "Administrador";
  function remove() {
    try {
      saveProducts(products.filter((p) => p.id !== pending.id));
      setMessage("Producto eliminado.");
      setPending(null);
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <>
      <div className="section-heading">
        <h1>Productos</h1>
        {isAdmin && (
          <Link className="btn btn-warning" to="/admin/productos/nuevo">
            Nuevo producto
          </Link>
        )}
      </div>
      <label className="form-label" htmlFor="buscar-admin-producto">
        Buscar por nombre o código
      </label>
      <input
        className="form-control mb-4"
        id="buscar-admin-producto"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p role="status">{message}</p>
      {pending && (
        <div className="alert alert-warning" role="alert">
          ¿Eliminar {pending.nombre}?{" "}
          <button className="btn btn-danger btn-sm ms-2" onClick={remove}>
            Confirmar eliminación
          </button>
          <button
            className="btn btn-outline-dark btn-sm ms-2"
            onClick={() => setPending(null)}
          >
            Cancelar
          </button>
        </div>
      )}
      <div className="table-responsive">
        <table className="table align-middle">
          <caption>Catálogo compartido con la tienda</caption>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter((p) =>
                `${p.nombre} ${p.codigo}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((p) => (
                <tr key={p.id}>
                  <td>{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td>{money(p.precio)}</td>
                  <td>
                    {p.stock}
                    {p.stock <= p.stockCritico && (
                      <span className="badge text-bg-warning ms-2">
                        Crítico
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      className="btn btn-outline-dark btn-sm"
                      to={`/admin/productos/${p.id}`}
                    >
                      {isAdmin ? "Editar" : "Ver detalle"}
                    </Link>
                    {isAdmin && (
                      <button
                        className="btn btn-outline-danger btn-sm ms-2"
                        onClick={() => setPending(p)}
                      >
                        Eliminar {p.nombre}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function ProductEditor() {
  const { id } = useParams();
  const { products, saveProducts, session } = useStore();
  const navigate = useNavigate();
  const original = products.find((p) => String(p.id) === id);
  const readonly = session.rol !== "Administrador";
  const [data, setData] = useState(
    original || {
      codigo: "",
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      stockCritico: "",
      categoria: "Accesorios",
      dificultad: "facil",
      imagen: "/img/mochila.png",
      destacado: false,
    },
  );
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  if (id && !original) return <NotFound />;
  if (!id && readonly) return <Navigate to="/admin/productos" replace />;
  function submit(e) {
    e.preventDefault();
    if (readonly) return;
    const invalid = {};
    if (
      data.codigo.trim().length < 3 ||
      products.some(
        (p) =>
          p.id !== original?.id &&
          p.codigo.toLowerCase() === data.codigo.trim().toLowerCase(),
      )
    )
      invalid.codigo = "Usa un código único de al menos 3 caracteres.";
    if (!data.nombre.trim() || data.nombre.length > 100)
      invalid.nombre = "Ingresa un nombre de hasta 100 caracteres.";
    if (data.descripcion.length > 500)
      invalid.descripcion = "Máximo 500 caracteres.";
    for (const field of ["precio", "stock", "stockCritico"])
      if (
        String(data[field]).trim() === "" ||
        !Number.isSafeInteger(Number(data[field])) ||
        Number(data[field]) < 0
      )
        invalid[field] = "Ingresa un número entero igual o mayor que cero.";
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    const next = {
      ...data,
      id: original?.id || Math.max(0, ...products.map((p) => Number(p.id))) + 1,
      codigo: data.codigo.trim(),
      nombre: data.nombre.trim(),
      precio: Number(data.precio),
      stock: Number(data.stock),
      stockCritico: Number(data.stockCritico),
    };
    try {
      saveProducts([...products.filter((p) => p.id !== original?.id), next]);
      navigate("/admin/productos");
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <>
      <h1>
        {readonly
          ? "Detalle de producto"
          : original
            ? "Editar producto"
            : "Nuevo producto"}
      </h1>
      <div className="form-panel">
        <form noValidate onSubmit={submit}>
          <fieldset disabled={readonly}>
            <div className="row g-3">
              {[
                ["codigo", "Código", {}],
                ["nombre", "Nombre", { maxLength: 100 }],
                ["precio", "Precio CLP", { type: "number", min: 0 }],
                ["stock", "Stock", { type: "number", min: 0 }],
                ["stockCritico", "Stock crítico", { type: "number", min: 0 }],
              ].map(([name, label, props]) => (
                <div className="col-md-6" key={name}>
                  <Field
                    name={name}
                    label={label}
                    value={data[name]}
                    onChange={(e) =>
                      setData({ ...data, [name]: e.target.value })
                    }
                    error={errors[name]}
                    {...props}
                  />
                </div>
              ))}
            </div>
            <Field
              name="descripcion"
              label="Descripción"
              as="textarea"
              rows={3}
              maxLength={500}
              value={data.descripcion}
              onChange={(e) =>
                setData({ ...data, descripcion: e.target.value })
              }
              error={errors.descripcion}
            />
            <Field
              name="categoria"
              label="Categoría"
              value={data.categoria}
              onChange={(e) => setData({ ...data, categoria: e.target.value })}
            >
              {[
                "Mochilas",
                "Camping",
                "Accesorios",
                "Vestuario",
                "Calzado",
                "Iluminación",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </Field>
            <Field
              name="dificultad"
              label="Dificultad"
              value={data.dificultad}
              onChange={(e) => setData({ ...data, dificultad: e.target.value })}
            >
              <option value="facil">Fácil</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </Field>
            <Field
              name="imagen"
              label="Imagen del catálogo"
              value={data.imagen}
              onChange={(e) => setData({ ...data, imagen: e.target.value })}
            >
              {[
                "mochila",
                "carpa",
                "bastones",
                "chaqueta",
                "botas",
                "saco-dormir",
                "linterna",
              ].map((img) => (
                <option value={`/img/${img}.png`} key={img}>
                  {img}
                </option>
              ))}
            </Field>
            <label className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={data.destacado}
                onChange={(e) =>
                  setData({ ...data, destacado: e.target.checked })
                }
              />
              Destacar en inicio
            </label>
            {!readonly && (
              <button className="btn btn-warning">Guardar producto</button>
            )}
          </fieldset>
          <p role="alert">{message}</p>
        </form>
        <Link to="/admin/productos" className="text-link d-inline-block mt-3">
          ← Volver al listado
        </Link>
      </div>
    </>
  );
}
export function AdminUsers() {
  const { session } = useStore();
  const [users, setUsers] = useState(getUsers);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState("");
  if (session.rol !== "Administrador")
    return <Navigate to="/admin/productos" replace />;
  return (
    <>
      <div className="section-heading">
        <h1>Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="btn btn-warning">
          Nuevo usuario
        </Link>
      </div>
      <label htmlFor="buscar-usuario" className="form-label">
        Buscar usuario
      </label>
      <input
        id="buscar-usuario"
        className="form-control mb-4"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p role="status">{message}</p>
      {pending && (
        <div className="alert alert-warning">
          ¿Eliminar la cuenta de {pending.nombre}?{" "}
          <button
            className="btn btn-danger btn-sm ms-2"
            onClick={() => {
              try {
                deleteAccount(pending.id);
                setUsers(getUsers());
                setPending(null);
                setMessage("Cuenta eliminada.");
              } catch (e) {
                setMessage(e.message);
              }
            }}
          >
            Confirmar eliminación
          </button>
          <button
            className="btn btn-outline-dark btn-sm ms-2"
            onClick={() => setPending(null)}
          >
            Cancelar
          </button>
        </div>
      )}
      <div className="table-responsive">
        <table className="table">
          <caption>Cuentas locales de demostración</caption>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Documento</th>
              <th>País emisor</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((u) =>
                `${u.nombre} ${u.correo} ${u.documento}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.nombre} {u.apellidos}
                  </td>
                  <td>{u.correo}</td>
                  <td>
                    {u.tipoDocumento}: {u.documento}
                  </td>
                  <td>{u.paisEmisor}</td>
                  <td>{u.rol}</td>
                  <td>
                    <Link
                      to={`/admin/usuarios/${u.id}`}
                      className="btn btn-outline-dark btn-sm"
                    >
                      Editar
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm ms-2"
                      onClick={() => setPending(u)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!users.length && <p>Aún no hay cuentas registradas.</p>}
    </>
  );
}
export function UserEditor() {
  const { session } = useStore();
  const { id } = useParams();
  const original = getUsers().find((u) => u.id === id);
  const [role, setRole] = useState(original?.rol || "Cliente");
  if (session.rol !== "Administrador")
    return <Navigate to="/admin/productos" replace />;
  if (id && !original) return <NotFound />;
  return (
    <>
      <h1>{original ? "Editar usuario" : "Nuevo usuario"}</h1>
      <div className="form-panel">
        <Field
          name="rol"
          label="Rol del usuario"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {["Cliente", "Vendedor", "Administrador"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Field>
        <RegistrationForm
          key={id || "new"}
          initial={{ ...emptyRegistration, ...original }}
          admin
          onSave={(data) => saveAccount(data, original?.id, role)}
        />
        <Link className="text-link d-inline-block mt-3" to="/admin/usuarios">
          ← Volver al listado
        </Link>
      </div>
    </>
  );
}
