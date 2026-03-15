import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import { Building2, LineChart, Globe, ShieldCheck } from "lucide-react"

export default function CorporateLandingPage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[#0A0F1E] min-h-screen text-white pt-24 pb-20">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#D4A843]/10 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/10 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4A843]/30 bg-[#D4A843]/10 text-[#D4A843] text-xs font-semibold uppercase tracking-widest mb-6">
              <Building2 size={14} /> EasyMoveZone For Corporate
            </div>
            <h1 className="font-[var(--font-playfair)] text-5xl md:text-7xl font-bold leading-tight mb-6">
              Optimize your workforce geography. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#D4A843]">We'll handle the logistics.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl">
              Equip your HR teams with Location Strategy recommendations, then let our Concierge execute your corporate entity setups, bulk visas, and executive relocations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup?type=corporate" className="px-8 py-4 rounded-xl bg-[#D4A843] text-slate-900 font-bold hover:bg-[#D4A843]/90 transition-colors">
                Request Organisation Access
              </Link>
              <Link href="/pricing" className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/5 transition-colors">
                View Enterprise Pricing
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full bg-slate-950 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid md:grid-cols-3 gap-8">
              {[
              {
                icon: Globe,
                title: "Location Strategy Hub",
                desc: "Discover the most strategic growth markets based on hiring goals and business expansion priorities."
              },
              {
                icon: LineChart,
                title: "Relocation Cost Models",
                desc: "Accurately forecast exactly how much it will cost to relocate teams to key global hubs."
              },
              {
                icon: ShieldCheck,
                title: "Compliance & Risk Briefings",
                desc: "Stay protected with up-to-date data on local employment laws, work permits, and tax structures."
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-slate-900/50 border border-white/10 p-6 rounded-2xl">
                  <Icon className="text-[#D4A843] mb-4" size={28} />
                  <h3 className="text-xl font-bold mb-2 font-[var(--font-playfair)]">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              )
            })}
          </div>
          </div>
        </div>

      </section>
    </PublicShell>
  )
}
