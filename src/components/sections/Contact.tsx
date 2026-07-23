
import {
  FileText,
  Mail,
  MoveUpRight,
} from "lucide-react";

import {
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa6";

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
        <p className="section-number">05</p>

        <div className="contact-content">
          <p className="eyebrow">
            Let&apos;s build something meaningful
          </p>

          <h2>
            Have an opportunity, project, or idea?
            <span> Let&apos;s talk.</span>
          </h2>

          <p>
            I am building my professional brand, developing my skills,
            and connecting with people creating thoughtful digital
            products.
          </p>

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
              href="mailto:preciousngehneba@gmail.com?subject=Request%20for%20Neba%20Precious%27%20CV"
            >
              <FileText size={18} aria-hidden="true" />
              Request my CV
            </a>
          </div>

          <div
            className="social-links"
            aria-label="Social profiles"
          >
            {socialLinks.map((social) => {
              const Icon = social.icon;
              const isExternal =
                social.href.startsWith("http");

              return (
                <a
                  href={social.href}
                  key={social.label}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                >
                  <span className="social-icon">
                    <Icon
                      size={19}
                      aria-hidden="true"
                    />
                  </span>

                  <span>{social.label}</span>

                  <MoveUpRight
                    className="social-arrow"
                    size={16}
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </div>
        </div>

        <footer className="footer">
          <p>
            © {new Date().getFullYear()} Neba Precious Ngeh
          </p>

          <p>Designed and built with Next.js</p>
        </footer>
      </div>
    </section>
  );
}