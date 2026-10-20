import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Is It True? — Your pocket lie detector";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "#12100d",
          color: "#f6eddd",
          fontFamily: "Impact, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#ff6a3d",
          }}
        >
          Pocket lie detector
        </div>
        <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 0.9, marginTop: 18 }}>
          is it <span style={{ color: "#ff6a3d" }}>true?</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 28, color: "#ac9d8b", maxWidth: 820 }}>
          Paste a claim. Drop a Reel. Get the receipts — never absolute truth.
        </div>
      </div>
    ),
    size,
  );
}
