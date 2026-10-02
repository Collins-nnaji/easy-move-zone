import Link from "next/link"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"

export const metadata: Metadata = {
  title: "Your account",
  description: "Your EasyMoveZone account for produce moves.",
  robots: { index: false, follow: false },
}

export default async function ProfilePage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/profile")
  const { user } = session.data
  const name = user.name || user.email?.split("@")[0] || "Member"

  return (
    <PublicShell>
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e0511f]">Account</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1b231e]">{name}</h1>
        <p className="mt-2 text-sm text-[#5f655c]">{user.email}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/book" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2f5d50] px-5 text-sm font-bold text-white">
            Book a move
          </Link>
          <Link href="/track" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d8d2c6] bg-white px-5 text-sm font-bold text-[#1b231e]">
            Track a shipment
          </Link>
        </div>
      </div>
    </PublicShell>
  )
}
