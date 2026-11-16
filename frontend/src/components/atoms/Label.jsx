export default function Label({
  children,
  className = "form-label",
  ...props
}) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}
