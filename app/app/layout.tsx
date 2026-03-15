import { ReactNode } from "react"
import Link from "next/link"
import { LayoutDashboard, Map, Briefcase, FileText, Settings, LogOut, FileBadge } from "lucide-react"

export default function IndividualAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0A0F1E] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-900/40 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-[var(--font-playfair)] text-xl font-bold tracking-tight text-white">
              EasyMove<span className="text-[#00D4FF]">Zone</span>
            </span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00D4FF] mt-1 block">
            INDIVIDUAL
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/app/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] font-medium">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/app/scores" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            <Map size={18} /> City Scores
          </Link>
          <Link href="/app/blueprint" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            <FileText size={18} /> 90-Day Blueprint
          </Link>
          <Link href="/app/visa" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            <FileBadge size={18} /> Visa Intelligence
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white transition-colors text-sm">
            <Settings size={16} /> Workspace Settings
          </Link>
          <Link href="/auth" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors text-sm">
            <LogOut size={16} /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 sticky top-0 bg-[#0A0F1E]/80 backdrop-blur-md z-10">
          <h2 className="font-semibold text-lg">Your Move Command</h2>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] text-sm font-bold border border-[#00D4FF]/40">
              IN
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
