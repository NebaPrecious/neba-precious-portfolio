import Reveal from "@/components/animations/Reveal";

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container section-grid">
        <Reveal>
          <div>
            <p className="section-label">About</p>
            <h2>
              About <span className="accent-word">me</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="about-content">
            <p className="large-copy">
              I am a full-stack developer who enjoys turning ideas into useful,
              user-focused digital products.
            </p>

            <p>
              My experience covers frontend and backend development using tools
              such as Angular, Ionic, React, Node.js, NestJS, PHP, MySQL, and
              PostgreSQL. I have contributed to projects across healthcare,
              mobility, delivery, and personal finance.
            </p>

            <p>
              Alongside software development, I am growing as a designer and
              video editor. I currently create visual designs with Canva,
              study Photoshop, and edit event highlights and teasers with
              CapCut.
            </p>

            <div className="about-details">
              <div>
                <span>Based in</span>
                <strong>Douala, Cameroon</strong>
              </div>

              <div>
                <span>Current focus</span>
                <strong>Building my brand and growing</strong>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}