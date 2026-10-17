export default function ArticleOne() {
  return (
    <div className="contenedor">
      <nav className="migas" aria-label="Ruta de navegación">
        <ol>
          <li>
            <a href="/">{"Home"}</a>
          </li>
          <li>
            <a href="/blogs">{"Blogs"}</a>
          </li>
          <li aria-current="page">
            {"Las tres capas: cómo vestirte para la montaña"}
          </li>
        </ol>
      </nav>
      <article className="articulo">
        <header>
          <span className="insignia insignia--alta">{"Ruta alta"}</span>
          <h1>
            {
              "Tres capas para rutas exigentes: cómo vestirte cuando el clima cambia"
            }
          </h1>
          <p className="meta">
            {"12 de septiembre de 2026 · 4 min de lectura"}
          </p>
        </header>
        <figure className="articulo__portada">
          <img
            src="/img/montana-sendero.png"
            alt="Persona con mochila caminando por un sendero de alta montaña con viento"
            width="1200"
            height="675"
          />
        </figure>
        <div className="articulo__cuerpo">
          <p>
            {
              "En rutas de dificultad alta, el clima manda. Una mañana despejada puede terminar con viento fuerte y lluvia antes del mediodía, y ahí es donde se nota si tu ropa está bien pensada. La solución más usada por quienes caminan a menudo es el sistema de tres capas."
            }
          </p>
          <h2>{"Capa base: mantiene la piel seca"}</h2>
          <p>
            {
              "Va pegada al cuerpo y su trabajo es alejar el sudor. Elige tejidos sintéticos o lana merino; el algodón se moja, tarda en secar y te enfría cuando te detienes."
            }
          </p>
          <h2>{"Capa intermedia: guarda el calor"}</h2>
          <p>
            {
              "Es el abrigo propiamente tal: un polar o una chaqueta liviana rellena. Debe ser fácil de sacar y guardar, porque la vas a usar en las paradas y en las mañanas frías."
            }
          </p>
          <h2>{"Capa exterior: te protege del viento y la lluvia"}</h2>
          <p>
            {
              "Una capa impermeable y cortaviento es la pieza que más se agradece cuando el tiempo se pone difícil. Busca que tenga capucha ajustable y costuras selladas."
            }
          </p>
          <h2>{"Antes de salir"}</h2>
          <ul>
            <li>
              {
                "Ajusta tu abrigo antes de sentir frío: es más fácil mantener el calor que recuperarlo."
              }
            </li>
            <li>
              {"Guarda una muda seca de capa base dentro de una bolsa estanca."}
            </li>
            <li>
              {
                "Revisa el pronóstico la noche anterior y de nuevo antes de salir."
              }
            </li>
          </ul>
        </div>
        <aside className="articulo__equipo" aria-labelledby="equipo-1">
          <h2 id="equipo-1">{"Equipo recomendado para este caso"}</h2>
          <ul>
            <li>{"Capa impermeable"}</li>
            <li>{"Saco de dormir -10 °C"}</li>
            <li>{"Carpa 3 estaciones"}</li>
          </ul>
          <a className="btn btn--accion" href="/productos">
            {"Ver productos"}
          </a>
        </aside>
        <div className="articulo__nav">
          <a className="btn btn--borde" href="/blogs">
            {"Volver a Blogs"}
          </a>
          <a className="btn btn--borde" href="/blogs/2">
            {"Siguiente caso"}
          </a>
        </div>
      </article>
    </div>
  );
}
