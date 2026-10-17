// Define el espacio de contenido; las páginas aportan datos y organismos.
export default function PageTemplate({
  children,
  className = "container py-5",
  as: Tag = "div",
}) {
  return <Tag className={className}>{children}</Tag>;
}
