import Link from "next/link"
import { Users, FileText, Globe2, BarChart4, ArrowUpRight } from "lucide-react"

export default function CorporateDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Expansion Command Centre</h1>
          <p className="text-slate-400">Manage your global workforce locations and track compliance risks.</p>
        </div>
        <button className="bg-[#D4A843] text-[#0A0F1E] font-bold px-6 py-2.5 rounded-xl hover:bg-white transition-colors shrink-0">
          New Market Analysis
        </button>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Locations", value: "4", trend: "+1", icon: Globe2 },
          { label: "Managed Talent", value: "28", trend: "+12%", icon: Users },
          { label: "Cost Savings", value: "$142k", trend: "+8%", icon: BarChart4 },
          { label: "Compliance Alerts", value: "1", trend: "Review", icon: FileText, alert: true },
        ].map((stat, i) => (
          <div key={i} className={`bg-slate-900/50 border rounded-2xl p-5 ${stat.alert ? 'border-red-500/50' : 'border-white/10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
                <stat.icon size={20} className={stat.alert ? "text-red-400" : ""} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-green-500/20 text-green-400' :
                stat.alert ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold font-[var(--font-playfair)]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Market Matches */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recommended Talent Hubs</h3>
            <Link href="/corp/location-strategy" className="text-sm font-semibold text-[#D4A843] hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {[
              { city: "Austin, USA", score: 94, talent: "High", cost: "$$$", risk: "Low" },
              { city: "London, UK", score: 88, talent: "Very High", cost: "$$$$", risk: "Low" },
              { city: "Dubai, UAE", score: 85, talent: "Medium", cost: "$$$", risk: "Low" },
            ].map((market, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors gap-4 cursor-pointer">
                <div>
                  <h4 className="font-bold text-lg">{market.city}</h4>
                  <div className="flex gap-4 text-xs text-slate-400 mt-1">
                    <span>Talent Pool: <span className="text-white">{market.talent}</span></span>
                    <span>Cost: <span className="text-white">{market.cost}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Fit Score</p>
                    <p className="text-xl font-bold text-[#D4A843]">{market.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#D4A843]/20 to-transparent border border-[#D4A843]/30 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-2">Cost Modeling Ready</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              We've processed the latest tax regulations for Singapore and Dubai. Your custom cost model is ready for review.
            </p>
            <button className="w-full bg-[#D4A843] text-[#0A0F1E] font-bold py-3 rounded-xl hover:bg-white transition-colors">
              Open Calculator
            </button>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/corp/employees" className="block p-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-slate-300">
                Manage Relocating Employees
              </Link>
              <Link href="/corp/reports" className="block p-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-slate-300">
                Download Board Reports
              </Link>
              <Link href="/profile" className="block p-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-slate-300">
                Invite Team Members
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
