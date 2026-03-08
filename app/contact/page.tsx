import { Suspense } from "react"
import { ContactInquiryForm } from "@/components/platform/ContactInquiryForm"
import { PublicShell } from "@/components/platform/PublicShell"
import { getMarkets } from "@/lib/platform"

export default async function ContactPage() {
  const markets = await getMarkets()

  return (
    <PublicShell>
      <section className="mx-auto grid w-full max-w-7xl gap-0 overflow-hidden border border-black/10 bg-white sm:my-10 sm:rounded-3xl lg:grid-cols-2">
        <div className="bg-[#1a3a2a] p-8 text-[#f5f0e8] md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c96a]">Get Started</p>
          <h1 className="mt-3 font-[var(--font-playfair)] text-5xl font-black leading-tight">
            Tell us about your move.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#f5f0e8]/70">
            A real person reviews every inquiry. You will hear from us within 24 hours on business days,
            and we will offer a free 30-minute strategy call where there is clear fit.
          </p>
          <div className="mt-8 space-y-4 text-sm text-[#f5f0e8]/80">
            <p><strong className="text-[#f5f0e8]">Email:</strong> hello@easymovezone.com</p>
            <p><strong className="text-[#f5f0e8]">Lagos Office:</strong> Victoria Island, Lagos</p>
            <p><strong className="text-[#f5f0e8]">London Office:</strong> Canary Wharf, London</p>
            <p><strong className="text-[#f5f0e8]">Response commitment:</strong> within 24 hours (business days)</p>
          </div>
        </div>
        <div className="bg-[#f5f0e8] p-8 md:p-10">
          <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Inquiry form</h2>
          <p className="mt-2 text-sm text-[#6b6560]">
            The details below help us prioritize your request and prepare a useful first call.
          </p>
          <div className="mt-5">
            <Suspense fallback={<p className="text-sm text-[#6b6560]">Loading form...</p>}>
              <ContactInquiryForm markets={markets} />
            </Suspense>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
