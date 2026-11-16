import BlogList from "../components/organisms/BlogList";
import { posts } from "../data/posts";
import PageTemplate from "../components/templates/PageTemplate";

import Text from "../components/atoms/Text";
import Heading from "../components/atoms/Heading";
export default function Blog() {
  return (
    <PageTemplate className="contenedor">
      <section aria-labelledby="titulo-blog">
        <div className="pagina-titulo">
          <Heading as="h1" id="titulo-blog">
            {"Noticias importantes"}
          </Heading>
          <Text>
            {"Datos curiosos y consejos para preparar tu próxima ruta."}
          </Text>
        </div>
        <BlogList posts={posts} />
      </section>
    </PageTemplate>
  );
}
