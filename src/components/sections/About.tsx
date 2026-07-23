export default function About() {
  return (
    <section className="section" id="about">
      <div className="container section-grid">
        <div>
          <p className="section-number">01</p>
          <h2>About me</h2>
        </div>

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
            video editor. I currently create simple visual designs with Canva,
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
      </div>
    </section>
  );
}