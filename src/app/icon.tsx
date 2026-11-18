import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** The split mark: navy | mint — the two halves of the brand. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", borderRadius: 96, overflow: "hidden" }}>
        <div style={{ flex: 1, background: "#0b1a30" }} />
        <div style={{ flex: 1, background: "#64ffda" }} />
      </div>
    ),
    size,
  );
}
