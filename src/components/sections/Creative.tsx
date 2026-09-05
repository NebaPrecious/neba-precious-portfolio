import Reveal from "@/components/animations/Reveal";
import { ArrowUpRight } from "lucide-react";

const creativeAreas = [
  {
    title: "Visual design",
    description:
      "Creating flyers with Canva while developing stronger design foundations and learning Adobe Photoshop.",
  },
  {
    title: "Video editing",
    description:
      "Editing event highlights, teasers, and general video content using CapCut.",
  },
];

export default function Creative() {
  return (
    <section className="section creative-section" id="creative">
      <div className="container section-grid">
        <Reveal>
          <div>
            <p className="section-label">Creative</p>
            <h2>
              Creative <span className="accent-word">growth</span>
            </h2>
          </div>
        </Reveal>

        <div className="creative-content">
          <Reveal delay={0.1}>
            <p className="large-copy">
              My creative journey supports how I think about digital products,
              communication, and user experience.
            </p>
          </Reveal>

          <div className="creative-list">
            {creativeAreas.map((area, index) => (
              <Reveal key={area.title} delay={0.15 + index * 0.1}>
                <article className="creative-item">
                  <div>
                    <h3>{area.title}</h3>
                    <p>{area.description}</p>
                  </div>

                  <ArrowUpRight
                    className="creative-arrow"
                    size={22}
                    aria-hidden="true"
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
