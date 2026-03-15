import Link from "next/link"
import { ArrowRight, Globe, Shield, Home, Briefcase, Zap, MapPin } from "lucide-react"

export default function AppCityScoresPage() {
  const cities = [
    { name: "Singapore", country: "Singapore", score: 92, match: "Excellent", metrics: { opportunity: 95, cost: 72, lifestyle: 88 } },
    { name: "Dubai", country: "United Arab Emirates", score: 88, match: "Great", metrics: { opportunity: 90, cost: 85, lifestyle: 80 } },
    { name: "London", country: "United Kingdom", score: 85, match: "Good", metrics: { opportunity: 92, cost: 65, lifestyle: 94 } },
    { name: "Austin", country: "United States", score: 82, match: "Good", metrics: { opportunity: 88, cost: 78, lifestyle: 85 } },
    { name: "Zurich", country: "Switzerland", score: 81, match: "Good", metrics: { opportunity: 94, cost: 60, lifestyle: 96 } },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Move Score™ Rankings</h1>
          <p className="text-slate-400 max-w-2xl">Based on your tech background and family priorities, here are your mathematically optimal destinations. Ready to move? We execute the transition end-to-end.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/app/services" className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors">
            Browse All Services
          </Link>
          <button className="bg-[#00D4FF] text-[#0A0F1E] font-bold px-5 py-2.5 rounded-xl hover:bg-white transition-colors flex items-center gap-2">
            <Zap size={16} /> Request Consultation
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {cities.map((city, i) => (
          <div key={i} className={`flex flex-col p-6 bg-slate-900/50 border rounded-3xl transition-colors group ${i === 0 ? 'border-[#00D4FF]/40 shadow-[0_0_20px_rgba(0,212,255,0.1)]' : 'border-white/10 hover:border-white/30'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                {i === 0 && <span className="bg-[#00D4FF]/20 text-[#00D4FF] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold mb-3 inline-block">Top Match</span>}
                <h3 className="text-2xl font-bold font-[var(--font-playfair)]">{city.name}</h3>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-1"><MapPin size={12}/> {city.country}</p>
              </div>
              
              <div className="text-center w-16 shrink-0">
                <div className="w-14 h-14 mx-auto relative flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className={i===0 ? "text-[#00D4FF]" : "text-slate-300"} strokeDasharray="150.7" strokeDashoffset={150.7 - (150.7 * city.score / 100)} strokeLinecap="round" />
                  </svg>
                  <span className={`font-bold relative z-10 ${i===0 ? 'text-[#00D4FF]' : ''}`}>{city.score}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6 flex-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Briefcase size={14} className="text-slate-500" /> Career Opps</span>
                <span className="font-semibold text-white">{city.metrics.opportunity}/100</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Globe size={14} className="text-slate-500" /> Cost of Living</span>
                <span className="font-semibold text-white">{city.metrics.cost}/100</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Home size={14} className="text-slate-500" /> Lifestyle & Safety</span>
                <span className="font-semibold text-white">{city.metrics.lifestyle}/100</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex gap-2">
              <Link href={`/app/city/${city.name.toLowerCase()}`} className="flex-1 text-center bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl border border-transparent transition-colors text-sm">
                Deep Dive
              </Link>
              <Link href="/app/services" className="bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 text-[#00D4FF] font-bold py-2.5 px-4 rounded-xl border border-transparent transition-colors text-sm flex items-center justify-center gap-1 group-hover:border-[#00D4FF]/30">
                Execute <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
        
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/20 rounded-3xl min-h-[300px]">
          <Shield className="text-slate-600 mb-4" size={40} />
          <h3 className="font-bold text-lg mb-2 text-slate-300">Unlock 75 More Cities</h3>
          <p className="text-sm text-slate-500 mb-6">Upgrade to EasyMove Pro to calculate your score across our entire global index.</p>
          <button className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors text-slate-300">
            View Upgrade Plans
          </button>
        </div>
      </div>
    </div>
  )
}
