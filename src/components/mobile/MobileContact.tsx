"use client";

import { motion } from "motion/react";
import {
  ArrowUpRight,
  FileText,
  Mail,
} from "lucide-react";
import {
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa6";

const socialLinks = [
  {
    label: "GitHub",
    description: "Explore my development journey",
    href: "https://github.com/NebaPrecious",
    icon: FaGithub,
    external: true,
  },
  {
    label: "LinkedIn",
    description: "Connect with me professionally",
    href: "https://linkedin.com/in/nebaprecious",
    icon: FaLinkedinIn,
    external: true,
  },
  {
    label: "Email",
    description: "Send me a direct message",
    href: "mailto:preciousngehneba@gmail.com",
    icon: Mail,
    external: false,
  },
];

export default function MobileContact() {
  return (
    <section
      className="mobile-section mobile-contact"
      id="mobile-contact"
    >
      <div className="mobile-container">
        <motion.div
          className="mobile-contact-panel"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.72,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="mobile-contact-kicker">
            Let&apos;s build something meaningful
          </p>

          <h2>
            Have an opportunity, project, or idea?{" "}
            <span className="accent-word">Let&apos;s talk.</span>
          </h2>

          <p className="mobile-contact-description">
            I am building my professional brand, developing my skills, and
            connecting with people creating thoughtful digital products.
          </p>

          <div className="mobile-contact-actions">
            <a
              className="mobile-contact-primary"
              href="mailto:preciousngehneba@gmail.com"
            >
              <Mail size={18} aria-hidden="true" />
              Send me an email
            </a>

            <a
              className="mobile-contact-secondary"
              href="/neba-precious-cv.pdf"
              download
            >
              <FileText size={18} aria-hidden="true" />
              Download my CV
            </a>
          </div>
        </motion.div>

        <div className="mobile-contact-links">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;

            return (
              <motion.a
                href={social.href}
                key={social.label}
                target={social.external ? "_blank" : undefined}
                rel={social.external ? "noreferrer" : undefined}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.07,
                }}
              >
                <span className="mobile-contact-link-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>

                <span className="mobile-contact-link-content">
                  <strong>{social.label}</strong>
                  <small>{social.description}</small>
                </span>

                <ArrowUpRight
                  className="mobile-contact-link-arrow"
                  size={17}
                  aria-hidden="true"
                />
              </motion.a>
            );
          })}
        </div>

        <footer className="mobile-footer">
          <a href="#mobile-home">
            NP<span>.</span>
          </a>

          <div>
            <p>© {new Date().getFullYear()} Neba Precious Ngeh</p>
            <p>Designed and built with Next.js</p>
          </div>
        </footer>
      </div>
    </section>
  );
}