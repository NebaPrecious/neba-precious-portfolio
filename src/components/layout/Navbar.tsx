"use client";

import {
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import {
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";
import {
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa6";

const navigationLinks = [
  {
    label: "About",
    desktopHref: "#about",
    mobileHref: "#mobile-about",
    number: "01",
  },
  {
    label: "Projects",
    desktopHref: "#projects",
    mobileHref: "#mobile-projects",
    number: "02",
  },
  {
    label: "Skills",
    desktopHref: "#skills",
    mobileHref: "#mobile-skills",
    number: "03",
  },
  {
    label: "Creative",
    desktopHref: "#creative",
    mobileHref: "#mobile-creative",
    number: "04",
  },
  {
    label: "Contact",
    desktopHref: "#contact",
    mobileHref: "#mobile-contact",
    number: "05",
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const mobileMenu = (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          className="mobile-menu-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
          }}
        >
          <button
            type="button"
            className="mobile-menu-portal-backdrop"
            aria-label="Close mobile menu"
            onClick={closeMenu}
          />

          <motion.div
            className="mobile-menu-portal-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{
              y: "100%",
            }}
            animate={{
              y: 0,
            }}
            exit={{
              y: "100%",
            }}
            transition={{
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="mobile-menu-portal-handle" />

            <div className="mobile-menu-portal-header">
              <div>
                <span>Navigation</span>
                <strong>Explore my portfolio</strong>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close navigation menu"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            <nav
              className="mobile-menu-portal-links"
              aria-label="Mobile navigation links"
            >
              {navigationLinks.map((link, index) => (
                <motion.a
                  href={link.mobileHref}
                  key={link.mobileHref}
                  onClick={closeMenu}
                  initial={{
                    opacity: 0,
                    x: -14,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.08 + index * 0.045,
                    duration: 0.3,
                  }}
                >
                  <span>{link.number}</span>
                  <strong>{link.label}</strong>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </motion.a>
              ))}
            </nav>

            <div className="mobile-menu-portal-socials">
              <a
                href="https://github.com/NebaPrecious"
                target="_blank"
                rel="noreferrer"
              >
                <FaGithub size={18} aria-hidden="true" />
                GitHub
              </a>

              <a
                href="https://linkedin.com/in/nebaprecious"
                target="_blank"
                rel="noreferrer"
              >
                <FaLinkedinIn size={18} aria-hidden="true" />
                LinkedIn
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header className="site-header">
        <nav
          className="container navbar"
          aria-label="Main navigation"
        >
          <a
            className="brand desktop-brand"
            href="#home"
            aria-label="Go to homepage"
          >
            NP<span>.</span>
          </a>

          <a
            className="brand mobile-brand"
            href="#mobile-home"
            aria-label="Go to mobile homepage"
            onClick={closeMenu}
          >
            NP<span>.</span>
          </a>

          <div className="nav-links">
            {navigationLinks.slice(0, 4).map((link) => (
              <a
                href={link.desktopHref}
                key={link.desktopHref}
              >
                {link.label}
              </a>
            ))}
          </div>

          <a
            className="nav-contact desktop-contact"
            href="#contact"
          >
            <span>Let&apos;s talk</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          <button
            type="button"
            className="mobile-menu-button"
            aria-label={
              isMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            onClick={() => {
              setIsMenuOpen((current) => !current);
            }}
          >
            {isMenuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </nav>
      </header>

      {isMounted && createPortal(mobileMenu, document.body)}
    </>
  );
}