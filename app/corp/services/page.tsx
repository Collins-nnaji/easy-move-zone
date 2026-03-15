import { Search, ChevronRight, CheckCircle2, Building2 } from "lucide-react"
import Link from "next/link"

export default function CorpServicesPage() {
  const services = [
    { title: "Corporate Entity Setup", category: "Legal & Entity", price: "From $2,800/entity", status: "available" },
    { title: "Bulk Visa Processing", category: "Immigration & Visas", price: "Custom Quote", status: "available" },
    { title: "Executive Relocation Package", category: "Housing & Relocation", price: "From $8,500/exec", status: "active" },
    { title: "Global Payroll Integration", category: "Tax & Wealth Structuring", price: "$1,200/mo", status: "available" }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Corporate Services</h1>
           <p className="text-slate-400">Request entity setups, bulk visas, and executive relocation packages.</p>
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search B2B services..." 
            className="w-full bg-slate-900/80 border border-white/20 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#D4A843]"
          />
        </div>
      </header>

      {/* Active Engagements */}
      <div className="bg-gradient-to-br from-[#D4A843]/10 to-transparent border border-[#D4A843]/30 rounded-3xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 font-[var(--font-playfair)] text-[#D4A843]">Active Engagements</h2>
        <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#D4A843]/20 flex items-center justify-center text-[#D4A843]">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold flex items-center gap-2">
                 Executive Relocation Package
                 <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full">For: Elena Rodriguez</span>
              </h3>
              <p className="text-sm text-slate-400 mt-1">Status: Sourcing Housing (Lisbon)</p>
            </div>
          </div>
          <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors">
            Manage Engagement
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold mb-4">Service Catalog</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.filter(s => s.status === 'available').map((srv, i) => (
            <div key={i} className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 hover:border-[#D4A843]/50 transition-colors group cursor-pointer flex flex-col justify-between">
               <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A843] mb-2 inline-block">{srv.category}</span>
                  <h3 className="text-lg font-bold mb-4">{srv.title}</h3>
               </div>
               <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <span className="font-bold font-[var(--font-playfair)] text-[#D4A843]">{srv.price}</span>
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                     Request Proposal <ChevronRight size={16} />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
