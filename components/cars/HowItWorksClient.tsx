import Link from "next/link"

const STEPS = [
  {
    title: "Find Your Car",
    text: "Browse available vehicles and filter them around your needs — including UK stock, imports in transit, and CFR cars from abroad.",
  },
  {
    title: "Choose How to Pay",
    text: "Pay outright or explore available finance options.",
  },
  {
    title: "Part Exchange",
    text: "Have a current vehicle? Get a valuation and put it towards your next car.",
  },
  {
    title: "Complete Your Purchase",
    text: "We'll guide you through the remaining steps, including import duty and clearance on CFR vehicles.",
  },
  {
    title: "Collect or Arrange Delivery",
    text: "Get behind the wheel of your new car — from the forecourt or from the port.",
  },
]

export function HowItWorksClient() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h1>
      <p className="mt-3 max-w-xl text-[#5f655c]">
        Buying your next car shouldn&apos;t be complicated. EasyMoveZone is one place to move from your current car to
        your next one.
      </p>
      <ol className="mt-10 space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-3xl border border-[#e4dfd5] bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e0511f]">Step {i + 1}</p>
            <h2 className="mt-1 text-lg font-extrabold">{s.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#5f655c]">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/cars" className="rounded-2xl bg-[#e0511f] px-5 py-3 text-sm font-bold text-white">
          Browse cars
        </Link>
        <Link href="/cars?stockType=cfr" className="rounded-2xl border border-[#d8d2c6] bg-white px-5 py-3 text-sm font-semibold">
          Shop CFR imports
        </Link>
      </div>
    </div>
  )
}
