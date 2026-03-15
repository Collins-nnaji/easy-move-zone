import Link from "next/link"
import { ArrowLeft, Home, BookOpen, Briefcase, ChevronRight } from "lucide-react"

export default function AppCityDeepDivePage({ params }: { params: { id: string } }) {
  const cityName = params.id.charAt(0).toUpperCase() + params.id.slice(1).replace("-", " ")

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/app/scores" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Scores
      </Link>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <span className="bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest mb-4 inline-block">Deep Dive</span>
          <h1 className="text-4xl md:text-5xl font-[var(--font-playfair)] font-bold mb-2">{cityName}</h1>
          <p className="text-xl text-slate-400">Match Score: <span className="text-[#00D4FF] font-bold">92/100</span></p>
        </div>
        <button className="bg-[#00D4FF] text-[#0A0F1E] font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors">
          Add to Target List
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Home size={18} className="text-[#00D4FF]"/> Housing Market</h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">Avg 1BR Rent (City Centre)</span>
                <span className="font-bold">$2,850/mo</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">Avg 3BR Rent (Suburbs)</span>
                <span className="font-bold">$4,100/mo</span>
             </div>
             <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Supply Constraint</span>
                <span className="font-bold text-amber-400">High</span>
             </div>
           </div>
           <button className="w-full mt-6 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
             Connect with verified Housing Agent
           </button>
        </div>
        
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase size={18} className="text-[#00D4FF]"/> Job Market (Tech)</h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">Avg Senior Engineer Salary</span>
                <span className="font-bold">$135,000</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">Tech Sector Growth (YoY)</span>
                <span className="font-bold text-green-400">+12%</span>
             </div>
             <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Top Hiring Skill</span>
                <span className="font-bold">AI/Machine Learning</span>
             </div>
           </div>
           <button className="w-full mt-6 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
             View Opportunities
           </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#00D4FF]/10 to-transparent border border-[#00D4FF]/20 rounded-3xl p-8 mt-6">
        <h3 className="text-xl font-bold mb-4 font-[var(--font-playfair)]">Relocation Feasibility</h3>
        <p className="text-slate-300 mb-6 leading-relaxed">
          Based on your US Citizenship, the <strong className="text-white">Global Talent Visa</strong> is the most viable path requiring no prior job offer. The average application to approval timeline is currently estimated at 6-8 weeks for this jurisdiction.
        </p>
        <div className="flex items-center gap-4">
           <Link href="/app/visa" className="flex items-center gap-2 text-[#00D4FF] font-semibold hover:underline bg-[#00D4FF]/10 px-4 py-2 rounded-lg">
             Go to Visa Intelligence <ChevronRight size={16} />
           </Link>
        </div>
      </div>
    </div>
  )
}
