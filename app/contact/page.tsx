import { Suspense } from "react"
import { AuthInlineCard } from "@/components/platform/AuthInlineCard"
import { ContactInquiryForm } from "@/components/platform/ContactInquiryForm"
import { PublicShell } from "@/components/platform/PublicShell"
import { getCityMarkets } from "@/lib/property"

export default async function ContactPage() {
  const markets = await getCityMarkets()

  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-0 overflow-hidden border border-[#dbe4f0] bg-white shadow-[0_16px_40px_-24px_rgba(13,13,13,0.2)] sm:rounded-2xl lg:grid-cols-[320px_1fr] lg:items-start">
          <div
            className="contact-hero-panel min-h-0 rounded-t-2xl bg-[#0f172a] p-4 text-white sm:rounded-l-2xl sm:rounded-tr-none md:p-5"
            style={{
              backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,94,239,0.35) 100%), url('https://images.unsplash.com/photo-1613977257592-487ecd136cc3?auto=format&fit=crop&w=800&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/90">Get in touch</p>
            <h1 className="mt-2 font-[var(--font-playfair)] text-2xl font-bold leading-tight sm:text-3xl">
              Tell us your relocation plan.
            </h1>
            <p className="mt-3 text-xs leading-6 text-sky-100/90">
              We help you scout, secure, and settle. You’ll hear from us within 24 hours on business days.
            </p>
            <dl className="mt-4 space-y-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs backdrop-blur-sm">
              <div><dt className="font-semibold text-white">Email</dt><dd className="text-sky-100/90">hello@easymovezone.com</dd></div>
              <div><dt className="font-semibold text-white">Lagos</dt><dd className="text-sky-100/90">Victoria Island</dd></div>
              <div><dt className="font-semibold text-white">London</dt><dd className="text-sky-100/90">Canary Wharf</dd></div>
              <div><dt className="font-semibold text-white">Response</dt><dd className="text-sky-100/90">Within 24h (business days)</dd></div>
            </dl>
          </div>
          <div className="space-y-3 bg-[#f8fbff] p-4 sm:p-5 md:p-6">
            <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a] sm:text-3xl">Inquiry form</h2>
            <p className="text-sm text-[#64748b]">
              Share your move goals. We’ll reply with clear options and next steps.
            </p>
          <Suspense fallback={<div className="rounded-xl border border-[#dbe4f0] bg-white p-4 text-sm text-[#64748b]">Loading...</div>}>
            <AuthInlineCard redirectIfAuthenticated={false} hideWhenAuthenticated />
          </Suspense>
            <div className="mt-3">
              <Suspense fallback={<p className="text-sm text-[#64748b]">Loading form...</p>}>
                <ContactInquiryForm markets={markets} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
