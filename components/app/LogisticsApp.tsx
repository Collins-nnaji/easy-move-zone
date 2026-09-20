"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowRight, Package, Plane, Ship, Truck } from "lucide-react"
import { MoveAppShell } from "@/app/move/MoveAppShell"
import type { AccountRole } from "@/lib/auth/roles"
import { CORRIDORS } from "@/lib/logistics/catalog"

const PRIMARY = "#e0511f"

type Screen =
  | "home"
  | "shipments"
  | "quote"
  | "docs"
  | "legs"
  | "pay"
  | "settings"
  | "shifts"
  | "schedule"
  | "wallet"
  | "vault"
  | "dashboard"
  | "jobs"
  | "history"
  | "drivers"
  | "welcome"
  | "setup"
  | "vehicle"

type LogisticsAppProps = {
  roles: AccountRole[]
  primaryRole: AccountRole
  userName: string | null
  userEmail: string | null
}

function screenFromPath(pathname: string): Screen {
  const rest = pathname.replace(/^\/app\/?/, "").split("/")[0] || "home"
  const map: Record<string, Screen> = {
    "": "home",
    home: "home",
    shipments: "shipments",
    quote: "quote",
    docs: "docs",
    legs: "legs",
    pay: "pay",
    settings: "settings",
    // legacy move paths
    shifts: "legs",
    schedule: "legs",
    wallet: "pay",
    vault: "docs",
    vehicle: "settings",
    setup: "settings",
    welcome: "home",
    // legacy fleet paths
    dashboard: "home",
    jobs: "shipments",
    history: "shipments",
    drivers: "settings",
    post: "quote",
    loads: "shipments",
  }
  return map[rest] ?? "home"
}

function buildPath(screen: Screen, role: AccountRole): string {
  if (role === "driver") {
    switch (screen) {
      case "legs":
      case "shifts":
      case "schedule":
        return "/app/legs"
      case "pay":
      case "wallet":
        return "/app/pay"
      case "docs":
      case "vault":
        return "/app/docs"
      case "settings":
        return "/app/settings"
      default:
        return "/app/legs"
    }
  }
  switch (screen) {
    case "shipments":
    case "jobs":
    case "history":
      return "/app/shipments"
    case "quote":
      return "/app/quote"
    case "docs":
    case "vault":
      return "/app/docs"
    case "settings":
    case "drivers":
      return "/app/settings"
    default:
      return "/app"
  }
}

const DEMO_SHIPMENTS = [
  {
    ref: "EMZ-NG-1001",
    lane: "Lagos → Rotterdam",
    mode: "Sea",
    status: "In transit",
    Icon: Ship,
  },
  {
    ref: "EMZ-NG-1002",
    lane: "Guangzhou → Lagos",
    mode: "Air",
    status: "Customs",
    Icon: Plane,
  },
]

export function LogisticsApp({ roles, primaryRole, userName, userEmail }: LogisticsAppProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<AccountRole>(primaryRole)
  const [screen, setScreen] = useState<Screen>(() => screenFromPath(pathname))

  useEffect(() => {
    setScreen(screenFromPath(pathname))
  }, [pathname])

  const onNavigate = useCallback(
    (next: string) => {
      const path = buildPath(next as Screen, role)
      setScreen(next as Screen)
      router.push(path)
    },
    [role, router],
  )

  const tabs = useMemo(() => {
    if (role === "driver") {
      return [
        { label: "Legs", shortLabel: "Legs", screens: ["legs", "shifts", "schedule"], go: "legs" },
        { label: "Pay", shortLabel: "Pay", screens: ["pay", "wallet"], go: "pay" },
        { label: "Docs", shortLabel: "Docs", screens: ["docs", "vault"], go: "docs" },
        { label: "Settings", shortLabel: "More", screens: ["settings"], go: "settings" },
      ]
    }
    return [
      { label: "Home", shortLabel: "Home", screens: ["home", "dashboard", "welcome"], go: "home" },
      { label: "Shipments", shortLabel: "Ship", screens: ["shipments", "jobs", "history"], go: "shipments" },
      { label: "Quote", shortLabel: "Quote", screens: ["quote"], go: "quote" },
      { label: "Docs", shortLabel: "Docs", screens: ["docs", "vault"], go: "docs" },
      { label: "Settings", shortLabel: "More", screens: ["settings", "drivers"], go: "settings" },
    ]
  }, [role])

  const displayName = userName?.split(" ")[0] || userEmail?.split("@")[0] || "there"

  function screenBody() {
    if (role === "driver") {
      switch (screen) {
        case "pay":
        case "wallet":
          return (
            <div className="move-page-inner">
              <div className="move-page-screen">
              <h1 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.015em", margin: 0 }}>Payouts</h1>
              <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>Carrier earnings for completed inland legs release here.</p>
              <div className="mt-6 rounded-2xl border border-[#e4dfd5] bg-white p-5">
                <div className="text-sm text-[#6e746b]">Available</div>
                <div className="mt-1 text-3xl font-extrabold">₦0</div>
                <p className="mt-3 text-sm text-[#5f655c]">
                  Assigned legs will show payout milestones after pickup and delivery confirmation.
                </p>
              </div>
              </div>
            </div>
          )
        case "docs":
        case "vault":
          return (
            <div className="move-page-inner">
            <div className="move-page-screen">
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Documents</h1>
              <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>Licence, insurance, and compliance files for carrier legs.</p>
              <Link
                href="/profile/driver"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold"
                style={{ color: PRIMARY }}
              >
                Open document vault
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            </div>
          )
        case "settings":
          return <SettingsScreen roles={roles} role={role} setRole={setRole} />
        default:
          return (
            <div className="move-page-inner">
            <div className="move-page-screen">
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Assigned legs</h1>
              <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>Road and port legs assigned to you as a carrier.</p>
              <div className="mt-6 rounded-2xl border border-dashed border-[#d8d2c6] bg-white/60 p-8 text-center">
                <Truck className="mx-auto h-8 w-8" style={{ color: PRIMARY }} />
                <p className="mt-3 text-sm font-semibold text-[#5f655c]">No active legs yet</p>
                <p className="mt-1 text-xs text-[#8a8f86]">Ops will assign inland or port runs here.</p>
              </div>
            </div>
            </div>
          )
      }
    }

    switch (screen) {
      case "shipments":
      case "jobs":
      case "history":
        return (
          <div className="move-page-inner">
          <div className="move-page-screen">
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Shipments</h1>
            <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>Active export and import moves.</p>
            <div className="mt-6 space-y-3">
              {DEMO_SHIPMENTS.map((s) => (
                <Link
                  key={s.ref}
                  href={`/track?ref=${s.ref}`}
                  className="flex items-center gap-4 rounded-2xl border border-[#e4dfd5] bg-white px-4 py-4 transition hover:border-[#e0511f]/35"
                >
                  <s.Icon className="h-6 w-6 shrink-0" style={{ color: PRIMARY }} />
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold tracking-tight">{s.ref}</div>
                    <div className="text-sm text-[#5f655c]">
                      {s.lane} · {s.mode}
                    </div>
                  </div>
                  <div className="text-xs font-bold" style={{ color: PRIMARY }}>
                    {s.status}
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/track"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold"
              style={{ color: PRIMARY }}
            >
              Public track page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          </div>
        )
      case "quote":
        return (
          <div className="move-page-inner">
          <div className="move-page-screen">
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>New quote</h1>
            <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>Request rates for export from Nigeria or import into Nigeria.</p>
            <Link
              href="/quote"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white"
              style={{ background: PRIMARY }}
            >
              Open quote form
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-8">
              <div className="text-xs font-bold uppercase tracking-wide text-[#8a8f86]">Corridors</div>
              <ul className="mt-3 space-y-2">
                {CORRIDORS.slice(0, 4).map((c) => (
                  <li key={c.key} className="text-sm text-[#5f655c]">
                    <span className="font-semibold text-[#1b231e]">{c.label}</span> — {c.hubs}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </div>
        )
      case "docs":
      case "vault":
        return (
          <div className="move-page-inner">
          <div className="move-page-screen">
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Documents</h1>
            <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>Commercial invoices, packing lists, and clearance files.</p>
            <Link
              href="/profile/company"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold"
              style={{ color: PRIMARY }}
            >
              Company document vault
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          </div>
        )
      case "settings":
      case "drivers":
        return <SettingsScreen roles={roles} role={role} setRole={setRole} />
      default:
        return (
          <div className="move-page-inner">
          <div className="move-page-screen">
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Welcome, {displayName}</h1>
            <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>
              Your EasyMoveZone logistics portal — shipments, quotes, and documents in one place.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onNavigate("quote")}
                className="rounded-2xl border border-[#e4dfd5] bg-white p-5 text-left transition hover:border-[#e0511f]/40"
              >
                <Package className="h-6 w-6" style={{ color: PRIMARY }} />
                <div className="mt-3 font-extrabold">Request a quote</div>
                <div className="mt-1 text-sm text-[#5f655c]">Export or import freight</div>
              </button>
              <button
                type="button"
                onClick={() => onNavigate("shipments")}
                className="rounded-2xl border border-[#e4dfd5] bg-white p-5 text-left transition hover:border-[#e0511f]/40"
              >
                <Ship className="h-6 w-6" style={{ color: PRIMARY }} />
                <div className="mt-3 font-extrabold">View shipments</div>
                <div className="mt-1 text-sm text-[#5f655c]">Track active moves</div>
              </button>
            </div>

            <div className="mt-8">
              <div className="text-xs font-bold uppercase tracking-wide text-[#8a8f86]">Active</div>
              <div className="mt-3 space-y-2">
                {DEMO_SHIPMENTS.map((s) => (
                  <div
                    key={s.ref}
                    className="flex items-center justify-between rounded-xl border border-[#e4dfd5] bg-white px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-bold">{s.ref}</div>
                      <div className="text-xs text-[#6e746b]">{s.lane}</div>
                    </div>
                    <span className="text-xs font-bold" style={{ color: PRIMARY }}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )
    }
  }

  return (
    <MoveAppShell
      showNav
      tabs={tabs}
      screen={screen}
      onNavigate={onNavigate}
      appRole={role === "driver" ? "driver" : "fleet"}
      appLabel={role === "driver" ? "Carrier" : "Shipper"}
      appHomeHref={role === "driver" ? "/app/legs" : "/app"}
      destCity="Nigeria"
      destCountry="↔ World"
      meterLabel="Portal"
      meterSub={role === "driver" ? "Carrier workspace" : "Shipper workspace"}
      screenOrder={
        role === "driver"
          ? ["legs", "pay", "docs", "settings"]
          : ["home", "shipments", "quote", "docs", "settings"]
      }
      modals={null}
    >
      {screenBody()}
    </MoveAppShell>
  )
}

function SettingsScreen({
  roles,
  role,
  setRole,
}: {
  roles: AccountRole[]
  role: AccountRole
  setRole: (r: AccountRole) => void
}) {
  return (
    <div className="move-page-inner">
    <div className="move-page-screen">
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Settings</h1>
      <p style={{ fontSize: 14, color: "#5f655c", margin: "8px 0 0" }}>Workspace and profile.</p>

      {roles.length > 1 && (
        <div className="mt-6">
          <div className="text-xs font-bold uppercase tracking-wide text-[#8a8f86]">Workspace</div>
          <div className="mt-2 flex gap-2">
            {roles.includes("company") && (
              <button
                type="button"
                onClick={() => setRole("company")}
                className="rounded-full px-4 py-2 text-sm font-bold"
                style={
                  role === "company"
                    ? { background: PRIMARY, color: "#fff" }
                    : { background: "#fff", border: "1px solid #d8d2c6", color: "#4a5047" }
                }
              >
                Shipper
              </button>
            )}
            {roles.includes("driver") && (
              <button
                type="button"
                onClick={() => setRole("driver")}
                className="rounded-full px-4 py-2 text-sm font-bold"
                style={
                  role === "driver"
                    ? { background: PRIMARY, color: "#fff" }
                    : { background: "#fff", border: "1px solid #d8d2c6", color: "#4a5047" }
                }
              >
                Carrier
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 space-y-3">
        <Link href="/profile" className="block text-sm font-bold" style={{ color: PRIMARY }}>
          Account hub →
        </Link>
        <Link href="/quote" className="block text-sm font-semibold text-[#5f655c]">
          Public quote form
        </Link>
        <Link href="/track" className="block text-sm font-semibold text-[#5f655c]">
          Track shipment
        </Link>
        <Link href="/" className="block text-sm font-semibold text-[#5f655c]">
          Marketing site
        </Link>
      </div>
    </div>
    </div>
  )
}
