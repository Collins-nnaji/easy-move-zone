import type { PropertyListing } from "@/lib/property/types"

const INLINE_FALLBACK_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#155eef"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  <circle cx="260" cy="170" r="170" fill="rgba(255,255,255,0.09)"/>
  <circle cx="1320" cy="720" r="220" fill="rgba(255,255,255,0.08)"/>
  <text x="70" y="825" fill="rgba(255,255,255,0.88)" font-family="Arial, sans-serif" font-size="52">EasyMoveZone Property</text>
</svg>
`)

export const PROPERTY_IMAGE_FALLBACK = `data:image/svg+xml;charset=utf-8,${INLINE_FALLBACK_SVG}`

export function getPrimaryListingImage(listing: PropertyListing): string {
  const fromListing = (listing.images ?? [])
    .find((value) => typeof value === "string" && value.trim().length > 0)
    ?.trim()
  return fromListing ?? PROPERTY_IMAGE_FALLBACK
}

export function getImageOrFallback(images: string[] | undefined): string {
  const first = (images ?? []).find((value) => typeof value === "string" && value.trim().length > 0)?.trim()
  return first ?? PROPERTY_IMAGE_FALLBACK
}
