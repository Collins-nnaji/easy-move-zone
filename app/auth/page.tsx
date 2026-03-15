import { Suspense } from "react"
import { AuthInlineCard } from "@/components/platform/AuthInlineCard"
import { PublicShell } from "@/components/platform/PublicShell"

export default function AuthPage() {
  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="emz-gloss-card mb-4 rounded-2xl p-6 border border-[#00D4FF]/20 bg-[#0A0F1E] text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00D4FF]">Account</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black">
            Make your move.
          </h1>
          <p className="mt-2 text-base text-slate-400">
            Sign in or create an account to access your personal Move Score™ or your Corporate Dashboard.
          </p>
        </div>
        <Suspense fallback={<div className="rounded-2xl border border-[#dbe4f0] bg-white p-6 text-sm text-[#64748b]">Loading account form...</div>}>
          <AuthInlineCard redirectIfAuthenticated />
        </Suspense>
      </section>
    </PublicShell>
  )
}
