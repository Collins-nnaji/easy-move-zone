import Link from "next/link"

export type JourneyStepKey = "home" | "cities" | "services" | "hub" | "profile"

interface JourneyStep {
  key: JourneyStepKey
  title: string
  label: string
  href: string
}

const STEPS: JourneyStep[] = [
  { key: "home", title: "Discover", label: "Home", href: "/" },
  { key: "cities", title: "Scout", label: "Cities", href: "/cities" },
  { key: "services", title: "Secure", label: "Services", href: "/services" },
  { key: "hub", title: "Settle", label: "The Hub", href: "/app/dashboard" },
  { key: "profile", title: "Track", label: "Profile", href: "/profile" },
]

export function JourneyFlowStrip({ current }: { current: JourneyStepKey }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current)
  const nextStep = currentIndex >= 0 ? STEPS[currentIndex + 1] : null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#155eef]">Scout → Secure → Settle journey</p>
          <div className="text-xs text-[#64748b]">
            {nextStep ? (
              <span>
                Next recommended step:{" "}
                <Link href={nextStep.href} className="font-semibold text-[#155eef] hover:underline">
                  {nextStep.label}
                </Link>
              </span>
            ) : (
              <span>
                Journey complete.{" "}
                <Link href="/" className="font-semibold text-[#155eef] hover:underline">
                  Start a new move plan
                </Link>
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          {STEPS.map((step, index) => {
            const isActive = step.key === current
            const isPassed = currentIndex > index
            return (
              <Link
                key={step.key}
                href={step.href}
                className={`rounded-xl border px-3 py-2 transition ${
                  isActive
                    ? "border-[#155eef] bg-[#eef4ff]"
                    : isPassed
                      ? "border-green-200 bg-green-50"
                      : "border-[#e8edf6] bg-[#f8fbff] hover:border-[#c8d8f0]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-[#155eef] text-white"
                        : isPassed
                          ? "bg-green-600 text-white"
                          : "bg-[#dbe4f0] text-[#334155]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{step.title}</p>
                </div>
                <p className={`mt-1 text-sm font-semibold ${isActive ? "text-[#155eef]" : "text-[#0f172a]"}`}>{step.label}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
