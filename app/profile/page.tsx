import { redirect } from "next/navigation"
import { authServer } from "@/lib/auth/server"
import { PublicShell } from "@/components/platform/PublicShell"
import Link from "next/link"
import { User, LayoutDashboard, Search, Home, Sparkles } from "lucide-react"

export default async function ProfilePage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/profile")
  const { user } = session.data
  const displayName = user.name || user.email?.split("@")[0] || "Member"
  const email = user.email ?? ""

  const shortcuts = [
    {
      href: "/dashboard",
      title: "Buyer dashboard",
      desc: "Saved homes, offers, and documents",
      icon: LayoutDashboard,
      style: "from-[#e0511f] to-[#c8451a] text-white shadow-lg shadow-[#e0511f]/25",
    },
    {
      href: "/search",
      title: "Browse properties",
      desc: "Verified inventory across cities",
      icon: Search,
      style: "border border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#e0511f]/25 hover:shadow-md",
    },
  ] as const

  return (
    <PublicShell>
      <div className="relative min-h-screen overflow-hidden pb-20 pt-6 sm:px-6 sm:pt-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#e0511f]/[0.07] via-[#0f766e]/[0.04] to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="emz-hero-bento mb-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e0511f] to-[#0f4ec4] text-white shadow-lg shadow-[#e0511f]/30">
                <User className="h-9 w-9" strokeWidth={1.75} />
              </div>
              <div>
                <span className="emz-section-eyebrow !text-[10px]">
                  <Sparkles className="h-3 w-3" />
                  Your account
                </span>
                <h1 className="mt-2 font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a] sm:text-4xl">{displayName}</h1>
                <p className="mt-1 text-sm text-[#64748b]">{email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] px-3 py-1 text-xs font-semibold text-[#059669] ring-1 ring-[#bbf7d0]">
                <Home className="h-3.5 w-3.5" strokeWidth={2.5} />
                Verified access
              </span>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="emz-rich-card md:col-span-2 p-8">
              <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[#0f172a]">Account details</h2>
              <p className="mt-1 text-sm text-[#64748b]">Information from your sign-in provider</p>
              <div className="mt-8 space-y-5">
                <div className="flex flex-col gap-1 border-b border-[#e2e8f0]/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-[#64748b]">Display name</span>
                  <span className="text-sm font-semibold text-[#0f172a]">{user.name || "Not set"}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-[#64748b]">Email</span>
                  <span className="break-all text-sm font-semibold text-[#0f172a]">{email || "—"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {shortcuts.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`group flex items-start gap-4 rounded-2xl p-5 transition ${s.style}`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      s.href === "/dashboard" ? "bg-white/15" : "bg-[#f8fafc] text-[#e0511f] group-hover:bg-[#e0511f]/8"
                    }`}
                  >
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-[15px] font-bold">{s.title}</span>
                    <span className={`mt-0.5 block text-xs ${s.href === "/dashboard" ? "text-white/85" : "text-[#64748b]"}`}>
                      {s.desc}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  )
}
