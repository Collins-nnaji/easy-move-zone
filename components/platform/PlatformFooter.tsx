import Link from "next/link"

export function PlatformFooter() {
  return (
    <footer className="mt-14 border-t border-[#dbe4f0] bg-[#0b1020] text-[#dbeafe]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="font-[var(--font-playfair)] text-3xl font-bold text-white">
            EasyMoveZonne
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#60a5fa]">Find Your Territory. Make Your Move.</p>
          <p className="mt-4 max-w-md text-sm text-[#cbd5e1]">
            Destination intelligence and relocation support in one platform, from city scouting and listings to
            mortgage matching and move coordination.
          </p>
          <Link
            href="/relocate"
            className="emz-pill-cta mt-5 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
          >
            Open Relocate Hub
          </Link>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#93c5fd]">Platform</h4>
          <ul className="space-y-2 text-sm text-[#cbd5e1]">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/listings">Listings</Link></li>
            <li><Link href="/cities">Cities + Territory Intel</Link></li>
            <li><Link href="/relocate">Relocate Hub</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#93c5fd]">Account</h4>
          <ul className="space-y-2 text-sm text-[#cbd5e1]">
            <li><Link href="/contact">Get Help</Link></li>
            <li><Link href="/auth">Sign up / Sign in</Link></li>
            <li><Link href="/profile">Profile + Progress</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-xs text-[#94a3b8] sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <p>© {new Date().getFullYear()} EasyMoveZonne. All rights reserved.</p>
          <p>Lagos · Abuja · Accra · Nairobi · Kigali</p>
        </div>
      </div>
    </footer>
  )
}
