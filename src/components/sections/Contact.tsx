import Reveal from "@/components/animations/Reveal";
import { FileText, Mail, MoveUpRight } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/NebaPrecious",
    icon: FaGithub,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/nebaprecious",
    icon: FaLinkedinIn,
  },
  {
    label: "Email",
    href: "mailto:preciousngehneba@gmail.com",
    icon: Mail,
  },
];

export default function Contact() {
  return (
    <section className="section contact-section" id="contact">
      <div className="container">
        <Reveal>
          <p className="section-label">Contact</p>
        </Reveal>

        <div className="contact-content">
          <Reveal delay={0.08}>
            <h2>
              Have an opportunity, project, or idea?{" "}
              <span className="accent-word">Let&apos;s talk.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p>
              I am building my professional brand, developing my skills, and
              connecting with people creating thoughtful digital products.
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="contact-actions">
              <a
                className="button button-primary"
                href="mailto:preciousngehneba@gmail.com"
              >
                <Mail size={18} aria-hidden="true" />
                Send me an email
              </a>

              <a
                className="button button-secondary"
                href="/neba-precious-cv.pdf"
                download
              >
                <FileText size={18} aria-hidden="true" />
                Download my CV
              </a>
            </div>
          </Reveal>

          <div className="social-links" aria-label="Social profiles">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              const isExternal = social.href.startsWith("http");

              return (
                <Reveal
                  key={social.label}
                  delay={0.3 + index * 0.08}
                >
                  <a
                    href={social.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                  >
                    <span className="social-icon">
                      <Icon size={19} aria-hidden="true" />
                    </span>

                    <span>{social.label}</span>

                    <MoveUpRight
                      className="social-arrow"
                      size={16}
                      aria-hidden="true"
                    />
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal delay={0.2}>
          <footer className="footer">
            <p>© {new Date().getFullYear()} Neba Precious Ngeh</p>
            <p>Designed and built with Next.js</p>
          </footer>
        </Reveal>
      </div>
    </section>
  );
}