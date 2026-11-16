import AppLink from "../atoms/AppLink";
import Badge from "../atoms/Badge";
import Heading from "../atoms/Heading";
import Image from "../atoms/Image";
import Text from "../atoms/Text";

export default function BlogCard({ post }) {
  return (
    <article className="blog-caso" aria-labelledby={`caso-${post.id}`}>
      <div className="blog-caso__media">
        <Image
          src={post.image}
          alt={post.alt}
          loading="lazy"
          width="800"
          height="500"
        />
        <Badge className={`insignia insignia--${post.level}`}>
          {post.badge}
        </Badge>
      </div>
      <div className="blog-caso__texto">
        <Text className="meta">
          Caso curioso #{post.id} · {post.date}
        </Text>
        <Heading id={`caso-${post.id}`}>{post.title}</Heading>
        <Text>{post.description}</Text>
        <AppLink className="btn btn--accion" to={`/blogs/${post.id}`}>
          Ver caso
          <Text as="span" className="sr">
            : {post.title}
          </Text>
        </AppLink>
      </div>
    </article>
  );
}
