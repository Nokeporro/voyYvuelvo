import ArticleTemplate from "../components/templates/ArticleTemplate";
import PageTemplate from "../components/templates/PageTemplate";
import Image from "../components/atoms/Image";
import Heading from "../components/atoms/Heading";
import Text from "../components/atoms/Text";
import AppLink from "../components/atoms/AppLink";
export default function ArticleOne() {
  return (
    <PageTemplate className="contenedor">
      <nav className="migas" aria-label="Ruta de navegación">
        <ol>
          <li>
            <AppLink href="/">{"Home"}</AppLink>
          </li>
          <li>
            <AppLink href="/blogs">{"Blogs"}</AppLink>
          </li>
          <li aria-current="page">
            {"Las tres capas: cómo vestirte para la montaña"}
          </li>
        </ol>
      </nav>
      <ArticleTemplate className="articulo">
        <header>
          <Text as="span" className="insignia insignia--alta">
            {"Ruta alta"}
          </Text>
          <Heading as="h1">
            {
              "Tres capas para rutas exigentes: cómo vestirte cuando el clima cambia"
            }
          </Heading>
          <Text className="meta">
            {"12 de septiembre de 2026 · 4 min de lectura"}
          </Text>
        </header>
        <figure className="articulo__portada">
          <Image
            src="/img/montana-sendero.png"
            alt="Persona con mochila caminando por un sendero de alta montaña con viento"
            width="1200"
            height="675"
          />
        </figure>
        <div className="articulo__cuerpo">
          <Text>
            {
              "En rutas de dificultad alta, el clima manda. Una mañana despejada puede terminar con viento fuerte y lluvia antes del mediodía, y ahí es donde se nota si tu ropa está bien pensada. La solución más usada por quienes caminan a menudo es el sistema de tres capas."
            }
          </Text>
          <Heading as="h2">{"Capa base: mantiene la piel seca"}</Heading>
          <Text>
            {
              "Va pegada al cuerpo y su trabajo es alejar el sudor. Elige tejidos sintéticos o lana merino; el algodón se moja, tarda en secar y te enfría cuando te detienes."
            }
          </Text>
          <Heading as="h2">{"Capa intermedia: guarda el calor"}</Heading>
          <Text>
            {
              "Es el abrigo propiamente tal: un polar o una chaqueta liviana rellena. Debe ser fácil de sacar y guardar, porque la vas a usar en las paradas y en las mañanas frías."
            }
          </Text>
          <Heading as="h2">
            {"Capa exterior: te protege del viento y la lluvia"}
          </Heading>
          <Text>
            {
              "Una capa impermeable y cortaviento es la pieza que más se agradece cuando el tiempo se pone difícil. Busca que tenga capucha ajustable y costuras selladas."
            }
          </Text>
          <Heading as="h2">{"Antes de salir"}</Heading>
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
          <Heading as="h2" id="equipo-1">
            {"Equipo recomendado para este caso"}
          </Heading>
          <ul>
            <li>{"Capa impermeable"}</li>
            <li>{"Saco de dormir -10 °C"}</li>
            <li>{"Carpa 3 estaciones"}</li>
          </ul>
          <AppLink className="btn btn--accion" href="/productos">
            {"Ver productos"}
          </AppLink>
        </aside>
        <div className="articulo__nav">
          <AppLink className="btn btn--borde" href="/blogs">
            {"Volver a Blogs"}
          </AppLink>
          <AppLink className="btn btn--borde" href="/blogs/2">
            {"Siguiente caso"}
          </AppLink>
        </div>
      </ArticleTemplate>
    </PageTemplate>
  );
}
