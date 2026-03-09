import Link from "next/link"

export function PlatformFooter() {
  return (
    <footer className="mt-12 border-t border-[#f5f0e8]/10 bg-[#0d0d0d] text-[#f5f0e8]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="font-[var(--font-playfair)] text-2xl font-black">
            Easy<span className="text-[#c9a84c]">Move</span>Zone
          </div>
          <p className="mt-3 max-w-md text-sm text-[#f5f0e8]/60">
            Tech-enabled property search and acquisition for people on the move across Nigeria and
            key African cities.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5f0e8]/45">Pages</h4>
          <ul className="space-y-2 text-sm text-[#f5f0e8]/70">
            <li><Link href="/services">Listings</Link></li>
            <li><Link href="/intelligence">Neighbourhood Intel</Link></li>
            <li><Link href="/markets">Cities</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5f0e8]/45">Company</h4>
          <ul className="space-y-2 text-sm text-[#f5f0e8]/70">
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/auth">Sign up / Sign in</Link></li>
            <li><Link href="/dashboard/client">Client Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#f5f0e8]/10 px-4 py-4 text-xs text-[#f5f0e8]/40 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <p>© {new Date().getFullYear()} EasyMoveZone Property Finder. All rights reserved.</p>
          <p>Lagos · Abuja · Accra · Nairobi</p>
        </div>
      </div>
    </footer>
  )
}
