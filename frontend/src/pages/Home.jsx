import PageTemplate from "../components/templates/PageTemplate";
import Text from "../components/atoms/Text";
import AppLink from "../components/atoms/AppLink";
import HomeHero from "../components/organisms/HomeHero.jsx";
import FeaturedRoutes from "../components/organisms/FeaturedRoutes.jsx";
import FeaturedProducts from "../components/organisms/FeaturedProducts.jsx";
import AdventureInvite from "../components/organisms/AdventureInvite.jsx";
import BlogRecommendations from "../components/organisms/BlogRecommendations.jsx";

import { useNavigate } from "react-router-dom";
import { routes } from "../data/routes.js";
import { useStore } from "../context/Store.jsx";

export default function Home() {
  const { products } = useStore();

  const navigate = useNavigate();
  return (
    <PageTemplate className="">
      <HomeHero onSearch={(search) => navigate(`/rutas?${search}`)} />
      <div className="container">
        <nav className="category-strip" aria-label="Categorías de aventura">
          {[
            ["montana", "△", "Montaña"],
            ["bosque", "♧", "Bosque"],
            ["lagos", "≈", "Lagos"],
            ["familia", "☀", "Familia"],
          ].map(([key, icon, label]) => (
            <AppLink key={key} to={`/rutas?categoria=${key}`}>
              <Text as="span" aria-hidden="true">
                {icon}
              </Text>
              {label}
            </AppLink>
          ))}
        </nav>
        <FeaturedRoutes routes={routes} />
        <FeaturedProducts products={products} />
        <AdventureInvite />
        <BlogRecommendations />
      </div>
    </PageTemplate>
  );
}
