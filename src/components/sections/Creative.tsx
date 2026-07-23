import Reveal from "@/components/animations/Reveal";

const creativeAreas = [
  {
    number: "01",
    title: "Visual design",
    description:
      "Creating flyers with Canva while developing stronger design foundations and learning Adobe Photoshop.",
  },
  {
    number: "02",
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
            <p className="section-number">04</p>
            <h2>Creative growth</h2>
          </div>
        </Reveal>

        <div className="creative-content">
          <Reveal delay={0.1}>
            <p className="large-copy">
              My creative journey supports how I think about digital products,
              communication, and user experience.
            </p>
          </Reveal>

          <div className="creative-cards">
            {creativeAreas.map((area, index) => (
              <Reveal key={area.title} delay={0.15 + index * 0.1}>
                <article>
                  <span>{area.number}</span>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}