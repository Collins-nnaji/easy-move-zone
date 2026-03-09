import { Suspense } from "react"
import { AuthInlineCard } from "@/components/platform/AuthInlineCard"
import { ContactInquiryForm } from "@/components/platform/ContactInquiryForm"
import { PublicShell } from "@/components/platform/PublicShell"
import { getCityMarkets } from "@/lib/property"

export default async function ContactPage() {
  const markets = await getCityMarkets()

  return (
    <PublicShell>
      <section className="mx-auto grid w-full max-w-7xl gap-0 overflow-hidden border border-[#dbe4f0] bg-white shadow-[0_26px_58px_-38px_rgba(13,13,13,0.35)] sm:my-8 sm:rounded-3xl lg:grid-cols-2">
        <div className="property-hero-image p-7 text-white md:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">Get Started</p>
          <h1 className="mt-3 font-[var(--font-playfair)] text-6xl font-black leading-[0.95]">
            Tell us your move plan.
          </h1>
          <p className="mt-4 text-sm leading-7 text-sky-50/90">
            We help you shortlist, verify, and secure a suitable property with less stress and better decision quality.
            You will hear from us within 24 hours on business days.
          </p>
          <div className="mt-6 space-y-3 rounded-2xl border border-white/30 bg-white/10 p-4 text-sm text-sky-50/90 backdrop-blur-sm">
            <p><strong className="text-white">Email:</strong> hello@easymovezone.com</p>
            <p><strong className="text-white">Lagos office:</strong> Victoria Island, Lagos</p>
            <p><strong className="text-white">London office:</strong> Canary Wharf, London</p>
            <p><strong className="text-white">Coverage:</strong> Nigeria + selected African cities</p>
            <p><strong className="text-white">Response:</strong> within 24 hours (business days)</p>
          </div>
        </div>
        <div className="space-y-4 bg-[#f8fbff] p-7 md:p-9">
          <h2 className="font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a]">Inquiry form</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Share your move details. We will reply with clear options and next steps.
          </p>
          <Suspense fallback={<div className="rounded-2xl border border-[#dbe4f0] bg-white p-6 text-sm text-[#64748b]">Loading account form...</div>}>
            <AuthInlineCard />
          </Suspense>
          <div className="mt-4">
            <Suspense fallback={<p className="text-sm text-[#64748b]">Loading form...</p>}>
              <ContactInquiryForm markets={markets} />
            </Suspense>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
