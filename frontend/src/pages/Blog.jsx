export default function Blog() {
  return (
    <div className="contenedor">
      <section aria-labelledby="titulo-blog">
        <div className="pagina-titulo">
          <h1 id="titulo-blog">{"Noticias importantes"}</h1>
          <p>{"Datos curiosos y consejos para preparar tu próxima ruta."}</p>
        </div>
        <div className="blog-lista">
          <article className="blog-caso" aria-labelledby="caso-1">
            <div className="blog-caso__media">
              <img
                src="/img/montana-sendero.png"
                alt="Persona con mochila caminando por un sendero de alta montaña con viento"
                loading="lazy"
                width="800"
                height="500"
              />
              <span className="insignia insignia--alta">{"Ruta alta"}</span>
            </div>
            <div className="blog-caso__texto">
              <p className="meta">
                {"Caso curioso #1 · 12 de septiembre de 2026"}
              </p>
              <h2 id="caso-1">
                {
                  "Tres capas para rutas exigentes: cómo vestirte cuando el clima cambia"
                }
              </h2>
              <p>
                {
                  "En la alta montaña puedes pasar del sol al viento helado en minutos. El sistema de tres capas te permite ajustar tu abrigo sin detenerte."
                }
              </p>
              <a className="btn btn--accion" href="/blogs/1">
                {"Ver caso"}
                <span className="sr">
                  {
                    ": Tres capas para rutas exigentes: cómo vestirte cuando el clima cambia"
                  }
                </span>
              </a>
            </div>
          </article>
          <article className="blog-caso" aria-labelledby="caso-2">
            <div className="blog-caso__media">
              <img
                src="/img/bosque-familia.png"
                alt="Sendero de bosque con luz de la tarde y una persona caminando"
                loading="lazy"
                width="800"
                height="500"
              />
              <span className="insignia insignia--facil">{"Ruta fácil"}</span>
            </div>
            <div className="blog-caso__texto">
              <p className="meta">
                {"Caso curioso #2 · 24 de septiembre de 2026"}
              </p>
              <h2 id="caso-2">
                {"Tu primera ruta de un día: qué llevar en la mochila"}
              </h2>
              <p>
                {
                  "No necesitas mucho para una caminata fácil, pero sí lo correcto. Esta lista corta te ayuda a salir con lo justo y volver sin apuros."
                }
              </p>
              <a className="btn btn--accion" href="/blogs/2">
                {"Ver caso"}
                <span className="sr">
                  {": Tu primera ruta de un día: qué llevar en la mochila"}
                </span>
              </a>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
