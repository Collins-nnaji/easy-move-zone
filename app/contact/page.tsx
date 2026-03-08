import { Suspense } from "react"
import { AuthInlineCard } from "@/components/platform/AuthInlineCard"
import { ContactInquiryForm } from "@/components/platform/ContactInquiryForm"
import { PublicShell } from "@/components/platform/PublicShell"
import { getMarkets } from "@/lib/platform"

export default async function ContactPage() {
  const markets = await getMarkets()

  return (
    <PublicShell>
      <section className="mx-auto grid w-full max-w-7xl gap-0 overflow-hidden border border-black/10 bg-white sm:my-8 sm:rounded-3xl lg:grid-cols-2 shadow-[0_26px_58px_-38px_rgba(13,13,13,0.5)]">
        <div className="bg-[#1a3a2a] p-7 text-[#f5f0e8] md:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c96a]">Get Started</p>
          <h1 className="mt-3 font-[var(--font-playfair)] text-6xl font-black leading-[0.95]">
            Tell us about your move.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#f5f0e8]/70">
            A real person reads every inquiry. You will hear from us within 24 hours on business days.
            If there is fit, we schedule a free 30-minute strategy call.
          </p>
          <div className="mt-6 space-y-3 text-sm text-[#f5f0e8]/80">
            <p><strong className="text-[#f5f0e8]">Email:</strong> hello@easymovezone.com</p>
            <p><strong className="text-[#f5f0e8]">Lagos Office:</strong> Victoria Island, Lagos</p>
            <p><strong className="text-[#f5f0e8]">London Office:</strong> Canary Wharf, London</p>
            <p><strong className="text-[#f5f0e8]">Response commitment:</strong> within 24 hours (business days)</p>
          </div>
        </div>
        <div className="space-y-4 bg-[#f5f0e8] p-7 md:p-9">
          <h2 className="font-[var(--font-playfair)] text-4xl font-bold text-[#0d0d0d]">Inquiry form</h2>
          <p className="mt-2 text-sm text-[#6b6560]">
            Share the essentials. We will reply with a clear next step.
          </p>
          <Suspense fallback={<div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-[#6b6560]">Loading account form...</div>}>
            <AuthInlineCard />
          </Suspense>
          <div className="mt-4">
            <Suspense fallback={<p className="text-sm text-[#6b6560]">Loading form...</p>}>
              <ContactInquiryForm markets={markets} />
            </Suspense>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
