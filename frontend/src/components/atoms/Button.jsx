export default function Button({
  children,
  type = "button",
  className = "btn btn-warning",
  ...props
}) {
  return (
    <button type={type} className={className} {...props}>
      {children}
    </button>
  );
}
