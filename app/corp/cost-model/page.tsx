import { Calculator, Plus, DollarSign, Download, PieChart, TrendingUp } from "lucide-react"

export default function CorpCostModelPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Relocation Cost Modeling</h1>
          <p className="text-slate-400">Estimate employer tax burdens and compare talent acquisition costs across hubs.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="bg-white/5 border border-white/10 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2">
            <Download size={16} /> Export Excel
          </button>
          <button className="bg-[#D4A843] text-[#0A0F1E] font-bold px-4 py-2.5 rounded-xl hover:bg-white transition-colors flex items-center gap-2">
            <Plus size={16} /> New Scenario
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Calculator size={18} className="text-[#D4A843]" /> Scenario Builder</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Market</label>
                <select className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4A843]">
                  <option>London, United Kingdom</option>
                  <option>Austin, USA</option>
                  <option>Dubai, UAE</option>
                  <option>Singapore</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Role Tier</label>
                <select className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4A843]">
                  <option>Senior Software Engineer</option>
                  <option>Director of Sales</option>
                  <option>Executive Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Base Salary Objective (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input type="number" defaultValue={150000} className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#D4A843]" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <button className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors text-sm">
                  Recalculate Model
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-[#0A0F1E] border border-[#D4A843]/30 rounded-2xl p-5 shadow-[0_0_15px_rgba(212,168,67,0.1)]">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Total Employer Cost</p>
              <p className="text-3xl font-[var(--font-playfair)] font-bold text-[#D4A843]">$178,500</p>
              <p className="text-[10px] text-slate-500 mt-2">Base + burdens</p>
            </div>
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Employer Taxes</p>
              <p className="text-2xl font-[var(--font-playfair)] font-bold text-white">13.8%</p>
              <p className="text-[10px] text-slate-500 mt-2">National Insurance</p>
            </div>
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Visa & Setup</p>
              <p className="text-2xl font-[var(--font-playfair)] font-bold text-white">$7,800</p>
              <p className="text-[10px] text-slate-500 mt-2">One-time sunk cost</p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2"><PieChart size={18} className="text-[#D4A843]"/> Cost Breakdown</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">Base Salary (Gross)</span>
                  <span className="font-bold">$150,000</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white text-opacity-80">Employer Contributions (Social/Tax)</span>
                  <span className="font-bold text-opacity-80">$20,700</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4A843] rounded-full" style={{ width: '11%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white text-opacity-60">Visa Sponsorship & Fees</span>
                  <span className="font-bold text-opacity-60">$7,800</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400/50 rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#D4A843]/10 to-transparent border border-[#D4A843]/20 rounded-3xl p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-[#D4A843]"/> Insight</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Moving this role to <strong className="text-white">Dubai, UAE</strong> would eliminate the 13.8% employer tax burden, resulting in a <strong className="text-green-400 text-lg">-$20,700/yr savings</strong> per headcount at this seniority level.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
