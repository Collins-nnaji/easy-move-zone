import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthInlineCard } from "@/components/platform/AuthInlineCard"
import { PublicShell } from "@/components/platform/PublicShell"
import { SiteLogo } from "@/components/brand/SiteLogo"
import { Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Create an account or sign in to claim loads, post fleet routes, and cash out earnings.",
}

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
            <div className="mx-auto mt-5 flex items-center justify-center">
              <SiteLogo href={null} height={48} priority />
            </div>
            <h1 className="mt-5 font-[var(--font-bricolage)] text-3xl font-bold text-[#0f172a] sm:text-4xl">
              Welcome back
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#475569]">
              Sign in to claim loads as a driver, post routes as a fleet operator, or cash out earnings.
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
