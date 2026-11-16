import Text from "../atoms/Text";
import AppLink from "../atoms/AppLink";
import MountainIcon from "../atoms/MountainIcon";

export function Brand() {
  return (
    <AppLink to="/" className="brand" aria-label="Voy y Vuelvo, inicio">
      <MountainIcon />
      <Text as="span">
        Voy <b>&amp;</b> Vuelvo
      </Text>
    </AppLink>
  );
}
