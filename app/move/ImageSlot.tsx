"use client";

import { useState } from "react";

/**
 * A static destination image: shows the seeded photo when one exists and
 * loads successfully, or a designed placeholder themed by region otherwise
 * (missing URL, or the hotlinked photo failing to load). No upload/pick —
 * real photos are an admin-managed concern, not a per-user one.
 */
const REGION_GRADIENT: Record<string, [string, string]> = {
  Europe: ["#3d5a6c", "#1b231e"],
  "Latin America": ["#b9781f", "#7a3f12"],
  "Asia-Pacific": ["#1f6f78", "#123a3e"],
  Africa: ["#8a5a2f", "#4a2f16"],
  "Middle East": ["#a3652f", "#5c341a"],
  "North America": ["#3d6b6b", "#1e3636"],
  Oceania: ["#2f7d7d", "#173e3e"],
};
const DEFAULT_GRADIENT: [string, string] = ["#4a5047", "#1b231e"];

function PlaceholderTile({
  city,
  country,
  region,
  style,
}: {
  city: string;
  country?: string;
  region?: string;
  style?: React.CSSProperties;
}) {
  const [from, to] = REGION_GRADIENT[region ?? ""] ?? DEFAULT_GRADIENT;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(155deg, ${from}, ${to})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        textAlign: "center",
        padding: 14,
        color: "rgba(255,255,255,.92)",
        ...style,
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.75 }}>
        <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <span style={{ fontFamily: "var(--font-plex-mono), ui-monospace, monospace", fontSize: 12.5, fontWeight: 600, letterSpacing: ".02em" }}>
        {city}
      </span>
      {country && (
        <span style={{ fontFamily: "var(--font-plex-mono), ui-monospace, monospace", fontSize: 10.5, opacity: 0.75, letterSpacing: ".08em", textTransform: "uppercase" }}>
          {country}
        </span>
      )}
    </div>
  );
}

export function DestinationImage({
  src,
  city,
  country,
  region,
  style,
}: {
  src?: string;
  city: string;
  country?: string;
  region?: string;
  style?: React.CSSProperties;
}) {
  const [lastSrc, setLastSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  if (src !== lastSrc) {
    setLastSrc(src);
    setFailed(false);
  }

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={city}
        onError={() => setFailed(true)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }}
      />
    );
  }

  return <PlaceholderTile city={city} country={country} region={region} style={style} />;
}
