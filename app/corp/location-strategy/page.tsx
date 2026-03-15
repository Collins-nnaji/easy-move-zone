import Link from "next/link"
import { Globe, ArrowRight, Shield, Target, MapPin } from "lucide-react"

export default function CorpLocationStrategyPage() {
  const hubs = [
    { name: "Austin", country: "United States", score: 94, category: "Tech & Engineering", risk: "Low", cost: "High" },
    { name: "London", country: "United Kingdom", score: 88, category: "Finance & Fintech", risk: "Low", cost: "Very High" },
    { name: "Dubai", country: "United Arab Emirates", score: 85, category: "Sales & Regional HQ", risk: "Medium", cost: "High" },
    { name: "Bangalore", country: "India", score: 82, category: "Engineering Hub", risk: "Medium", cost: "Low" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Location Strategy</h1>
          <p className="text-slate-400">Data-driven city recommendations for your next office or remote hiring hub.</p>
        </div>
        <button className="bg-white/5 border border-white/10 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors shrink-0">
          Run Custom Scenario
        </button>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {hubs.map((hub, i) => (
          <div key={i} className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 hover:border-[#D4A843]/50 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A843] bg-[#D4A843]/10 px-2 py-1 rounded-md mb-3 inline-block">
                  {hub.category}
                </span>
                <h3 className="text-2xl font-bold font-[var(--font-playfair)] mb-1">{hub.name}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={14} /> {hub.country}</p>
              </div>
              <div className="text-center bg-[#0A0F1E] border border-white/10 rounded-xl p-3">
                <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Fit</span>
                <span className="text-xl font-bold text-[#D4A843]">{hub.score}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-3">
                <span className="text-xs text-slate-400 flex items-center gap-1 mb-1"><Target size={12}/> Talent Cost</span>
                <span className="font-semibold">{hub.cost}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <span className="text-xs text-slate-400 flex items-center gap-1 mb-1"><Shield size={12}/> Compliance Risk</span>
                <span className="font-semibold">{hub.risk}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">View Talent Map & Cost Model</span>
              <div className="w-8 h-8 rounded-full bg-[#D4A843]/10 text-[#D4A843] flex items-center justify-center group-hover:bg-[#D4A843] group-hover:text-[#0A0F1E] transition-colors">
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
