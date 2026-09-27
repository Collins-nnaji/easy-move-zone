import Link from "next/link"
import { LockKeyhole } from "lucide-react"
import type { ReactNode } from "react"

export function AuthPreviewGate({
  signedIn,
  redirectTo,
  title,
  children,
}: {
  signedIn: boolean
  redirectTo: string
  title: string
  children: ReactNode
}) {
  if (signedIn) return children

  const authHref = `/auth?redirect=${encodeURIComponent(redirectTo)}`

  return (
    <div className="relative">
      <div className="border-b border-[#ead9cc] bg-[#fff8f2] px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fbe7da] text-[#e0511f]">
              <LockKeyhole className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#1b231e]">Previewing {title}</p>
              <p className="text-xs text-[#6d716b]">Explore the page, then sign in to use its personalised tools and save progress.</p>
            </div>
          </div>
          <Link href={authHref} className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#1b231e] px-5 text-sm font-bold text-white transition hover:bg-[#303932]">
            Sign in to continue
          </Link>
        </div>
      </div>
      <div className="relative">
        <div className="pointer-events-none select-none opacity-70" aria-hidden="true" inert>{children}</div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#efece4]/60" />
      </div>
    </div>
  )
}
