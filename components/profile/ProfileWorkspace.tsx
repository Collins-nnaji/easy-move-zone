"use client"

import { useEffect, useMemo, useState } from "react"

type ProfileRole = "buyer" | "seller"
type ContactMethod = "email" | "phone" | "whatsapp"
type ListingType = "rent" | "buy" | "commercial"

interface ProfileData {
  role: ProfileRole
  fullName: string
  phone: string
  preferredContactMethod: ContactMethod
  buyerPreferredCities: string[]
  buyerListingTypes: ListingType[]
  buyerBudgetMin: number | null
  buyerBudgetMax: number | null
  buyerBedroomsMin: number | null
  buyerNotes: string
  sellerCompanyName: string
  sellerLicense: string
  sellerServiceCities: string[]
  sellerPropertyTypes: ListingType[]
  sellerNotes: string
}

interface SavedSearch {
  id: string
  name: string
  citySlug: string | null
  listingType: ListingType | null
  budgetMin: number | null
  budgetMax: number | null
  bedroomsMin: number | null
  createdAt: string
}

const emptyProfile: ProfileData = {
  role: "buyer",
  fullName: "",
  phone: "",
  preferredContactMethod: "email",
  buyerPreferredCities: [],
  buyerListingTypes: [],
  buyerBudgetMin: null,
  buyerBudgetMax: null,
  buyerBedroomsMin: null,
  buyerNotes: "",
  sellerCompanyName: "",
  sellerLicense: "",
  sellerServiceCities: [],
  sellerPropertyTypes: [],
  sellerNotes: "",
}

function csvToArray(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function arrayToCsv(value: string[]): string {
  return value.join(", ")
}

interface NewSavedSearchForm {
  name: string
  citySlug: string
  listingType: "" | ListingType
  budgetMin: string
  budgetMax: string
  bedroomsMin: string
}

const initialSavedSearchForm: NewSavedSearchForm = {
  name: "",
  citySlug: "",
  listingType: "",
  budgetMin: "",
  budgetMax: "",
  bedroomsMin: "",
}

export function ProfileWorkspace({
  initialRole,
  displayName,
  email,
  cityOptions,
}: {
  initialRole: ProfileRole
  displayName: string
  email: string
  cityOptions: Array<{ slug: string; name: string }>
}) {
  const [profile, setProfile] = useState<ProfileData>({ ...emptyProfile, role: initialRole, fullName: displayName })
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [newSavedSearch, setNewSavedSearch] = useState<NewSavedSearchForm>(initialSavedSearchForm)
  const [savingSearch, setSavingSearch] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/profile")
        const payload = (await response.json()) as { profile?: ProfileData; savedSearches?: SavedSearch[] }
        if (!mounted) return
        setProfile({
          ...emptyProfile,
          role: initialRole,
          fullName: displayName,
          ...payload.profile,
        })
        setSavedSearches(payload.savedSearches ?? [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [displayName, initialRole])

  const buyerCitiesCsv = useMemo(() => arrayToCsv(profile.buyerPreferredCities), [profile.buyerPreferredCities])
  const sellerCitiesCsv = useMemo(() => arrayToCsv(profile.sellerServiceCities), [profile.sellerServiceCities])

  async function saveProfile() {
    setSaving(true)
    setStatus("")
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      })
      const payload = (await response.json()) as { profile?: ProfileData; error?: string }
      if (!response.ok) {
        setStatus(payload.error ?? "Could not save profile.")
        return
      }
      if (payload.profile) setProfile(payload.profile)
      setStatus("Profile saved.")
    } finally {
      setSaving(false)
    }
  }

  async function createSavedSearch() {
    if (!newSavedSearch.name.trim()) {
      setStatus("Saved search name is required.")
      return
    }
    setSavingSearch(true)
    try {
      const response = await fetch("/api/profile/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSavedSearch.name,
          citySlug: newSavedSearch.citySlug || null,
          listingType: newSavedSearch.listingType || null,
          budgetMin: newSavedSearch.budgetMin ? Number(newSavedSearch.budgetMin) : null,
          budgetMax: newSavedSearch.budgetMax ? Number(newSavedSearch.budgetMax) : null,
          bedroomsMin: newSavedSearch.bedroomsMin ? Number(newSavedSearch.bedroomsMin) : null,
        }),
      })
      const payload = (await response.json()) as { savedSearch?: SavedSearch; error?: string }
      if (!response.ok || !payload.savedSearch) {
        setStatus(payload.error ?? "Could not save search.")
        return
      }
      setSavedSearches((prev) => [payload.savedSearch as SavedSearch, ...prev])
      setNewSavedSearch(initialSavedSearchForm)
      setStatus("Saved search added.")
    } finally {
      setSavingSearch(false)
    }
  }

  async function deleteSavedSearch(id: string) {
    const previous = savedSearches
    setSavedSearches((prev) => prev.filter((item) => item.id !== id))
    const response = await fetch(`/api/profile/saved-searches/${id}`, { method: "DELETE" })
    if (!response.ok) {
      setSavedSearches(previous)
      setStatus("Could not delete saved search.")
    }
  }

  const role = profile.role

  return (
    <div className="emz-surface min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#155eef]">My Profile</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0f172a]">{displayName}</h1>
          <p className="mt-2 text-sm text-[#64748b]">{email}</p>

          <div className="mt-4 inline-flex rounded-full border border-[#c8d8f0] bg-[#eef4ff] p-1">
            <button
              type="button"
              onClick={() => setProfile((prev) => ({ ...prev, role: "buyer" }))}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${role === "buyer" ? "bg-[#155eef] text-white" : "text-[#64748b]"}`}
            >
              Buyer profile
            </button>
            <button
              type="button"
              onClick={() => setProfile((prev) => ({ ...prev, role: "seller" }))}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${role === "seller" ? "bg-[#155eef] text-white" : "text-[#64748b]"}`}
            >
              Seller profile
            </button>
          </div>
        </section>

        <section className="emz-gloss-card rounded-2xl p-6">
          <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Account details</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="text-sm text-[#475569]">
              Full name
              <input
                value={profile.fullName}
                onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[#475569]">
              Phone
              <input
                value={profile.phone}
                onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[#475569]">
              Contact method
              <select
                value={profile.preferredContactMethod}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, preferredContactMethod: event.target.value as ContactMethod }))
                }
                className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
              >
                <option value="email">email</option>
                <option value="phone">phone</option>
                <option value="whatsapp">whatsapp</option>
              </select>
            </label>
          </div>
        </section>

        {role === "buyer" ? (
          <section className="emz-gloss-card rounded-2xl p-6">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Buyer preferences</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="text-sm text-[#475569] md:col-span-2">
                Preferred cities (comma separated)
                <input
                  value={buyerCitiesCsv}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, buyerPreferredCities: csvToArray(event.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                Bedrooms (min)
                <input
                  type="number"
                  value={profile.buyerBedroomsMin ?? ""}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      buyerBedroomsMin: event.target.value ? Number(event.target.value) : null,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                Budget min (USD)
                <input
                  type="number"
                  value={profile.buyerBudgetMin ?? ""}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      buyerBudgetMin: event.target.value ? Number(event.target.value) : null,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                Budget max (USD)
                <input
                  type="number"
                  value={profile.buyerBudgetMax ?? ""}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      buyerBudgetMax: event.target.value ? Number(event.target.value) : null,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["buy", "commercial"] as ListingType[]).map((type) => {
                const selected = profile.buyerListingTypes.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setProfile((prev) => ({
                        ...prev,
                        buyerListingTypes: selected
                          ? prev.buyerListingTypes.filter((item) => item !== type)
                          : [...prev.buyerListingTypes, type],
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selected ? "bg-[#155eef] text-white" : "bg-white text-[#475569] border border-[#c8d8f0]"
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
            <label className="mt-3 block text-sm text-[#475569]">
              Notes
              <textarea
                rows={3}
                value={profile.buyerNotes}
                onChange={(event) => setProfile((prev) => ({ ...prev, buyerNotes: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-5 rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-4">
              <h3 className="text-sm font-semibold text-[#0f172a]">Saved searches</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <input
                  placeholder="Search name"
                  value={newSavedSearch.name}
                  onChange={(event) => setNewSavedSearch((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm md:col-span-2"
                />
                <select
                  value={newSavedSearch.citySlug}
                  onChange={(event) => setNewSavedSearch((prev) => ({ ...prev, citySlug: event.target.value }))}
                  className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Any city</option>
                  {cityOptions.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newSavedSearch.listingType}
                  onChange={(event) =>
                    setNewSavedSearch((prev) => ({ ...prev, listingType: event.target.value as NewSavedSearchForm["listingType"] }))
                  }
                  className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                >
                  <option value="">Any ownership type</option>
                  <option value="buy">buy</option>
                  <option value="commercial">commercial</option>
                </select>
                <input
                  type="number"
                  placeholder="Min"
                  value={newSavedSearch.budgetMin}
                  onChange={(event) => setNewSavedSearch((prev) => ({ ...prev, budgetMin: event.target.value }))}
                  className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={newSavedSearch.budgetMax}
                  onChange={(event) => setNewSavedSearch((prev) => ({ ...prev, budgetMax: event.target.value }))}
                  className="rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={createSavedSearch}
                disabled={savingSearch}
                className="emz-pill-cta mt-3 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {savingSearch ? "Saving..." : "Save search"}
              </button>

              <ul className="mt-3 space-y-2">
                {savedSearches.map((search) => (
                  <li key={search.id} className="flex items-center justify-between rounded-xl border border-[#dbe4f0] bg-white p-3 text-sm">
                    <div>
                      <p className="font-semibold text-[#0f172a]">{search.name}</p>
                      <p className="text-[#64748b]">
                        {search.citySlug || "any city"} · {search.listingType || "any ownership type"} ·
                        ${search.budgetMin?.toLocaleString() || 0} - ${search.budgetMax?.toLocaleString() || "any"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteSavedSearch(search.id)}
                      className="rounded-full border border-[#c8d8f0] px-3 py-1 text-xs font-semibold text-[#0f172a]"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <section className="emz-gloss-card rounded-2xl p-6">
            <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Seller profile</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-[#475569]">
                Company name
                <input
                  value={profile.sellerCompanyName}
                  onChange={(event) => setProfile((prev) => ({ ...prev, sellerCompanyName: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569]">
                License / registration
                <input
                  value={profile.sellerLicense}
                  onChange={(event) => setProfile((prev) => ({ ...prev, sellerLicense: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-[#475569] md:col-span-2">
                Service cities (comma separated)
                <input
                  value={sellerCitiesCsv}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, sellerServiceCities: csvToArray(event.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["buy", "commercial"] as ListingType[]).map((type) => {
                const selected = profile.sellerPropertyTypes.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setProfile((prev) => ({
                        ...prev,
                        sellerPropertyTypes: selected
                          ? prev.sellerPropertyTypes.filter((item) => item !== type)
                          : [...prev.sellerPropertyTypes, type],
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selected ? "bg-[#155eef] text-white" : "bg-white text-[#475569] border border-[#c8d8f0]"
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
            <label className="mt-3 block text-sm text-[#475569]">
              Seller notes
              <textarea
                rows={3}
                value={profile.sellerNotes}
                onChange={(event) => setProfile((prev) => ({ ...prev, sellerNotes: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-[#c8d8f0] bg-white px-3 py-2 text-sm"
              />
            </label>
          </section>
        )}

        <section className="emz-gloss-card rounded-2xl p-5">
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving || loading}
            className="emz-pill-cta rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
          {status ? <p className="mt-2 text-sm text-[#64748b]">{status}</p> : null}
          {loading ? <p className="mt-2 text-sm text-[#64748b]">Loading profile...</p> : null}
        </section>
      </div>
    </div>
  )
}
