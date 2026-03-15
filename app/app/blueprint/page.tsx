import { CheckCircle2, Circle, Clock, ChevronRight, FileText, ArrowRight } from "lucide-react"

export default function AppBlueprintPage() {
  const blueprintPhases = [
    {
      title: "Phase 1: Pre-Departure (Days 1-30)",
      description: "Securing your legal right to work and initiating housing search.",
      status: "in-progress",
      tasks: [
        { label: "Submit Visa Application", status: "complete", date: "Oct 12" },
        { label: "Book Biometrics Appointment", status: "pending" },
        { label: "Draft accommodation budget", status: "not_started" },
        { label: "Schedule initial call with relocation agent", status: "not_started" },
      ]
    },
    {
      title: "Phase 2: Transition (Days 31-60)",
      description: "Finalizing logistics, packing, and temporary housing.",
      status: "locked",
      tasks: [
        { label: "Book flights", status: "locked" },
        { label: "Secure temporary housing (Airbnb/Hotel)", status: "locked" },
        { label: "Organize international shipping quotes", status: "locked" },
      ]
    },
    {
      title: "Phase 3: Arrival & Settlement (Days 61-90)",
      description: "Touching down, registering locally, and finding a long-term home.",
      status: "locked",
      tasks: [
        { label: "Collect BRP / Residence Card", status: "locked" },
        { label: "Open local bank account", status: "locked" },
        { label: "Register with local healthcare provider", status: "locked" },
        { label: "Sign long-term lease", status: "locked" },
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">90-Day Arrival Blueprint</h1>
          <p className="text-slate-400">Your step-by-step transition plan for relocating to London, UK.</p>
        </div>
        <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors">
          Download PDF Plan
        </button>
      </header>

      <div className="bg-gradient-to-br from-[#00D4FF]/20 to-transparent border border-[#00D4FF]/30 rounded-3xl p-6 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-[var(--font-playfair)] mb-1">Overall Progress</h2>
          <p className="text-sm text-slate-300">Phase 1 is currently active.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-[#00D4FF]">12%</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Completed</p>
        </div>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#00D4FF] before:via-slate-800 before:to-transparent">
        {blueprintPhases.map((phase, i) => (
          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline dot */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#0A0F1E] ${phase.status === 'in-progress' ? 'bg-[#00D4FF] text-[#0A0F1E]' : phase.status === 'locked' ? 'bg-slate-800 text-slate-400' : 'bg-green-500 text-white'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
              {phase.status === 'in-progress' ? <Clock size={20} /> : phase.status === 'locked' ? <Circle size={16} className="opacity-50" /> : <CheckCircle2 size={20} />}
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl">
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border inline-block mb-3 ${phase.status === 'in-progress' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                {phase.status === 'in-progress' ? 'Active Phase' : phase.status === 'locked' ? 'Locked' : 'Completed'}
              </span>
              <h3 className="text-xl font-bold mb-2">{phase.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{phase.description}</p>
              
              <div className="space-y-3">
                {phase.tasks.map((task, j) => (
                  <div key={j} className={`flex items-start gap-3 p-3 rounded-lg border ${task.status === 'complete' ? 'bg-green-500/10 border-green-500/20' : task.status === 'pending' ? 'bg-[#00D4FF]/10 border-[#00D4FF]/20 cursor-pointer hover:bg-[#00D4FF]/20 transition-colors' : 'bg-white/5 border-transparent opacity-50'}`}>
                    <div className="mt-0.5 shrink-0">
                      {task.status === 'complete' && <CheckCircle2 size={16} className="text-green-500" />}
                      {task.status === 'pending' && <Circle size={16} className="text-[#00D4FF]" />}
                      {task.status === 'not_started' && <Circle size={16} className="text-slate-500" />}
                      {task.status === 'locked' && <Circle size={16} className="text-slate-600" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${task.status === 'complete' ? 'text-green-100' : task.status === 'pending' ? 'text-white font-medium' : 'text-slate-300'}`}>{task.label}</p>
                    </div>
                    {task.date && <span className="text-[10px] text-green-400/80 uppercase font-bold whitespace-nowrap">{task.date}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
