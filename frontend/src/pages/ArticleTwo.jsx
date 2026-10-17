export default function ArticleTwo() {
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
          <li aria-current="page">{"Tu primera ruta de un día"}</li>
        </ol>
      </nav>
      <article className="articulo">
        <header>
          <span className="insignia insignia--facil">{"Ruta fácil"}</span>
          <h1>{"Tu primera ruta de un día: qué llevar en la mochila"}</h1>
          <p className="meta">
            {"24 de septiembre de 2026 · 3 min de lectura"}
          </p>
        </header>
        <figure className="articulo__portada">
          <img
            src="/img/bosque-familia.png"
            alt="Sendero de bosque con luz de la tarde y una persona caminando"
            width="1200"
            height="675"
          />
        </figure>
        <div className="articulo__cuerpo">
          <p>
            {
              "Las rutas de nivel fácil son la mejor forma de empezar: pocas horas, poco desnivel y senderos bien marcados. Aun así, un buen equipo hace la diferencia entre una salida agradable y una complicada."
            }
          </p>
          <h2>{"Lo esencial"}</h2>
          <p>
            {
              "Agua suficiente para todo el recorrido, algo de comer, protector solar y una capa liviana para el viento. Súmale un mapa o la ruta descargada, por si te quedas sin señal."
            }
          </p>
          <h2>{"Calzado cómodo antes que caro"}</h2>
          <p>
            {
              "Para un día basta con zapatillas con buena suela y calcetines que no te aprieten. Estrena el calzado unos días antes para evitar ampollas."
            }
          </p>
          <h2>{"Vuelve con luz"}</h2>
          <p>
            {
              "Calcula tus horas para regresar antes de que oscurezca. Una linterna frontal pequeña pesa poco y te da margen si el paseo se alarga."
            }
          </p>
          <h2>{"Antes de salir"}</h2>
          <ul>
            <li>
              {"Avisa a alguien a dónde vas y a qué hora piensas volver."}
            </li>
            <li>
              {
                "Lleva tu basura de vuelta: en la montaña no hay quien la recoja."
              }
            </li>
            <li>
              {"Sal temprano; las tardes suelen traer más viento y más gente."}
            </li>
          </ul>
        </div>
        <aside className="articulo__equipo" aria-labelledby="equipo-2">
          <h2 id="equipo-2">{"Equipo recomendado para este caso"}</h2>
          <ul>
            <li>{"Capa impermeable"}</li>
            <li>{"Linterna frontal recargable"}</li>
            <li>{"Protector solar FPS 50"}</li>
          </ul>
          <a className="btn btn--accion" href="/productos">
            {"Ver productos"}
          </a>
        </aside>
        <div className="articulo__nav">
          <a className="btn btn--borde" href="/blogs">
            {"Volver a Blogs"}
          </a>
          <a className="btn btn--borde" href="/blogs/1">
            {"Caso anterior"}
          </a>
        </div>
      </article>
    </div>
  );
}
