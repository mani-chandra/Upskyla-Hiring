import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 32, height: 32, background: "#0B1F3A", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>
        U
      </div>
    ),
    size,
  );
}
