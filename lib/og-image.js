import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function renderOgImage({ kicker, title, subtitle }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4efe4",
          color: "#2a241c",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#5e564b" }}>{kicker}</div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "1000px" }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
          {subtitle ? (
            <div style={{ display: "flex", marginTop: 28, fontSize: 30, lineHeight: 1.4, color: "#5e564b" }}>
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...ogSize },
  );
}

export function ogSubtitle(text) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  if (clean.length <= 110) return clean;
  return `${clean.slice(0, 109).trimEnd()}…`;
}
