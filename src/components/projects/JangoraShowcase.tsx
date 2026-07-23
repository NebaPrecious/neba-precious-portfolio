import Image from "next/image";

const screenshots = [
  {
    src: "/projects/jangora/jangora-dashboard.png",
    alt: "Jangora dashboard interface",
    className: "jangora-screen jangora-screen-dashboard",
  },
  {
    src: "/projects/jangora/jangora-login.png",
    alt: "Jangora login interface",
    className: "jangora-screen jangora-screen-login",
  },
  {
    src: "/projects/jangora/jangora-profile.png",
    alt: "Jangora profile interface",
    className: "jangora-screen jangora-screen-profile",
  },
  {
    src: "/projects/jangora/jangora-splash.png",
    alt: "Jangora splash screen",
    className: "jangora-screen jangora-screen-splash",
  },
];

type JangoraShowcaseProps = {
  mobile?: boolean;
};

export default function JangoraShowcase({
  mobile = false,
}: JangoraShowcaseProps) {
  return (
    <div
      className={
        mobile
          ? "jangora-showcase jangora-showcase-mobile"
          : "jangora-showcase"
      }
      aria-label="Jangora application interface previews"
    >
      <div className="jangora-showcase-glow" />

      {screenshots.map((screenshot) => (
        <div className={screenshot.className} key={screenshot.src}>
          <Image
            src={screenshot.src}
            alt={screenshot.alt}
            fill
            sizes={
              mobile
                ? "(max-width: 700px) 45vw"
                : "(max-width: 1100px) 25vw, 260px"
            }
          />
        </div>
      ))}

      <div className="jangora-showcase-label">
        <span>Featured project</span>
        <strong>Jangora</strong>
      </div>
    </div>
  );
}