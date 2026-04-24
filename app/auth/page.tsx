import { Suspense } from "react"
import { AuthInlineCard } from "@/components/platform/AuthInlineCard"
import { PublicShell } from "@/components/platform/PublicShell"
import { Wheat } from "lucide-react"

export const metadata = {
  title: "Sign In — EasyMoveZone",
  description: "Sign in or create an account to list produce, register your fleet, or buy from African farmers.",
}

export default function AuthPage() {
  return (
    <PublicShell>
      <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-lime-100/50 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          {/* Brand header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl shadow-emerald-200">
              <Wheat className="h-8 w-8 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                EasyMoveZone
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-slate-500">
              Africa&apos;s agro logistics platform. List produce, find transporters, track shipments, and trade at fair prices.
            </p>

            {/* Role quick-select pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {[
                { label: "I'm a farmer", emoji: "🌱", role: "farmer" },
                { label: "I move cargo", emoji: "🚛", role: "transporter" },
                { label: "I'm a buyer", emoji: "📦", role: "buyer" },
              ].map((r) => (
                <span
                  key={r.role}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur"
                >
                  <span>{r.emoji}</span>
                  {r.label}
                </span>
              ))}
            </div>
          </div>

          <Suspense
            fallback={
              <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
                Loading…
              </div>
            }
          >
            <div className="relative">
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-emerald-200/60 via-white/40 to-lime-200/50 blur-sm" aria-hidden />
              <div className="relative rounded-3xl border border-white/70 bg-white/80 p-1 shadow-2xl shadow-emerald-200/60 backdrop-blur-xl">
                <AuthInlineCard redirectIfAuthenticated />
              </div>
            </div>
          </Suspense>

          <p className="mt-6 text-center text-xs text-slate-400">
            By signing up, you agree to our Terms of Service. Your data is stored securely on Neon&apos;s managed infrastructure.
          </p>
        </div>
      </section>
    </PublicShell>
  )
}
