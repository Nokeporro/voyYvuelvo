import Heading from "../atoms/Heading";
import Text from "../atoms/Text";
import Image from "../atoms/Image";
import AppLink from "../atoms/AppLink";

import { money } from "../../utils/validation.js";
export function RouteCard({ route }) {
  return (
    <article className="adventure-card h-100">
      <AppLink to={`/rutas/${route.id}`}>
        <Image
          className="route-photo"
          src={route.imagen}
          alt={route.nombre}
          loading="lazy"
        />
      </AppLink>
      <div className="p-4">
        <Text className="eyebrow">{route.ubicacion}</Text>
        <Heading as="h3" className="h5">
          <AppLink to={`/rutas/${route.id}`}>{route.nombre}</AppLink>
        </Heading>
        <Text>{route.descripcion}</Text>
        <div className="d-flex flex-wrap gap-3 small mb-3">
          <Text as="span">◷ {route.duracion}</Text>
          <Text as="span" className={`difficulty level-${route.dificultad}`}>
            ▲ {route.dificultad}
          </Text>
        </div>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <strong>
            {money(route.precio)} <Text as="small">/ persona</Text>
          </strong>
          <AppLink className="text-link" to={`/rutas/${route.id}`}>
            Ver y reservar →
          </AppLink>
        </div>
      </div>
    </article>
  );
}
