import React from 'react';
import styled from 'styled-components';

const Frame = styled.div`
  overflow: hidden;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-line);
  background: var(--color-bg-panel);
  aspect-ratio: 16 / 9;
  iframe, img { width: 100%; height: 100%; border: 0; display: block; object-fit: cover; }
`;

/**
 * A map for a listing or office. Uses a Mapbox static image when a public
 * token is set; otherwise an OpenStreetMap embed.
 */
export default function ListingMap({ lat, lng, title = 'Location', zoom = 14 }) {
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return null;
  const token = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN : '';
  const src = token
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+2f5d50(${nLng},${nLat})/${nLng},${nLat},${zoom},0/800x450@2x?access_token=${token}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${nLng - 0.01},${nLat - 0.01},${nLng + 0.01},${nLat + 0.01}&layer=mapnik&marker=${nLat},${nLng}`;

  return (
    <Frame>
      {token
        ? <img src={src} alt={title} />
        : <iframe title={title} src={src} loading="lazy" />}
    </Frame>
  );
}
