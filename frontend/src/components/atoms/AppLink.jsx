import { Link } from "react-router-dom";

export default function AppLink({ to, href, children, ...props }) {
  const destination = to ?? href;
  if (
    to !== undefined ||
    (typeof href === "string" && href.startsWith("/") && !href.startsWith("//"))
  ) {
    return (
      <Link to={destination} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
