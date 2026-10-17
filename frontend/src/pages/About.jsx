export default function About() {
  return (
    <div>
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="eyebrow">{"Nuestra historia"}</span>
          <h1>{"La aventura se disfruta más cuando vuelves."}</h1>
          <p>
            {
              "Creemos que cada salida empieza mucho antes del primer paso: con ganas de explorar y el equipo correcto para hacerlo con confianza."
            }
          </p>
          <a className="btn btn-primary btn-large" href="/productos">
            {"Encuentra tu equipo "}
            <span aria-hidden="true">{"→"}</span>
          </a>
        </div>
      </section>
      <section className="section">
        <div className="container story-grid">
          <div>
            <span className="eyebrow">{"Quiénes somos"}</span>
            <h2>{"Hecho para quienes disfrutan el camino."}</h2>
          </div>
          <div className="story-copy">
            <p>
              <strong>{"Voy y Vuelvo"}</strong>
              {
                " es una tienda online de equipamiento para trekking. Reunimos productos para acompañar desde una caminata tranquila hasta una ruta de mayor exigencia."
              }
            </p>
            <p>
              {
                "Organizamos el catálogo según el nivel de dificultad recomendado para ayudarte a comparar y elegir con más claridad. También compartimos consejos e historias para inspirar una próxima salida bien preparada."
              }
            </p>
          </div>
        </div>
      </section>
      <section className="section values-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">{"Lo que nos mueve"}</span>
            <h2>{"Prepararse también es parte de la aventura."}</h2>
          </div>
          <div className="values-grid">
            <article className="value-card">
              <span className="value-icon" aria-hidden="true">
                {"🧭"}
              </span>
              <h3>{"Elegir con confianza"}</h3>
              <p>
                {
                  "Información clara para encontrar equipo que se ajuste al tipo de ruta."
                }
              </p>
            </article>
            <article className="value-card">
              <span className="value-icon" aria-hidden="true">
                {"🥾"}
              </span>
              <h3>{"Disfrutar cada paso"}</h3>
              <p>
                {
                  "Una buena preparación ayuda a vivir el camino con más tranquilidad."
                }
              </p>
            </article>
            <article className="value-card">
              <span className="value-icon" aria-hidden="true">
                {"🌿"}
              </span>
              <h3>{"Explorar con respeto"}</h3>
              <p>
                {
                  "Valoramos los paisajes y la responsabilidad de cuidarlos en cada salida."
                }
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="section team-section">
        <div className="container team-card">
          <div>
            <span className="eyebrow">{"Detrás de Voy y Vuelvo"}</span>
            <h2>{"Un proyecto creado en equipo."}</h2>
            <p>
              {
                "Somos un equipo de estudiantes construyendo una experiencia digital para quienes aman el trekking. Esta tienda es el punto de partida: seguimos trabajando para mejorar cada parte del viaje."
              }
            </p>
          </div>
          <a className="btn btn-primary" href="/contacto">
            {"Hablemos "}
            <span aria-hidden="true">{"→"}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
