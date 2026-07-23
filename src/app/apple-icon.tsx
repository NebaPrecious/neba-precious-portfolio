import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #07070a 0%, #111117 55%, #17101f 100%)",
          color: "#f5f5f7",
          fontSize: 67,
          fontWeight: 800,
          letterSpacing: "-7px",
          borderRadius: 38,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 90,
            height: 90,
            top: -30,
            right: -24,
            borderRadius: "50%",
            background: "rgba(168, 85, 247, 0.32)",
          }}
        />

        <span>NP</span>

        <span
          style={{
            marginLeft: 3,
            color: "#a855f7",
          }}
        >
          .
        </span>
      </div>
    ),
    size,
  );
}