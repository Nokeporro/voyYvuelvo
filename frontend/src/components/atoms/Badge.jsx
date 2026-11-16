export default function Badge({
  children,
  className = "badge rounded-pill text-bg-warning",
  ...props
}) {
  return (
    <span className={className} {...props}>
      {children}
    </span>
  );
}
