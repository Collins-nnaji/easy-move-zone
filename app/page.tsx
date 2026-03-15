import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import { Building2, User, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[#0A0F1E] min-h-screen pt-20 pb-16">
        {/* Background Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-20">
            <h1 className="font-[var(--font-playfair)] text-5xl md:text-7xl font-bold text-white tracking-tight mb-6">
              Global Mobility.<br/>Powered by Intelligence.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-[var(--font-plex-sans)]">
              The dual-product migration platform. Whether you are an ambitious professional or a global enterprise, we don't just provide data — we execute your move.
            </p>
          </div>
        </div>

        {/* Product Cards Section with different background */}
        <div className="relative z-10 w-full bg-slate-950/50 border-y border-white/5 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Individual Product Card */}
              <div className="relative group rounded-3xl border border-[#00D4FF]/20 bg-slate-900/50 p-8 md:p-12 backdrop-blur-sm transition-all hover:border-[#00D4FF]/50 hover:bg-slate-900/80">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center mb-8 border border-[#00D4FF]/20 text-[#00D4FF]">
                    <User size={32} />
                  </div>
                  <h2 className="font-[var(--font-playfair)] text-4xl text-white font-semibold mb-4">For Individuals</h2>
                  <p className="text-slate-400 font-[var(--font-plex-sans)] mb-8 md:h-24">
                    Find your perfect city with a personalised Move Score™, and let our experts execute your visas, housing, and taxes for a seamless transition.
                  </p>
                  <div className="space-y-4">
                    <Link 
                      href="/individual" 
                      className="block w-full py-4 px-6 rounded-xl bg-[#00D4FF] text-slate-900 font-bold text-center transition-transform hover:scale-[1.02]"
                    >
                      Explore Individual Features
                    </Link>
                    <Link 
                      href="/signup?type=individual" 
                      className="block w-full py-4 px-6 rounded-xl border border-[#00D4FF]/30 text-[#00D4FF] font-medium text-center transition-colors hover:bg-[#00D4FF]/10"
                    >
                      Get Your Move Score
                    </Link>
                  </div>
                </div>
              </div>

              {/* Corporate Product Card */}
              <div className="relative group rounded-3xl border border-[#D4A843]/20 bg-slate-900/50 p-8 md:p-12 backdrop-blur-sm transition-all hover:border-[#D4A843]/50 hover:bg-slate-900/80">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4A843]/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-[#D4A843]/10 flex items-center justify-center mb-8 border border-[#D4A843]/20 text-[#D4A843]">
                    <Building2 size={32} />
                  </div>
                  <h2 className="font-[var(--font-playfair)] text-4xl text-white font-semibold mb-4">For Corporate</h2>
                  <p className="text-slate-400 font-[var(--font-plex-sans)] mb-8 md:h-24">
                    Optimize your workforce geography. Access Location Recommendations, then let us handle the entity setup, bulk visas, and executive relocations.
                  </p>
                  <div className="space-y-4">
                    <Link 
                      href="/corporate" 
                      className="block w-full py-4 px-6 rounded-xl bg-[#D4A843] text-slate-900 font-bold text-center transition-transform hover:scale-[1.02]"
                    >
                      Explore Corporate Solutions
                    </Link>
                    <Link 
                      href="/signup?type=corporate" 
                      className="block w-full py-4 px-6 rounded-xl border border-[#D4A843]/30 text-[#D4A843] font-medium text-center transition-colors hover:bg-[#D4A843]/10"
                    >
                      Request Organisation Access
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted By Section with main background */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h3 className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-8">Trusted by talent from</h3>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale contrast-125">
               <span className="text-2xl font-bold font-[var(--font-playfair)] text-white">Google</span>
               <span className="text-2xl font-bold font-[var(--font-playfair)] text-white">Meta</span>
               <span className="text-2xl font-bold font-[var(--font-playfair)] text-white">Goldman Sachs</span>
               <span className="text-2xl font-bold font-[var(--font-playfair)] text-white">Revolut</span>
            </div>
        </div>
      </section>
    </PublicShell>
  )
}
