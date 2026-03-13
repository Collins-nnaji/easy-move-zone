import Link from "next/link"

export function PlatformFooter() {
  return (
    <footer className="mt-14 border-t border-[#dbe4f0] bg-[#0b1020] text-[#dbeafe]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="font-[var(--font-playfair)] text-2xl font-bold text-white sm:text-3xl">
            EasyMove<span className="text-[#60a5fa]">Zone</span>
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-[#93c5fd]/90">Find your territory. Make your move.</p>
          <p className="mt-4 max-w-md text-sm text-[#cbd5e1]">
            Destination intelligence and move support in one platform: city scouting, listings,
            mortgage matching, and a verified vendor marketplace for logistics and moving services.
          </p>
          <Link
            href="/hub"
            className="emz-pill-cta mt-5 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
          >
            The Hub
          </Link>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#93c5fd]">Platform</h4>
          <ul className="space-y-2 text-sm text-[#cbd5e1]">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/listings">Listings</Link></li>
            <li><Link href="/cities">Cities + Territory Intel</Link></li>
            <li><Link href="/hub">The Hub</Link></li>
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
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} EasyMoveZone. All rights reserved.</p>
          <p className="text-[10px] sm:text-xs">Lagos · Abuja · Accra · Nairobi · Kigali</p>
        </div>
      </div>
    </footer>
  )
}
