"use client"

import { useTransition } from "react"
import { saveIndividualProfile } from "../actions"
import { PublicShell } from "@/components/platform/PublicShell"
import { User } from "lucide-react"

export default function IndividualOnboardingPage() {
  const [isPending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    startTransition(() => {
      saveIndividualProfile(formData)
    })
  }

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#0A0F1E] text-white py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="h-16 w-16 bg-[#00D4FF]/10 text-[#00D4FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User size={32} />
            </div>
            <h1 className="text-4xl font-[var(--font-playfair)] font-bold mb-4">Your Move Score™ Intake</h1>
            <p className="text-slate-400">Complete this quick profile to generate your personalized city ranking.</p>
          </div>

          <form action={onSubmit} className="bg-slate-900/50 p-8 rounded-3xl border border-white/10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Primary Citizenship</label>
              <select name="citizenship" required className="w-full bg-[#0A0F1E] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00D4FF]">
                <option value="">Select country...</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="NG">Nigeria</option>
                <option value="IN">India</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Household Size</label>
              <input type="number" name="familySize" min="1" defaultValue="1" required className="w-full bg-[#0A0F1E] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00D4FF]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Move Risk Appetite</label>
              <select name="riskAppetite" required className="w-full bg-[#0A0F1E] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00D4FF]">
                <option value="">Select...</option>
                <option value="Conservative">Conservative (Familiar culture, high safety)</option>
                <option value="Balanced">Balanced (Good opportunities, manageable risk)</option>
                <option value="Aggressive">High Growth (Emerging markets, completely new culture)</option>
              </select>
            </div>

            <button disabled={isPending} type="submit" className="w-full bg-[#00D4FF] text-[#0A0F1E] font-bold text-lg rounded-xl py-4 mt-8 hover:bg-[#00D4FF]/90 transition-colors disabled:opacity-50">
              {isPending ? "Generating Profile..." : "Calculate Move Score™"}
            </button>
          </form>
        </div>
      </div>
    </PublicShell>
  )
}
