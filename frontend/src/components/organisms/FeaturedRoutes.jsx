import SectionHeading from "../molecules/SectionHeading";
import CardGrid from "./CardGrid";

import { routes } from "../../data/routes.js";

import { RouteCard } from "../molecules/RouteCard.jsx";

export default function FeaturedRoutes({ routes }) {
  return (
    <section className="py-5">
      <SectionHeading
        title="Rutas destacadas"
        eyebrow="Encuentra tu próximo destino"
        to="/rutas"
        linkLabel="Ver todas las rutas →"
      />
      <CardGrid
        items={routes}
        columnClass="col-md-6 col-xl-4"
        renderItem={(route) => <RouteCard route={route} />}
      />
    </section>
  );
}
