import { Suspense } from "react"
import { AuthInlineCard } from "@/components/platform/AuthInlineCard"
import { PublicShell } from "@/components/platform/PublicShell"
import { Home, Sparkles } from "lucide-react"

export default function AuthPage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#e0511f]/[0.06] via-transparent to-transparent" />
        <div className="relative mx-auto w-full max-w-xl">
          <div className="emz-hero-bento mb-8 p-8 text-center">
            <span className="emz-section-eyebrow mx-auto">
              <Sparkles className="h-3.5 w-3.5" />
              Secure access
            </span>
            <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e0511f] to-[#0f4ec4] text-white shadow-lg shadow-[#e0511f]/30">
              <Home className="h-8 w-8" strokeWidth={2.25} />
            </div>
            <h1 className="mt-5 font-[var(--font-playfair)] text-4xl font-bold text-[#0f172a] sm:text-[2.5rem]">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-[#e0511f] to-[#0f766e] bg-clip-text text-transparent">EasyMoveZone</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#475569]">
              Sign in or create an account to save properties, track transactions, and work with verified listings end to end.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="emz-rich-card animate-pulse p-8 text-center text-sm text-[#64748b]">Loading sign-in…</div>
            }
          >
            <AuthInlineCard redirectIfAuthenticated />
          </Suspense>
        </div>
      </section>
    </PublicShell>
  )
}
