import Image from "next/image";
import Reveal from "@/components/animations/Reveal";
import JangoraShowcase from "@/components/projects/JangoraShowcase";
import {
  ArrowUpRight,
  LockKeyhole,
} from "lucide-react";

export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="container">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="section-number">02</p>
              <h2>Selected projects</h2>
            </div>

            <p>
              Products I have contributed to or am currently developing.
            </p>
          </div>
        </Reveal>

        <div className="desktop-project-grid">
          <Reveal>
            <article className="featured-project">
              <div className="featured-project-visual">
                <JangoraShowcase />
              </div>

              <div className="featured-project-content">
                <div className="project-meta">
                  <span>Personal Finance</span>

                  <span className="project-status">
                    In development
                  </span>
                </div>

                <h3>Jangora</h3>

                <p>
                  An AI-assisted personal finance application designed to help
                  users track expenses, build better saving habits, work toward
                  financial goals, and develop greater financial discipline.
                </p>

                <div className="tag-list">
                  <span className="tag">Ionic Angular</span>
                  <span className="tag">NestJS</span>
                  <span className="tag">TypeScript</span>
                  <span className="tag">PostgreSQL</span>
                  <span className="tag">Artificial Intelligence</span>
                </div>

                <div className="project-actions">
                  <a
                    className="project-primary-link"
                    href="https://github.com/NebaPrecious"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View my GitHub
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </a>

                  <a
                    className="project-secondary-link"
                    href="#contact"
                  >
                    Discuss Jangora
                  </a>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.1}>
            <article className="company-project-card">
              <div className="company-project-visual">
                <div className="company-project-preview">
                  <Image
                    src="/projects/pharmacompare/pharmacompare-splash.png"
                    alt="Approved PharmaCompare splash screen preview"
                    fill
                    sizes="(max-width: 900px) 80vw, 32vw"
                    className="company-project-preview-image"
                  />

                  <div className="company-project-preview-overlay">
                    <span>Limited public preview</span>
                    <strong>PharmaCompare</strong>
                  </div>
                </div>

                <div className="company-project-security">
                  <LockKeyhole size={15} aria-hidden="true" />
                  Company-owned project
                </div>
              </div>

              <div className="company-project-content">
                <div className="project-meta">
                  <span>Digital Healthcare</span>

                  <span className="project-status">
                    Team project
                  </span>
                </div>

                <h3>PharmaCompare</h3>

                <p>
                  Contributed as part of a team to the backend
                  development of PharmaCompare, a company-owned digital
                  healthcare platform designed to help people access medical
                  services from home and receive faster support during urgent
                  situations.
                </p>

                <p className="company-project-note">
                  Only an approved splash-screen preview is displayed. The
                  complete product, repository, internal interfaces, and
                  implementation details remain private because the platform
                  belongs to the company and is still under development.
                </p>

                <div className="tag-list">
                  <span className="tag">Angular</span>
                  <span className="tag">Ionic</span>
                  <span className="tag">Node.js</span>
                  <span className="tag">MySQL</span>
                  <span className="tag">REST APIs</span>
                </div>

                <a
                  className="project-secondary-link company-project-link"
                  href="#contact"
                >
                  Project details on request
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}