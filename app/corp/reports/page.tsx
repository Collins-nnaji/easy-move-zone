import { Download, FileBarChart, PieChart } from "lucide-react"

export default function CorpReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Board Reports</h1>
        <p className="text-slate-400">Generate executive summaries of mobility costs, location strategies, and tax exposures.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-6 group hover:border-[#D4A843]/50 transition-colors cursor-pointer">
          <div className="h-12 w-12 rounded-2xl bg-[#D4A843]/20 flex items-center justify-center mb-6">
            <PieChart className="text-[#D4A843]" />
          </div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-[#D4A843] transition-colors">Quarterly Mobility Spend</h2>
          <p className="text-sm text-slate-400 mb-6">Comprehensive breakdown of sunk costs vs active salaries across all physical hubs.</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-500">PDF Excel</span>
            <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group-hover:bg-[#D4A843] group-hover:text-[#0A0F1E]">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-6 group hover:border-[#D4A843]/50 transition-colors cursor-pointer">
          <div className="h-12 w-12 rounded-2xl bg-[#D4A843]/20 flex items-center justify-center mb-6">
            <FileBarChart className="text-[#D4A843]" />
          </div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-[#D4A843] transition-colors">Compliance Audit</h2>
          <p className="text-sm text-slate-400 mb-6">Current snapshot of right-to-work statuses, permanent establishment risks, and local tax standing.</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-500">PDF</span>
            <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group-hover:bg-[#D4A843] group-hover:text-[#0A0F1E]">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-dashed border-white/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#D4A843]/50 transition-colors min-h-[280px]">
          <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center mb-4 bg-white/5">
            <FileBarChart className="text-slate-400" />
          </div>
          <p className="font-bold text-slate-300">Custom Report Builder</p>
          <p className="text-sm text-slate-500 mt-2">Combine specific metrics and regions</p>
        </div>
      </div>
    </div>
  )
}
