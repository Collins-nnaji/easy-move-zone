import { PublicShell } from "@/components/platform/PublicShell"

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[#0A0F1E] min-h-screen text-white pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[var(--font-playfair)] text-5xl md:text-7xl font-bold mb-8">
            Our Mission.
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed mb-12">
            EasyMoveZone was founded with a singular purpose: to bring data-backed intelligence to global mobility. Moving across borders shouldn't be guesswork. It shouldn't rely on fragmented Google searches and outdated advice. We believe that ambitious professionals and global enterprises deserve real-time, actionable intelligence to optimize their geographic footprint.
          </p>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/10">
              <h2 className="font-[var(--font-playfair)] text-3xl font-bold mb-4 text-[#00D4FF]">For Individuals</h2>
              <p className="text-slate-400">We empower individuals to take control of their career and life trajectory by identifying the exact cities worldwide where they can thrive, based on their unique goals, citizenship, and risk profile.</p>
            </div>
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/10">
              <h2 className="font-[var(--font-playfair)] text-3xl font-bold mb-4 text-[#D4A843]">For Corporate</h2>
              <p className="text-slate-400">We equip HR and global mobility teams with the analytical rigor required to strategically expand workforces, map talent densities, and model compliance and relocation costs with confidence.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
