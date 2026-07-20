"use client";

import { useEffect, useMemo, useState } from "react";
import type { Waypoint } from "@/lib/driver/types";

type Props = {
  waypoints: Waypoint[];
  clockIn?: { lat: number; lng: number } | null;
  height?: number;
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

export function RouteMap({ waypoints, clockIn, height = 220 }: Props) {
  const [live, setLive] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watch = navigator.geolocation.watchPosition(
      (pos) => setLive({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  const points = useMemo(() => {
    const fromWaypoints = waypoints
      .filter((w): w is Waypoint & { lat: number; lng: number } => typeof w.lat === "number" && typeof w.lng === "number")
      .map((w) => ({ lat: w.lat, lng: w.lng, label: w.label }));
    if (clockIn) fromWaypoints.unshift({ ...clockIn, label: "Clock-in" });
    if (live) fromWaypoints.push({ ...live, label: "You" });
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
        Map available after GPS clock-in
      </div>
    );
  }

  const marker = points[points.length - 1];
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox(points)}&layer=mapnik&marker=${marker.lat}%2C${marker.lng}`;

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e4dfd5", height }}>
      <iframe
        title="Route map"
        src={embed}
        style={{ width: "100%", height: "100%", border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export function mapsNavigateUrl(address: string, lat?: number, lng?: number) {
  if (typeof lat === "number" && typeof lng === "number") {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}
