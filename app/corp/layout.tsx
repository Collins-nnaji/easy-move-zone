import { ReactNode } from "react"
import Link from "next/link"
import { Building2, Globe, Users2, Calculator, ShieldCheck, FileDown, Settings, LogOut } from "lucide-react"

export default function CorporateAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0A0F1E] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-900/40 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-[var(--font-playfair)] text-xl font-bold tracking-tight text-white">
              EasyMove<span className="text-[#D4A843]">Zone</span>
            </span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A843] mt-1 block">
            CORPORATE
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/corp/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#D4A843]/10 text-[#D4A843] font-medium">
            <Building2 size={18} /> Command Centre
          </Link>
          <Link href="/corp/location-strategy" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            <Globe size={18} /> Location Strategy
          </Link>
          <Link href="/corp/talent-maps" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            <Users2 size={18} /> Talent Hubs
          </Link>
          <Link href="/corp/cost-model" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            <Calculator size={18} /> Cost Modeling
          </Link>
          <Link href="/corp/compliance" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            <ShieldCheck size={18} /> Tax & Compliance
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white transition-colors text-sm">
            <Settings size={16} /> Org Settings
          </Link>
          <Link href="/auth" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors text-sm">
            <LogOut size={16} /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 sticky top-0 bg-[#0A0F1E]/80 backdrop-blur-md z-10">
          <h2 className="font-semibold text-lg">Expansion Overview</h2>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#D4A843]/20 flex items-center justify-center text-[#D4A843] text-sm font-bold border border-[#D4A843]/40">
              HQ
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
