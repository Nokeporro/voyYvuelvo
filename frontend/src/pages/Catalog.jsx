import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "../context/Store";
import { ProductCard, RouteCard } from "../components/Cards";
import { routes } from "../data/routes";
import { money } from "../utils/validation";
const normalized = (text) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
export function Products() {
  const { products } = useStore();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const filtered = products.filter(
    (p) =>
      normalized(`${p.nombre} ${p.categoria}`).includes(normalized(query)) &&
      (!difficulty || p.dificultad === difficulty),
  );
  return (
    <div className="container py-5">
      <span className="eyebrow">Todo para el camino</span>
      <h1>Equipamiento de trekking</h1>
      <p>Encuentra el equipo para tu próxima aventura.</p>
      <div className="row g-3 my-3">
        <div className="col-md-8">
          <label className="form-label" htmlFor="buscar-productos">
            Buscar productos
          </label>
          <input
            id="buscar-productos"
            className="form-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="dificultad">
            Dificultad recomendada
          </label>
          <select
            id="dificultad"
            className="form-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="facil">Fácil</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>
      <p role="status">{filtered.length} productos encontrados</p>
      <div className="row g-4">
        {filtered.map((product) => (
          <div className="col-sm-6 col-xl-4" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {!filtered.length && <p>No encontramos productos con estos filtros.</p>}
    </div>
  );
}
export function ProductDetail() {
  const { id } = useParams();
  const { products, add } = useStore();
  const product = products.find((p) => String(p.id) === id);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  if (!product) return <NotFound />;
  return (
    <div className="container py-5">
      <Link className="text-link" to="/productos">
        ← Volver al catálogo
      </Link>
      <div className="row g-5 mt-2">
        <div className="col-md-6">
          <img
            className="detail-photo"
            src={product.imagen || "/img/mochila.png"}
            alt={product.nombre}
          />
        </div>
        <div className="col-md-6">
          <span className="eyebrow">{product.categoria}</span>
          <h1>{product.nombre}</h1>
          <p>{product.descripcion}</p>
          <p className="h3 my-4">{money(product.precio)}</p>
          <p>Stock disponible: {product.stock} unidades</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                add(product.id, Number(quantity));
                setMessage("Producto agregado al carrito.");
              } catch (e) {
                setMessage(e.message);
              }
            }}
          >
            <label className="form-label" htmlFor="cantidad">
              Cantidad
            </label>
            <input
              className="form-control mb-3 quantity"
              id="cantidad"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <button className="btn btn-warning" disabled={product.stock < 1}>
              {product.stock ? "Agregar al carrito" : "Sin stock"}
            </button>
          </form>
          <p className="mt-3" role="status">
            {message}
          </p>
          <Link to="/carrito" className="text-link">
            Ver carrito →
          </Link>
        </div>
      </div>
    </div>
  );
}
export function RoutesCatalog() {
  const [params, setParams] = useSearchParams();
  const query = params.get("destino") || "";
  const category = params.get("categoria") || "";
  const filtered = routes.filter(
    (r) =>
      normalized(`${r.nombre} ${r.ubicacion}`).includes(normalized(query)) &&
      (!category || r.categorias.includes(category)),
  );
  return (
    <div className="container py-5">
      <span className="eyebrow">Explora Chile paso a paso</span>
      <h1>Encuentra tu próxima ruta</h1>
      <p>Montañas, bosques y lagos. Elige tu experiencia.</p>
      <label className="form-label" htmlFor="buscar-rutas">
        Destino o región
      </label>
      <input
        id="buscar-rutas"
        className="form-control"
        type="search"
        value={query}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          next.set("destino", e.target.value);
          setParams(next, { replace: true });
        }}
      />
      <div className="d-flex flex-wrap gap-2 my-4">
        {[
          ["", "Todas"],
          ["montana", "Montaña"],
          ["bosque", "Bosque"],
          ["lagos", "Lagos"],
          ["familia", "Familia"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`btn ${category === key ? "btn-dark" : "btn-outline-dark"}`}
            aria-pressed={category === key}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set("categoria", key);
              setParams(next);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {params.get("fecha") && (
        <p>
          Salida solicitada: {params.get("fecha")} ·{" "}
          {params.get("personas") || 1} personas. Confirma disponibilidad al
          reservar.
        </p>
      )}
      <p role="status">{filtered.length} rutas encontradas</p>
      <div className="row g-4">
        {filtered.map((route) => (
          <div className="col-md-6 col-xl-4" key={route.id}>
            <RouteCard route={route} />
          </div>
        ))}
      </div>
      {!filtered.length && <p>No encontramos rutas con estos filtros.</p>}
    </div>
  );
}
export function NotFound() {
  return (
    <div className="container py-5">
      <h1>Página no encontrada</h1>
      <p>El contenido solicitado no está disponible.</p>
      <Link className="btn btn-warning" to="/">
        Volver al inicio
      </Link>
    </div>
  );
}
