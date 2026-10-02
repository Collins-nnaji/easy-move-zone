import type { Metadata } from "next"
import { Suspense } from "react"
import { AuthInlineCard } from "@/components/platform/AuthInlineCard"
import { PublicShell } from "@/components/platform/PublicShell"
import { SiteLogo } from "@/components/brand/SiteLogo"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Sign in",
  description: "Sign in to EasyMoveZone to book produce moves and keep your shipment references.",
  path: "/auth",
  noIndex: true,
})

export default function AuthPage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 12% 0%, rgba(47,93,80,0.14) 0%, transparent 60%), radial-gradient(55% 45% at 100% 10%, rgba(143,181,168,0.18) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto flex items-center justify-center">
              <SiteLogo href="/" height={40} priority />
            </div>
            <h1 className="page-title mt-6 max-w-xl text-2xl font-extrabold tracking-tight text-[#1b231e] sm:text-3xl">
              Welcome back
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-[#5f655c]">
              Sign in to book moves and keep your shipment references with your account.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="rounded-3xl border border-[#e4dfd5] bg-white p-8 text-center text-sm text-[#7c827a]">
                Loading sign-in…
              </div>
            }
          >
            <AuthInlineCard redirectIfAuthenticated />
          </Suspense>
        </div>
      </section>
    </PublicShell>
  )
}
