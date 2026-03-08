"use client"

import { useState } from "react"

export function MonthlyDigestGenerator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function generateDigest() {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch("/api/ai/monthly-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!response.ok) throw new Error("failed")
      const json = (await response.json()) as { draft: string }
      setResult(json.draft)
    } catch {
      setResult("Could not generate digest right now. Please retry.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">Monthly Intelligence Digest Generator</h3>
      <p className="mt-2 text-sm text-[#6b6560]">
        Generate a first draft newsletter from corridor data, report changes, and recent market context.
      </p>
      <button
        type="button"
        onClick={generateDigest}
        disabled={loading}
        className="mt-4 rounded-full bg-[#0d0d0d] px-4 py-2 text-sm text-[#f5f0e8] disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate draft digest"}
      </button>
      {result ? (
        <div className="mt-4 rounded-xl border border-[#c9a84c]/30 bg-[#ede8de] p-4 text-sm text-[#1a1a1a] whitespace-pre-wrap">
          {result}
        </div>
      ) : null}
    </div>
  )
}
