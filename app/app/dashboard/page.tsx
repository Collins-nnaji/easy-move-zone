import Link from "next/link"
import { ArrowRight, Plane, Building, Activity, FileCheck } from "lucide-react"

export default function IndividualDashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header className="mb-8">
        <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Welcome back. Your Move Score™ looks strong today.</h1>
        <p className="text-slate-400">Based on your conservative risk appetite, we've updated your top city recommendations.</p>
      </header>

      {/* Hero Widget */}
      <div className="bg-gradient-to-br from-[#00D4FF]/20 to-transparent border border-[#00D4FF]/30 rounded-3xl p-8 relative overflow-hidden">
        <div className="relative z-10 w-full md:w-2/3">
          <span className="bg-[#00D4FF] text-[#0A0F1E] font-bold px-3 py-1 rounded-full text-xs mb-4 inline-block">Top Match</span>
          <h2 className="text-4xl font-black mb-2">Singapore</h2>
          <p className="text-[#00D4FF] text-xl font-[var(--font-playfair)] mb-6">Score: 92/100</p>
          <p className="text-slate-300 mb-6 leading-relaxed">
            Singapore perfectly aligns with your desire for high safety and family-friendly infrastructure, while maintaining robust tech opportunities. 
          </p>
          <div className="flex gap-4">
            <button className="bg-[#00D4FF] text-[#0A0F1E] font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors">
              View City Deep Dive
            </button>
            <button className="bg-black/40 border border-[#00D4FF]/40 text-white font-medium px-6 py-3 rounded-xl hover:bg-black/60 transition-colors">
              Compare Market
            </button>
          </div>
        </div>
        <Plane className="absolute -right-10 -bottom-10 w-64 h-64 text-[#00D4FF]/10 z-0" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Next Steps */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 lg:col-span-2">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity className="text-[#00D4FF]" size={20}/> Arrival Blueprint Tasks</h3>
          <div className="space-y-3">
            {[
              { title: "Review Visa Strategy", due: "This week", status: "pending" },
              { title: "Connect with relocation expert", due: "Next week", status: "locked" },
              { title: "Compare residential districts", due: "In 2 weeks", status: "locked" }
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'pending' ? 'border-[#00D4FF]' : 'border-slate-500'}`}>
                    {task.status === 'pending' && <div className="w-2.5 h-2.5 bg-[#00D4FF] rounded-full" />}
                  </div>
                  <span className={task.status === 'locked' ? 'text-slate-400' : 'text-white font-medium'}>{task.title}</span>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{task.due}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FileCheck className="text-[#00D4FF]" size={20}/> Compliance</h3>
            <p className="text-sm text-slate-400 mb-4">You have 1 pending document required for your UK Tech Nation visa assessment.</p>
            <Link href="/app/visa" className="text-[#00D4FF] font-semibold text-sm hover:underline flex items-center gap-1">Update Documents <ArrowRight size={14} /></Link>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Building className="text-[#00D4FF]" size={20}/> Saved Agents</h3>
            <p className="text-sm text-slate-400 mb-4">No agents saved yet. Explore the city metrics to find local experts.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
