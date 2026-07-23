import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 190,
          fontWeight: 800,
          letterSpacing: "-20px",
          borderRadius: 96,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            top: -90,
            right: -80,
            borderRadius: "50%",
            background: "rgba(168, 85, 247, 0.32)",
            filter: "blur(35px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            bottom: -100,
            left: -70,
            borderRadius: "50%",
            background: "rgba(34, 211, 238, 0.24)",
            filter: "blur(32px)",
          }}
        />

        <span>NP</span>

        <span
          style={{
            marginLeft: 8,
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