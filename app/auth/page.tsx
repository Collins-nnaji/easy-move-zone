import { Suspense } from "react"
import { AuthInlineCard } from "@/components/platform/AuthInlineCard"
import { PublicShell } from "@/components/platform/PublicShell"

export default function AuthPage() {
  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="emz-gloss-card mb-4 rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">Account</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0d0d0d]">
            Sign in or create your account
          </h1>
          <p className="mt-2 text-base text-[#6b6560]">
            Access your relocation dashboard, saved listings, and support updates.
          </p>
        </div>
        <Suspense fallback={<div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-[#6b6560]">Loading account form...</div>}>
          <AuthInlineCard />
        </Suspense>
      </section>
    </PublicShell>
  )
}
