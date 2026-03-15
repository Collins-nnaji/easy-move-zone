import { Search, ChevronRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function AppServicesPage() {
  const services = [
    { title: "UK Tech Nation Visa Support", category: "Immigration & Visas", price: "From $2,500", status: "active" },
    { title: "Accompanied Home Search Tour", category: "Housing & Relocation", price: "From $1,500", status: "available" },
    { title: "Lease Negotiation & Review", category: "Housing & Relocation", price: "$350", status: "available" },
    { title: "Cross-Border Tax Consultation", category: "Tax & Wealth Structuring", price: "$450/hr", status: "available" }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-[var(--font-playfair)] font-bold mb-2">Relocation Services</h1>
           <p className="text-slate-400">Request expert execution for your move to ensure a smooth transition.</p>
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search services..." 
            className="w-full bg-slate-900/80 border border-white/20 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#00D4FF]"
          />
        </div>
      </header>

      {/* Active Requests */}
      <div className="bg-gradient-to-br from-[#00D4FF]/10 to-transparent border border-[#00D4FF]/30 rounded-3xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 font-[var(--font-playfair)] text-[#00D4FF]">Active Service Requests</h2>
        <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF]">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-bold">UK Tech Nation Visa Support</h3>
              <p className="text-sm text-slate-400 mt-1">Status: Initial Review Pending</p>
            </div>
          </div>
          <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors">
            View Case File
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold mb-4">Available Services</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {services.filter(s => s.status === 'available').map((srv, i) => (
            <div key={i} className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 hover:border-[#00D4FF]/50 transition-colors group cursor-pointer flex flex-col justify-between">
               <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#00D4FF] mb-2 inline-block">{srv.category}</span>
                  <h3 className="text-lg font-bold mb-4">{srv.title}</h3>
               </div>
               <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <span className="font-bold font-[var(--font-playfair)] text-[#00D4FF]">{srv.price}</span>
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                     Request <ChevronRight size={16} />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
