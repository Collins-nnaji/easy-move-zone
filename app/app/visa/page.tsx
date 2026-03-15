import { FileBadge, ShieldAlert, CheckCircle2, ChevronRight, Download } from "lucide-react"

export default function AppVisaIntelligencePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Visa Intelligence</h1>
        <p className="text-slate-400">Your tailored immigration pathways based on your citizenship and target destinations.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Status */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-[#00D4FF]/20 to-transparent border border-[#00D4FF]/30 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-[#00D4FF] text-[#0A0F1E] font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest mb-3 inline-block">Primary Target</span>
                <h2 className="text-3xl font-bold font-[var(--font-playfair)]">UK Tech Nation Visa</h2>
                <p className="text-slate-300 mt-1">Global Talent Route</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#0A0F1E] border border-white/20 flex items-center justify-center shrink-0">
                <FileBadge className="text-[#00D4FF]" />
              </div>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/10 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Application Readiness</span>
                <span className="font-bold text-[#00D4FF]">75%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#00D4FF] rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-2">Requirements</h3>
              {[
                { label: "Personal Statement", status: "complete" },
                { label: "CV & Proof of Employment", status: "complete" },
                { label: "3 Letters of Recommendation", status: "pending", note: "Waiting on 1 signature" },
                { label: "Evidence of Innovation", status: "complete" },
                { label: "English Assessment", status: "not_started", note: "Requires booking" },
              ].map((req, i) => (
                <div key={i} className="flex items-start gap-4 p-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-colors">
                  <div className="mt-0.5">
                    {req.status === 'complete' && <CheckCircle2 className="text-green-400" size={18} />}
                    {req.status === 'pending' && <ShieldAlert className="text-amber-400" size={18} />}
                    {req.status === 'not_started' && <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-600" />}
                  </div>
                  <div>
                    <p className={`font-medium ${req.status === 'complete' ? 'text-white text-opacity-80' : 'text-white'}`}>{req.label}</p>
                    {req.note && <p className="text-xs text-slate-400 mt-0.5">{req.note}</p>}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 bg-[#00D4FF] text-[#0A0F1E] font-bold py-3 rounded-xl hover:bg-white transition-colors text-sm">
              Upload Missing Documents
            </button>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4">Alternative Pathways</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <div>
                  <h4 className="font-medium">Singapore ONE Pass</h4>
                  <p className="text-xs text-slate-400 mt-1">High probability based on salary</p>
                </div>
                <ChevronRight size={18} className="text-slate-500" />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <div>
                  <h4 className="font-medium">Dubai Golden Visa</h4>
                  <p className="text-xs text-slate-400 mt-1">Accessible via property investment</p>
                </div>
                <ChevronRight size={18} className="text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-4">Passport Power</h3>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400">Current</span>
              <span className="font-bold flex items-center gap-2">🇺🇸 United States</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400">Visa-Free Score</span>
              <span className="font-bold">189 Countries</span>
            </div>
            <div className="p-4 bg-white/5 rounded-xl mt-6">
              <p className="text-sm text-slate-300">Your US passport provides excellent mobility, but long-term residency in Europe will require formal sponsorship.</p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <div className="space-y-3">
              <button className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-300 text-left">
                UK Tier 1 Checklist <Download size={14} className="text-slate-500" />
              </button>
              <button className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-300 text-left">
                Tax Implications PDF <Download size={14} className="text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
