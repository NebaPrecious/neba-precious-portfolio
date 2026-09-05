import { ImageResponse } from "next/og";

export const alt =
  "Neba Precious Ngeh · Software Developer and Designer";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "70px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          position: "relative",
          background:
            "linear-gradient(145deg, #07070a 0%, #0d0d13 55%, #130d1a 100%)",
          color: "#f5f5f7",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            top: -220,
            right: -100,
            borderRadius: "50%",
            background: "rgba(168, 85, 247, 0.28)",
            filter: "blur(55px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            bottom: -260,
            left: -120,
            borderRadius: "50%",
            background: "rgba(34, 211, 238, 0.2)",
            filter: "blur(50px)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "-4px",
            }}
          >
            NP
            <span style={{ color: "#a855f7" }}>.</span>
          </div>

          <div
            style={{
              padding: "12px 20px",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 999,
              color: "#b8b8c3",
              fontSize: 18,
            }}
          >
            Douala, Cameroon
          </div>
        </div>

        <div
          style={{
            maxWidth: 940,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <span
            style={{
              marginBottom: 24,
              color: "#22d3ee",
              fontSize: 20,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Software Developer · Designer
          </span>

          <div
            style={{
              fontSize: 76,
              lineHeight: 0.98,
              fontWeight: 750,
              letterSpacing: "-5px",
            }}
          >
            Building digital products with purpose and creativity.
          </div>

          <div
            style={{
              marginTop: 30,
              color: "#a8a8b3",
              fontSize: 25,
              lineHeight: 1.45,
            }}
          >
            Neba Precious Ngeh · Full-stack development, product design and
            creative digital experiences.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            color: "#8d8d98",
            fontSize: 18,
          }}
        >
          <span>github.com/NebaPrecious</span>
          <span>linkedin.com/in/nebaprecious</span>
        </div>
      </div>
    ),
    size,
  );
}