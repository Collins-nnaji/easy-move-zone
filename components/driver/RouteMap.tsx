"use client";

import { useEffect, useMemo, useState } from "react";
import type { Waypoint } from "@/lib/driver/types";

type Props = {
  waypoints?: Waypoint[];
  clockIn?: { lat: number; lng: number } | null;
  live?: { lat: number; lng: number } | null;
  /** When true, watch device GPS and optionally report it. */
  watchDevice?: boolean;
  onLocation?: (coords: { lat: number; lng: number }) => void;
  height?: number;
  emptyLabel?: string;
};

function bbox(points: Array<{ lat: number; lng: number }>) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padLat = Math.max((maxLat - minLat) * 0.2, 0.02);
  const padLng = Math.max((maxLng - minLng) * 0.2, 0.02);
  return `${minLng - padLng}%2C${minLat - padLat}%2C${maxLng + padLng}%2C${maxLat + padLat}`;
}

export function RouteMap({
  waypoints = [],
  clockIn,
  live: liveProp,
  watchDevice = true,
  onLocation,
  height = 220,
  emptyLabel = "Map available after GPS clock-in",
}: Props) {
  const [deviceLive, setDeviceLive] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!watchDevice || !navigator.geolocation) return;
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDeviceLive(coords);
        onLocation?.(coords);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
    // Intentionally omit onLocation — callers should keep a stable callback/ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchDevice]);

  const live = liveProp ?? deviceLive;

  const points = useMemo(() => {
    const fromWaypoints = waypoints
      .filter((w): w is Waypoint & { lat: number; lng: number } => typeof w.lat === "number" && typeof w.lng === "number")
      .map((w) => ({ lat: w.lat, lng: w.lng, label: w.label }));
    if (clockIn) fromWaypoints.unshift({ ...clockIn, label: "Clock-in" });
    if (live) fromWaypoints.push({ ...live, label: "Live" });
    return fromWaypoints;
  }, [waypoints, clockIn, live]);

  if (points.length === 0) {
    return (
      <div
        style={{
          height,
          borderRadius: 16,
          border: "1px dashed #d8d2c6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9aa097",
          fontSize: 13,
          background: "#faf8f4",
        }}
      >
        {emptyLabel}
      </div>
    );
  }

  const marker = points[points.length - 1];
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox(points)}&layer=mapnik&marker=${marker.lat}%2C${marker.lng}`;

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e4dfd5", height, position: "relative" }}>
      <iframe
        title="Route map"
        src={embed}
        style={{ width: "100%", height: "100%", border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {live && (
        <div
          style={{
            position: "absolute",
            left: 10,
            bottom: 10,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(27,35,30,.88)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
          }}
        >
          Live · {live.lat.toFixed(4)}, {live.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
}

export function mapsNavigateUrl(address: string, lat?: number, lng?: number) {
  if (typeof lat === "number" && typeof lng === "number") {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
