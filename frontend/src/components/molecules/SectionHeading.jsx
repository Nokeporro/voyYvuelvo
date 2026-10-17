import Heading from "../atoms/Heading";
import Text from "../atoms/Text";
import AppLink from "../atoms/AppLink";

export default function SectionHeading({
  title,
  eyebrow,
  description,
  to,
  linkLabel,
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && (
          <Text as="span" className="eyebrow">
            {eyebrow}
          </Text>
        )}
        <Heading>{title}</Heading>
        {description && <Text>{description}</Text>}
      </div>
      {to && (
        <AppLink className="text-link" to={to}>
          {linkLabel}
        </AppLink>
      )}
    </div>
  );
}
