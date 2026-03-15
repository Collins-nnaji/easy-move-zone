import { ShieldAlert, AlertTriangle, CheckCircle, FileText, ChevronRight } from "lucide-react"

export default function CorpCompliancePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Tax & Compliance</h1>
        <p className="text-slate-400">Monitor local regulations, employment laws, and tax liabilities across your global footprint.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldAlert size={18} className="text-red-400" /> Active Risk Alerts</h2>
            
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-4">
                <AlertTriangle className="text-red-400 shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-bold text-red-200">UK: Right to Work Expiry</h3>
                  <p className="text-sm text-red-200/80 mt-1">Employee <strong className="text-red-100">Sarah Jenkins</strong> has a visa expiring in 45 days. Immediate sponsorship renewal required.</p>
                  <button className="mt-3 bg-red-500/20 text-red-300 font-bold px-4 py-2 rounded-xl text-xs hover:bg-red-500/30 transition-colors">Take Action</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-4">Jurisdiction Health </h2>
            
            <div className="divide-y divide-white/10">
              {[
                { country: "United Kingdom", status: "Compliant", color: "text-green-400", entities: 1, employees: 12 },
                { country: "United States (Texas)", status: "Review Required", color: "text-amber-400", entities: 1, employees: 8 },
                { country: "United Arab Emirates", status: "Compliant", color: "text-green-400", entities: 1, employees: 5 },
              ].map((loc, i) => (
                <div key={i} className="py-4 flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-current" style={{ backgroundColor: loc.color === 'text-green-400' ? '#4ade80' : '#fbbf24' }} />
                    <div>
                      <h3 className="font-bold">{loc.country}</h3>
                      <p className="text-xs text-slate-400 mt-1">{loc.entities} Entity • {loc.employees} Employees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${loc.color}`}>{loc.status}</span>
                    <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#D4A843]/10 to-transparent border border-[#D4A843]/20 rounded-3xl p-6">
            <h3 className="font-bold mb-4 text-[#D4A843]">Permanent Establishment Risk</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              You currently have 3 contractors in <strong className="text-white">Portugal</strong> exceeding 183 days of residency. You are at high risk of triggering permanent establishment corporate tax liabilities.
            </p>
            <button className="w-full border border-[#D4A843]/50 text-[#D4A843] font-bold py-3 rounded-xl hover:bg-[#D4A843]/10 transition-colors text-sm">
              View Legal Briefing
            </button>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><FileText size={18} className="text-slate-400" /> Compliance Documents</h3>
            <div className="space-y-2">
              <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-sm text-slate-300">UK Articles of Association</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">PDF</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-sm text-slate-300">UAE Freezone License</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">PDF</span>
              </div>
              <button className="w-full p-3 border border-dashed border-white/20 rounded-xl text-sm text-slate-400 hover:text-white hover:border-white/40 transition-colors mt-2">
                + Upload Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
