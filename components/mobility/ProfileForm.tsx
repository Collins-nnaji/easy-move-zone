"use client"

import type { ReactNode } from "react"
import { CITIZENSHIPS, LANGUAGE_OPTIONS } from "@/lib/mobility/catalog"
import type { Climate, EducationLevel, EnglishLevel, FamilySituation, MobilityProfile } from "@/lib/mobility/types"

const fieldClass = "h-11 w-full rounded-xl border border-[#e4dfd5] bg-white px-3 text-sm text-[#1b231e] outline-none focus:border-[#e0511f]"

export function ProfileForm({
  profile,
  onChange,
}: {
  profile: MobilityProfile
  onChange: (profile: MobilityProfile) => void
}) {
  function set<K extends keyof MobilityProfile>(key: K, value: MobilityProfile[K]) {
    onChange({ ...profile, [key]: value })
  }

  function setFamily(family: FamilySituation) {
    const familySize = family === "single" ? 1 : family === "couple" ? Math.max(2, profile.familySize) : Math.max(3, profile.familySize)
    onChange({ ...profile, family, familySize })
  }

  function toggleLanguage(language: string) {
    const has = profile.languages.includes(language)
    const languages = has ? profile.languages.filter((item) => item !== language) : [...profile.languages, language]
    set("languages", languages.length ? languages : ["English"])
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Citizenship">
        <select className={fieldClass} value={profile.citizenship} onChange={(event) => set("citizenship", event.target.value)}>
          {CITIZENSHIPS.map((country) => <option key={country}>{country}</option>)}
        </select>
      </Field>
      <Field label="Current country">
        <select className={fieldClass} value={profile.currentCountry} onChange={(event) => set("currentCountry", event.target.value)}>
          {CITIZENSHIPS.map((country) => <option key={country}>{country}</option>)}
        </select>
      </Field>
      <Field label="Age">
        <input className={fieldClass} type="number" min={18} max={70} value={profile.age} onChange={(event) => set("age", Number(event.target.value))} />
      </Field>
      <Field label="Profession">
        <input className={fieldClass} value={profile.profession} onChange={(event) => set("profession", event.target.value)} />
      </Field>
      <Field label="Years of experience">
        <input className={fieldClass} type="number" min={0} max={40} value={profile.experienceYears} onChange={(event) => set("experienceYears", Number(event.target.value))} />
      </Field>
      <Field label="Education">
        <select className={fieldClass} value={profile.education} onChange={(event) => set("education", event.target.value as EducationLevel)}>
          <option value="secondary">Secondary</option>
          <option value="bachelor">Bachelor&apos;s</option>
          <option value="master">Master&apos;s</option>
          <option value="phd">Doctorate</option>
        </select>
      </Field>
      <Field label="English">
        <select className={fieldClass} value={profile.englishLevel} onChange={(event) => set("englishLevel", event.target.value as EnglishLevel)}>
          <option value="basic">Basic</option>
          <option value="intermediate">Intermediate</option>
          <option value="fluent">Fluent</option>
        </select>
      </Field>
      <Field label="Savings (£)">
        <input className={fieldClass} type="number" min={0} step={100} value={profile.savingsGbp} onChange={(event) => set("savingsGbp", Number(event.target.value))} />
      </Field>
      <Field label="Desired salary (£ / year)">
        <input className={fieldClass} type="number" min={0} step={1000} value={profile.desiredSalaryGbp} onChange={(event) => set("desiredSalaryGbp", Number(event.target.value))} />
      </Field>
      <Field label="Move within">
        <select className={fieldClass} value={profile.timelineMonths} onChange={(event) => set("timelineMonths", Number(event.target.value))}>
          {[3, 6, 12, 18, 24].map((months) => <option key={months} value={months}>{months} months</option>)}
        </select>
      </Field>
      <Field label="Household">
        <select className={fieldClass} value={profile.family} onChange={(event) => setFamily(event.target.value as FamilySituation)}>
          <option value="single">Just me</option>
          <option value="couple">Couple</option>
          <option value="family">Family with children</option>
        </select>
      </Field>
      <Field label="People moving">
        <input className={fieldClass} type="number" min={1} max={8} value={profile.familySize} onChange={(event) => set("familySize", Number(event.target.value))} />
      </Field>
      <Field label="Preferred climate">
        <select className={fieldClass} value={profile.climate} onChange={(event) => set("climate", event.target.value as Climate)}>
          <option value="any">No preference</option>
          <option value="warm">Warm</option>
          <option value="mild">Mild</option>
          <option value="cold">Cold</option>
        </select>
      </Field>
      <div className="sm:col-span-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[#7c827a]">Languages</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((language) => {
            const on = profile.languages.includes(language)
            return (
              <button
                key={language}
                type="button"
                onClick={() => toggleLanguage(language)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${on ? "bg-[#e0511f] text-white" : "bg-white text-[#4a5047]"}`}
              >
                {language}
              </button>
            )
          })}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
        <input type="checkbox" checked={profile.hasJobOffer} onChange={(event) => set("hasJobOffer", event.target.checked)} />
        I already have a job offer abroad
      </label>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-[#7c827a]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
