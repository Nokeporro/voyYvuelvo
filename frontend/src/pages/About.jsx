import PageTemplate from "../components/templates/PageTemplate";
import AboutHero from "../components/organisms/AboutHero";
import AboutStory from "../components/organisms/AboutStory";
import AboutValues from "../components/organisms/AboutValues";
import AboutTeam from "../components/organisms/AboutTeam";
export default function About() {
  return (
    <PageTemplate className="">
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutTeam />
    </PageTemplate>
  );
}
