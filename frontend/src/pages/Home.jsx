import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../data/routes";
import { useStore } from "../context/Store";
import { RouteCard, ProductCard } from "../components/Cards";
import { tomorrow } from "../utils/validation";
export default function Home() {
  const { products } = useStore();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  return (
    <>
      <section className="hero">
        <img
          className="hero-background"
          src="/img/portada.png"
          alt="Excursionista frente a un lago rodeado de montañas"
          fetchPriority="high"
        />
        <div className="container position-relative py-5">
          <div className="row align-items-center g-5 py-4">
            <div className="col-lg-7 hero-copy">
              <span className="hero-kicker">CHILE, UN PASO A LA VEZ</span>
              <h1>
                Tu aventura
                <br />
                comienza aquí
              </h1>
              <p>
                Descubre Chile, encuentra tu ruta
                <br />y prepara tu equipo.
              </p>
              <Link className="btn btn-warning btn-lg" to="/rutas">
                Explorar rutas →
              </Link>
            </div>
            <div className="col-lg-5 col-xl-4 offset-xl-1">
              <form
                className="search-panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  navigate(`/rutas?${new URLSearchParams(data)}`);
                }}
              >
                <h2 className="h4 mb-4">¿A dónde vamos?</h2>
                <label htmlFor="destino" className="form-label">
                  Destino o región
                </label>
                <input
                  className="form-control mb-3"
                  id="destino"
                  name="destino"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Destino o región"
                  maxLength="100"
                />
                <label className="form-label" htmlFor="fecha">
                  Fecha
                </label>
                <input
                  className="form-control mb-3"
                  id="fecha"
                  name="fecha"
                  type="date"
                  min={tomorrow()}
                  required
                />
                <label className="form-label" htmlFor="personas">
                  Personas
                </label>
                <select
                  className="form-select mb-4"
                  id="personas"
                  name="personas"
                  defaultValue="2"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
                <button className="btn btn-warning w-100">
                  Buscar rutas →
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <div className="container">
        <nav className="category-strip" aria-label="Categorías de aventura">
          {[
            ["montana", "△", "Montaña"],
            ["bosque", "♧", "Bosque"],
            ["lagos", "≈", "Lagos"],
            ["familia", "☀", "Familia"],
          ].map(([key, icon, label]) => (
            <Link key={key} to={`/rutas?categoria=${key}`}>
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <section className="py-5">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Encuentra tu próximo destino</span>
              <h2>Rutas destacadas</h2>
            </div>
            <Link className="text-link" to="/rutas">
              Ver todas las rutas →
            </Link>
          </div>
          <div className="row g-4">
            {routes.map((route) => (
              <div className="col-md-6 col-xl-4" key={route.id}>
                <RouteCard route={route} />
              </div>
            ))}
          </div>
        </section>
        <section className="py-5">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Prepara tu próxima salida</span>
              <h2>Equípate para tu aventura</h2>
              <p>Lleva contigo lo necesario para disfrutar del camino.</p>
            </div>
            <Link className="text-link" to="/productos">
              Ver equipamiento →
            </Link>
          </div>
          <div className="row g-4">
            {products
              .filter((p) => p.destacado)
              .slice(0, 3)
              .map((product) => (
                <div className="col-md-6 col-xl-4" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
          </div>
        </section>
        <section className="welcome-banner p-4 p-md-5 my-4">
          <div>
            <span className="eyebrow">La naturaleza nos reúne</span>
            <h2>
              Ven de donde vengas,
              <br />
              el camino te espera.
            </h2>
            <p>
              Crea tu cuenta con RUT o pasaporte y prepara tu próxima salida.
            </p>
          </div>
          <Link className="btn btn-warning" to="/registro">
            Unirme a la aventura →
          </Link>
        </section>
        <section className="py-5">
          <div className="section-heading">
            <h2>Consejos para el camino</h2>
            <Link to="/blogs" className="text-link">
              Ir al blog →
            </Link>
          </div>
          <div className="row g-4">
            {[
              ["1", "/img/chaqueta.png", "Tres capas para rutas exigentes"],
              ["2", "/img/mochila.png", "Tu primera ruta de un día"],
            ].map(([id, img, title]) => (
              <div className="col-md-6" key={id}>
                <Link className="blog-teaser" to={`/blogs/${id}`}>
                  <img src={img} alt="" loading="lazy" />
                  <div>
                    <span className="eyebrow">Consejos y experiencias</span>
                    <h3 className="h5">{title}</h3>
                    <span className="text-link">Leer artículo →</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
