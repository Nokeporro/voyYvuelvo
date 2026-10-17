import Heading from "../atoms/Heading";
import Text from "../atoms/Text";
import Image from "../atoms/Image";
import AppLink from "../atoms/AppLink";
import SectionHeading from "../molecules/SectionHeading";

export default function BlogRecommendations() {
  return (
    <section className="py-5">
      <SectionHeading
        title="Consejos para el camino"
        to="/blogs"
        linkLabel="Ir al blog →"
      />
      <div className="row g-4">
        {[
          ["1", "/img/chaqueta.png", "Tres capas para rutas exigentes"],
          ["2", "/img/mochila.png", "Tu primera ruta de un día"],
        ].map(([id, img, title]) => (
          <div className="col-md-6" key={id}>
            <AppLink className="blog-teaser" to={`/blogs/${id}`}>
              <Image src={img} alt="" loading="lazy" />
              <div>
                <Text as="span" className="eyebrow">
                  Consejos y experiencias
                </Text>
                <Heading as="h3" className="h5">
                  {title}
                </Heading>
                <Text as="span" className="text-link">
                  Leer artículo →
                </Text>
              </div>
            </AppLink>
          </div>
        ))}
      </div>
    </section>
  );
}
