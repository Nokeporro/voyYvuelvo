export default function Select({
  children,
  className = "form-select",
  ...props
}) {
  return (
    <select className={className} {...props}>
      {children}
    </select>
  );
}
