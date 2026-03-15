import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import { Check } from "lucide-react"

export default function PricingPage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[#0A0F1E] min-h-screen pt-24 pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-[#0A0F1E] to-[#0A0F1E]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="font-[var(--font-playfair)] text-5xl font-bold text-white mb-6">Simple, transparent pricing.</h1>
            <p className="text-lg text-slate-400">Choose the plan that fits your mobility needs, whether you're moving solo or relocating a global workforce.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Individual Free */}
            <div className="border border-white/10 bg-slate-900/50 rounded-3xl p-8 flex flex-col">
              <div className="mb-8">
                <span className="text-[#00D4FF] text-sm font-bold uppercase tracking-wider">Individual</span>
                <h2 className="text-2xl font-bold text-white mt-2">Free</h2>
                <div className="mt-4 flex items-baseline text-4xl font-bold text-white">
                  $0<span className="text-lg text-slate-400 font-normal ml-1">/mo</span>
                </div>
                <p className="mt-4 text-sm text-slate-400">Basic access to limited city intelligence.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Move Score™ for 5 cities', 'Basic Visa Information', 'Community Access (Read-only)'].map(f => (
                  <li key={f} className="flex gap-3 text-sm text-slate-300">
                    <Check size={16} className="text-[#00D4FF] shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?type=individual&plan=free" className="block w-full py-3 px-4 rounded-xl border border-[#00D4FF]/30 text-[#00D4FF] font-semibold text-center hover:bg-[#00D4FF]/10 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Individual Pro */}
            <div className="border border-[#00D4FF]/50 bg-slate-900/80 rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(0,212,255,0.1)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-[#00D4FF] rounded-t-3xl" />
              <div className="mb-8">
                <span className="text-[#00D4FF] text-sm font-bold uppercase tracking-wider">Individual</span>
                <h2 className="text-2xl font-bold text-white mt-2">Pro</h2>
                <div className="mt-4 flex items-baseline text-4xl font-bold text-white">
                  $49<span className="text-lg text-slate-400 font-normal ml-1">/mo</span>
                </div>
                <p className="mt-4 text-sm text-slate-400">Full access for ambitious professionals.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Move Score™ for 80+ cities', 'Full Visa Intelligence Engine', '90-Day Arrival Blueprint', 'Dual-Career Mode for couples', 'Active Community Match'].map(f => (
                  <li key={f} className="flex gap-3 text-sm text-slate-300">
                    <Check size={16} className="text-[#00D4FF] shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?type=individual&plan=pro" className="block w-full py-3 px-4 rounded-xl bg-[#00D4FF] text-slate-900 font-bold text-center hover:bg-[#00D4FF]/90 transition-colors">
                Upgrade to Pro
              </Link>
            </div>

            {/* Corporate Starter */}
            <div className="border border-white/10 bg-slate-900/50 rounded-3xl p-8 flex flex-col">
              <div className="mb-8">
                <span className="text-[#D4A843] text-sm font-bold uppercase tracking-wider">Corporate</span>
                <h2 className="text-2xl font-bold text-white mt-2">Starter</h2>
                <div className="mt-4 flex items-baseline text-4xl font-bold text-white">
                  $12k<span className="text-lg text-slate-400 font-normal ml-1">/yr</span>
                </div>
                <p className="mt-4 text-sm text-slate-400">For growing teams expanding globally.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 15 employees', '3 active target markets', 'Location Strategy Recommendations', 'Basic Cost Models', 'Employee Profiles'].map(f => (
                  <li key={f} className="flex gap-3 text-sm text-slate-300">
                    <Check size={16} className="text-[#D4A843] shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?type=corporate&plan=starter" className="block w-full py-3 px-4 rounded-xl border border-[#D4A843]/30 text-[#D4A843] font-semibold text-center hover:bg-[#D4A843]/10 transition-colors">
                Start Trial
              </Link>
            </div>

            {/* Corporate Scale */}
            <div className="border border-[#D4A843]/40 bg-slate-900/80 rounded-3xl p-8 flex flex-col">
              <div className="mb-8">
                <span className="text-[#D4A843] text-sm font-bold uppercase tracking-wider">Corporate</span>
                <h2 className="text-2xl font-bold text-white mt-2">Scale</h2>
                <div className="mt-4 flex items-baseline text-4xl font-bold text-white">
                  $60k<span className="text-lg text-slate-400 font-normal ml-1">/yr</span>
                </div>
                <p className="mt-4 text-sm text-slate-400">Unlimited access for global enterprise.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited employees', 'Unlimited target markets', 'Advanced Talent Maps', 'Full Relocation Cost Models', 'Compliance & Risk Briefings', 'Dedicated Account Manager'].map(f => (
                  <li key={f} className="flex gap-3 text-sm text-slate-300">
                    <Check size={16} className="text-[#D4A843] shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?type=corporate&plan=scale" className="block w-full py-3 px-4 rounded-xl bg-[#D4A843] text-slate-900 font-bold text-center hover:bg-[#D4A843]/90 transition-colors">
                Contact Sales
              </Link>
            </div>

          </div>
        </div>
      </section>
    </PublicShell>
  )
}
