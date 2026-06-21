import { redirect } from "next/navigation"
import Link from "next/link"
import { requireAdmin } from "@/lib/auth/admin"
import { BookOpen, MapPin, Plane, Users } from "lucide-react"

export default async function AdminHomePage() {
  const admin = await requireAdmin()
  if (!admin) redirect("/auth?redirect=/admin")

  const cards = [
    { href: "/admin/users", title: "Users", desc: "Search accounts, verify agents", icon: Users },
    { href: "/admin/catalog", title: "Move catalog", desc: "Destinations, trips, stays, visas", icon: MapPin },
    { href: "/admin/guides", title: "Country guides", desc: "Edit Settle tab content in the Move app", icon: BookOpen },
    { href: "/admin/bookings", title: "Bookings", desc: "Trips, stays and visa reservations", icon: Plane },
  ] as const

  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-8">
      <h1 className="text-2xl font-bold">Admin home</h1>
      <p className="mt-1 text-sm text-white/50">Signed in as {admin.email}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#e0511f]/40 hover:bg-white/[0.06]"
          >
            <c.icon className="h-5 w-5 text-[#e0511f]" />
            <p className="mt-3 font-semibold">{c.title}</p>
            <p className="mt-1 text-sm text-white/50">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
