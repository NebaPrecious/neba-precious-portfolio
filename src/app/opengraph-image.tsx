import { ImageResponse } from "next/og";

export const alt = "Neba Precious | Software Engineer & Visual Creative";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0b1a30";
const PAPER = "#ccd6f6";
const MINT = "#64ffda";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: INK,
          color: PAPER,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "44px 64px 0",
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#8892b0",
          }}
        >
          <span>Portfolio · Software &amp; Studio</span>
          <span>Douala, Cameroon</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", padding: "52px 64px 0", flex: 1 }}>
          <span style={{ fontSize: 150, fontWeight: 800, letterSpacing: -7, lineHeight: 0.9 }}>Neba</span>
          <span style={{ fontSize: 150, fontWeight: 800, letterSpacing: -7, lineHeight: 0.9, color: MINT }}>
            Precious
          </span>
          <span style={{ marginTop: 34, fontSize: 34, fontWeight: 600 }}>
            Software Engineer · Visual Creative
          </span>
        </div>

        <div style={{ display: "flex", height: 120 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              padding: "0 64px",
              background: "#112240",
              color: PAPER,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            Dev Pre_elite
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              padding: "0 64px",
              background: MINT,
              color: INK,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            Preelite Visual Creatives
          </div>
        </div>
      </div>
    ),
    size,
  );
}
