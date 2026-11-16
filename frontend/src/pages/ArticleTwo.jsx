import ArticleTemplate from "../components/templates/ArticleTemplate";
import PageTemplate from "../components/templates/PageTemplate";
import Image from "../components/atoms/Image";
import Heading from "../components/atoms/Heading";
import Text from "../components/atoms/Text";
import AppLink from "../components/atoms/AppLink";
export default function ArticleTwo() {
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
          <li aria-current="page">{"Tu primera ruta de un día"}</li>
        </ol>
      </nav>
      <ArticleTemplate className="articulo">
        <header>
          <Text as="span" className="insignia insignia--facil">
            {"Ruta fácil"}
          </Text>
          <Heading as="h1">
            {"Tu primera ruta de un día: qué llevar en la mochila"}
          </Heading>
          <Text className="meta">
            {"24 de septiembre de 2026 · 3 min de lectura"}
          </Text>
        </header>
        <figure className="articulo__portada">
          <Image
            src="/img/bosque-familia.png"
            alt="Sendero de bosque con luz de la tarde y una persona caminando"
            width="1200"
            height="675"
          />
        </figure>
        <div className="articulo__cuerpo">
          <Text>
            {
              "Las rutas de nivel fácil son la mejor forma de empezar: pocas horas, poco desnivel y senderos bien marcados. Aun así, un buen equipo hace la diferencia entre una salida agradable y una complicada."
            }
          </Text>
          <Heading as="h2">{"Lo esencial"}</Heading>
          <Text>
            {
              "Agua suficiente para todo el recorrido, algo de comer, protector solar y una capa liviana para el viento. Súmale un mapa o la ruta descargada, por si te quedas sin señal."
            }
          </Text>
          <Heading as="h2">{"Calzado cómodo antes que caro"}</Heading>
          <Text>
            {
              "Para un día basta con zapatillas con buena suela y calcetines que no te aprieten. Estrena el calzado unos días antes para evitar ampollas."
            }
          </Text>
          <Heading as="h2">{"Vuelve con luz"}</Heading>
          <Text>
            {
              "Calcula tus horas para regresar antes de que oscurezca. Una linterna frontal pequeña pesa poco y te da margen si el paseo se alarga."
            }
          </Text>
          <Heading as="h2">{"Antes de salir"}</Heading>
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
          <Heading as="h2" id="equipo-2">
            {"Equipo recomendado para este caso"}
          </Heading>
          <ul>
            <li>{"Capa impermeable"}</li>
            <li>{"Linterna frontal recargable"}</li>
            <li>{"Protector solar FPS 50"}</li>
          </ul>
          <AppLink className="btn btn--accion" href="/productos">
            {"Ver productos"}
          </AppLink>
        </aside>
        <div className="articulo__nav">
          <AppLink className="btn btn--borde" href="/blogs">
            {"Volver a Blogs"}
          </AppLink>
          <AppLink className="btn btn--borde" href="/blogs/1">
            {"Caso anterior"}
          </AppLink>
        </div>
      </ArticleTemplate>
    </PageTemplate>
  );
}
