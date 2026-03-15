import { Users2, MapPin, Search, ArrowUpRight } from "lucide-react"

export default function CorpTalentMapsPage() {
  const hubs = [
    { city: "Austin, TX", engineers: 45000, growth: "+14%", avgSalary: "$135k", competition: "High" },
    { city: "London, UK", engineers: 120000, growth: "+8%", avgSalary: "£85k", competition: "Very High" },
    { city: "Toronto, CA", engineers: 85000, growth: "+12%", avgSalary: "$105k CAD", competition: "High" },
    { city: "Lisbon, PT", engineers: 15000, growth: "+22%", avgSalary: "€45k", competition: "Medium" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Talent Heatmaps</h1>
          <p className="text-slate-400">Identify regions with high concentrations of your target skillsets.</p>
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search roles (e.g. AI Engineer)" 
            className="w-full bg-slate-900/80 border border-white/20 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#D4A843]"
          />
        </div>
      </header>

      {/* Map visual placeholder */}
      <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-1 h-[400px] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        {/* Abstract map representation */}
        <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
          <div className="absolute text-center" style={{ top: '30%', left: '20%' }}>
            <div className="w-12 h-12 rounded-full bg-[#D4A843]/30 border border-[#D4A843] animate-pulse flex items-center justify-center mx-auto mb-1">
              <div className="w-2 h-2 rounded-full bg-[#D4A843]" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-300">Austin Hub</span>
          </div>
          <div className="absolute text-center" style={{ top: '25%', left: '45%' }}>
            <div className="w-16 h-16 rounded-full bg-[#D4A843]/30 border border-[#D4A843] animate-pulse flex items-center justify-center mx-auto mb-1">
              <div className="w-3 h-3 rounded-full bg-[#D4A843]" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-300">London Hub</span>
          </div>
          <div className="absolute text-center" style={{ top: '40%', left: '60%' }}>
            <div className="w-8 h-8 rounded-full bg-[#D4A843]/30 border border-[#D4A843] animate-pulse flex items-center justify-center mx-auto mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-300">Dubai Hub</span>
          </div>
        </div>
        <div className="absolute inset-x-8 bottom-8 flex justify-between items-end">
          <div className="bg-[#0A0F1E] border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-md">
            <h3 className="font-bold mb-1 flex items-center gap-2"><Users2 size={16} className="text-[#D4A843]" /> Global Software Engineering</h3>
            <p className="text-xs text-slate-400">Density mapping for senior engineering roles.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold">Top Emerging Hubs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">City</th>
                  <th className="px-6 py-4 font-medium">Est. Pool</th>
                  <th className="px-6 py-4 font-medium">YoY Growth</th>
                  <th className="px-6 py-4 font-medium">Avg Salary</th>
                  <th className="px-6 py-4 font-medium">Competition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {hubs.map((hub, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                       {hub.city}
                       <ArrowUpRight size={14} className="text-[#D4A843] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                    <td className="px-6 py-4">{hub.engineers.toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-400">{hub.growth}</td>
                    <td className="px-6 py-4">{hub.avgSalary}</td>
                    <td className="px-6 py-4">
                      <span className="bg-white/10 px-2 py-1 rounded-md text-xs">{hub.competition}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#D4A843]/10 to-transparent border border-[#D4A843]/20 rounded-3xl p-6 h-fit">
           <h3 className="font-bold mb-4">Competitor Saturation</h3>
           <p className="text-sm text-slate-300 mb-6">
             London shows the highest concentration of Tier-1 competitors, making hiring more expensive and retention harder. Explore Lisbon for an aggressive emerging market strategy.
           </p>
           <button className="w-full bg-[#D4A843] text-[#0A0F1E] font-bold py-3 rounded-xl hover:bg-white transition-colors text-sm">
             Generate deep analysis
           </button>
        </div>
      </div>
    </div>
  )
}
