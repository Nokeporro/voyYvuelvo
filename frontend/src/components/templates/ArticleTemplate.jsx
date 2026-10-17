export default function ArticleTemplate({
  children,
  className = "articulo",
  ...props
}) {
  return (
    <article className={className} {...props}>
      {children}
    </article>
  );
}
