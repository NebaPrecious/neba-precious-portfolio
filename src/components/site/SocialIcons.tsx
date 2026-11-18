import { Link2, Mail } from "lucide-react";
import {
  FaBehance,
  FaDribbble,
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { SocialLink } from "@/lib/types";

const icons: [RegExp, React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>][] = [
  [/github/i, FaGithub],
  [/linkedin/i, FaLinkedinIn],
  [/instagram/i, FaInstagram],
  [/tiktok/i, FaTiktok],
  [/youtube/i, FaYoutube],
  [/twitter|\bx\b|x\.com/i, FaXTwitter],
  [/behance/i, FaBehance],
  [/dribbble/i, FaDribbble],
  [/facebook/i, FaFacebookF],
];

function iconFor(link: SocialLink) {
  return icons.find(([re]) => re.test(link.label) || re.test(link.url))?.[1] ?? Link2;
}

export default function SocialIcons({ socials, email }: { socials: SocialLink[]; email?: string }) {
  return (
    <ul className="social-icons" aria-label="Social links">
      {socials.map((s) => {
        const Icon = iconFor(s);
        return (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} (opens in a new tab)`} title={s.label}>
              <Icon size={20} aria-hidden={true} />
            </a>
          </li>
        );
      })}
      {email && (
        <li>
          <a href={`mailto:${email}`} aria-label="Email" title="Email">
            <Mail size={20} aria-hidden="true" />
          </a>
        </li>
      )}
    </ul>
  );
}
