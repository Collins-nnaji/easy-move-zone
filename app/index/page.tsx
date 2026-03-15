import Link from "next/link"
import { PublicShell } from "@/components/platform/PublicShell"
import { IndexClient } from "@/components/platform/IndexClient"

export default function AnnualCityIndexPage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[#0A0F1E] min-h-screen text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="font-[var(--font-playfair)] text-5xl md:text-7xl font-bold mb-6">
              EasyMoveZone<br/>Annual City Index
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Our proprietary ranking of the world's most strategic cities for ambitious professionals and expanding enterprises, based on millions of data points across opportunity, cost, and compliance.
            </p>
          </div>

          <IndexClient />

        </div>
      </section>
    </PublicShell>
  )
}
