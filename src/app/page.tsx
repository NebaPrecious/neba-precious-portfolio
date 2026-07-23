import Navbar from "@/components/layout/Navbar";
import MobileAbout from "@/components/mobile/MobileAbout";
import MobileContact from "@/components/mobile/MobileContact";
import MobileCreative from "@/components/mobile/MobileCreative";
import MobileHero from "@/components/mobile/MobileHero";
import MobileProjects from "@/components/mobile/MobileProjects";
import MobileSkills from "@/components/mobile/MobileSkills";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Creative from "@/components/sections/Creative";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import PersonStructuredData from "@/components/seo/PersonStructuredData";

export default function Home() {
  return (
    <>
      <div className="desktop-portfolio">
        <Navbar />

        <main>
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Creative />
          <Contact />
        </main>
      </div>

      return (
  <>
    <PersonStructuredData />

    <div className="desktop-portfolio">
      {/* existing content */}
    </div>

    <div className="mobile-portfolio">
      {/* existing content */}
    </div>
  </>
);

      <div className="mobile-portfolio">
        <Navbar />

        <main>
          <MobileHero />
          <MobileAbout />
          <MobileProjects />
          <MobileSkills />
          <MobileCreative />
          <MobileContact />
        </main>
      </div>
    </>
  );
}