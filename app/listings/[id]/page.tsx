import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PublicShell } from "@/components/platform/PublicShell"
import { getPrimaryListingImage } from "@/lib/property/media"
import { getPropertyListingById } from "@/lib/property"

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await getPropertyListingById(id)
  if (!listing) notFound()

  const primaryImage = getPrimaryListingImage(listing)
  const inquiryHref = `/contact?market=${encodeURIComponent(listing.citySlug)}&message=${encodeURIComponent(`I want to enquire about: ${listing.title}`)}`

  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/listings" className="mb-6 inline-block text-sm font-medium text-[#64748b] hover:text-[#155eef]">
          ← Back to listings
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[#dbe4f0] bg-white shadow-[0_16px_40px_-24px_rgba(13,13,13,0.2)]">
          <div className="relative aspect-[16/10] w-full bg-[#f1f5f9]">
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {listing.verified && (
                <span className="rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  ✓ Verified
                </span>
              )}
              <span className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0f172a] backdrop-blur-sm">
                {listing.type}
              </span>
              <span className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0f172a] backdrop-blur-sm">
                {listing.citySlug.replace(/-/g, " ")}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#155eef]">
              {listing.neighborhood}, {listing.country}
            </p>
            <h1 className="mt-2 font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a] sm:text-4xl">
              {listing.title}
            </h1>
            <p className="mt-4 font-[var(--font-playfair)] text-4xl font-bold text-[#091520]">
              ${listing.priceUsd.toLocaleString()}
            </p>

            <ul className="mt-6 flex flex-wrap gap-4 text-sm text-[#475569]">
              <li>🛏 {listing.bedrooms} beds</li>
              <li>🚿 {listing.bathrooms} baths</li>
              <li>📐 {listing.areaSqm.toLocaleString()} sqm</li>
              {listing.schoolsNearby > 0 && <li>🏫 {listing.schoolsNearby} schools nearby</li>}
              {listing.commuteMinutes > 0 && <li>🚌 ~{listing.commuteMinutes} min commute</li>}
              {listing.moveInReady && <li className="font-semibold text-[#0f766e]">Move-in ready</li>}
            </ul>

            {listing.description && (
              <div className="mt-6 border-t border-[#e8edf6] pt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">Description</h2>
                <p className="mt-2 whitespace-pre-line text-[#334155]">{listing.description}</p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={inquiryHref}
                className="emz-pill-cta inline-flex rounded-full px-6 py-3 text-sm font-semibold"
              >
                Enquire about this property
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-full border border-[#dbe4f0] bg-white px-6 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-[#f8fbff]"
              >
                General contact
              </Link>
            </div>
          </div>
        </div>
      </article>
    </PublicShell>
  )
}
