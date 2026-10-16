import { Link } from "react-router-dom";
import { money } from "../utils/validation";
export function RouteCard({ route }) {
  return (
    <article className="adventure-card h-100">
      <Link to={`/rutas/${route.id}`}>
        <img
          className="route-photo"
          src={route.imagen}
          alt={route.nombre}
          loading="lazy"
        />
      </Link>
      <div className="p-4">
        <p className="eyebrow">{route.ubicacion}</p>
        <h3 className="h5">
          <Link to={`/rutas/${route.id}`}>{route.nombre}</Link>
        </h3>
        <p>{route.descripcion}</p>
        <div className="d-flex flex-wrap gap-3 small mb-3">
          <span>◷ {route.duracion}</span>
          <span className={`difficulty level-${route.dificultad}`}>
            ▲ {route.dificultad}
          </span>
        </div>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <strong>
            {money(route.precio)} <small>/ persona</small>
          </strong>
          <Link className="text-link" to={`/rutas/${route.id}`}>
            Ver y reservar →
          </Link>
        </div>
      </div>
    </article>
  );
}
export function ProductCard({ product }) {
  return (
    <article className="adventure-card h-100">
      <Link to={`/productos/${product.id}`}>
        <img
          className="product-photo"
          src={product.imagen || "/img/mochila.png"}
          alt={product.nombre}
          loading="lazy"
        />
      </Link>
      <div className="p-4">
        <span className="eyebrow">{product.categoria}</span>
        <h3 className="h5 mt-2">
          <Link to={`/productos/${product.id}`}>{product.nombre}</Link>
        </h3>
        <p>{product.descripcion}</p>
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <strong>{money(product.precio)}</strong>
          <Link
            className="btn btn-outline-dark btn-sm"
            to={`/productos/${product.id}`}
          >
            Ver producto →
          </Link>
        </div>
      </div>
    </article>
  );
}
