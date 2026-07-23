import { ArrowUpRight } from "lucide-react";

const navigationLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Creative", href: "#creative" },
];

export default function Navbar() {
  return (
    <header className="site-header">
      <nav className="container navbar" aria-label="Main navigation">
        <a className="brand" href="#home" aria-label="Go to homepage">
          NP<span>.</span>
        </a>

        <div className="nav-links">
          {navigationLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <a className="nav-contact" href="#contact">
          <span>Let&apos;s talk</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}