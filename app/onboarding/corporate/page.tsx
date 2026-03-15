"use client"

import { useTransition } from "react"
import { saveCorporateProfile } from "../actions"
import { PublicShell } from "@/components/platform/PublicShell"
import { Building2 } from "lucide-react"

export default function CorporateOnboardingPage() {
  const [isPending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    startTransition(() => {
      saveCorporateProfile(formData)
    })
  }

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#0A0F1E] text-white py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="h-16 w-16 bg-[#D4A843]/10 text-[#D4A843] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 size={32} />
            </div>
            <h1 className="text-4xl font-[var(--font-playfair)] font-bold mb-4">Location Strategy Setup</h1>
            <p className="text-slate-400">Tell us about your organization to unlock relocation cost models and compliance briefings.</p>
          </div>

          <form action={onSubmit} className="bg-slate-900/50 p-8 rounded-3xl border border-white/10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
              <input type="text" name="companyName" required className="w-full bg-[#0A0F1E] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4A843]" placeholder="Acme Global Inc." />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Employee Headcount</label>
              <select name="employeeCount" required className="w-full bg-[#0A0F1E] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4A843]">
                <option value="">Select size...</option>
                <option value="1-50">1 - 50</option>
                <option value="51-200">51 - 200</option>
                <option value="201-1000">201 - 1,000</option>
                <option value="1000+">1,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Primary Industry</label>
              <select name="industry" required className="w-full bg-[#0A0F1E] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4A843]">
                <option value="">Select...</option>
                <option value="Technology">Technology & Software</option>
                <option value="Finance">Financial Services</option>
                <option value="Consulting">Consulting & Professional Services</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button disabled={isPending} type="submit" className="w-full bg-[#D4A843] text-[#0A0F1E] font-bold text-lg rounded-xl py-4 mt-8 hover:bg-[#D4A843]/90 transition-colors disabled:opacity-50">
              {isPending ? "Setting up workspace..." : "Access Corporate Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </PublicShell>
  )
}
