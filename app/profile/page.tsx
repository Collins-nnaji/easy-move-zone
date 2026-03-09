import Link from "next/link"
import { redirect } from "next/navigation"
import { neonAuth } from "@neondatabase/auth/next/server"

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { session, user } = await neonAuth()
  if (!session || !user) redirect("/auth?redirect=/profile")

  const params = await searchParams
  const role = params.role === "seller" ? "seller" : "buyer"

  return (
    <div className="emz-surface min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#155eef]">My Profile</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0f172a]">
            {user.name || user.email}
          </h1>
          <p className="mt-2 text-sm text-[#64748b]">Manage your account as a buyer or seller.</p>

          <div className="mt-4 inline-flex rounded-full border border-[#c8d8f0] bg-[#eef4ff] p-1">
            <Link
              href="/profile?role=buyer"
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                role === "buyer" ? "bg-[#155eef] text-white" : "text-[#64748b]"
              }`}
            >
              Buyer profile
            </Link>
            <Link
              href="/profile?role=seller"
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                role === "seller" ? "bg-[#155eef] text-white" : "text-[#64748b]"
              }`}
            >
              Seller profile
            </Link>
          </div>
        </section>

        {role === "buyer" ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <article className="emz-gloss-card rounded-2xl p-5">
              <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Buyer preferences</h2>
              <ul className="mt-3 space-y-2 text-sm text-[#64748b]">
                <li>Preferred cities and neighborhoods</li>
                <li>Budget and listing type (rent/buy)</li>
                <li>Bedrooms, commute, and school priorities</li>
              </ul>
              <Link href="/services" className="emz-pill-cta mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
                Continue browsing listings
              </Link>
            </article>
            <article className="emz-gloss-card rounded-2xl p-5">
              <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Support</h2>
              <ul className="mt-3 space-y-2 text-sm text-[#64748b]">
                <li>Track viewings and shortlist status</li>
                <li>Ask city intelligence questions</li>
                <li>Contact advisor for closing help</li>
              </ul>
              <Link href="/contact" className="mt-4 inline-block rounded-full border border-[#c8d8f0] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a]">
                Get help
              </Link>
            </article>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2">
            <article className="emz-gloss-card rounded-2xl p-5">
              <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Seller profile</h2>
              <ul className="mt-3 space-y-2 text-sm text-[#64748b]">
                <li>Agent/company details</li>
                <li>Coverage cities and property types</li>
                <li>Verification and response commitments</li>
              </ul>
              <Link href="/contact" className="emz-pill-cta mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
                Request seller onboarding
              </Link>
            </article>
            <article className="emz-gloss-card rounded-2xl p-5">
              <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Lead handling</h2>
              <ul className="mt-3 space-y-2 text-sm text-[#64748b]">
                <li>Receive qualified buyer interest</li>
                <li>Coordinate viewing windows</li>
                <li>Maintain listing accuracy and trust signals</li>
              </ul>
              <Link href="/markets" className="mt-4 inline-block rounded-full border border-[#c8d8f0] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a]">
                Review city demand
              </Link>
            </article>
          </section>
        )}
      </div>
    </div>
  )
}
