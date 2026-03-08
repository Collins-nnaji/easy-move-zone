"use client"

import { FormEvent, useState } from "react"

export function NewsletterSignupForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, listType: "intelligence" }),
      })
      if (!response.ok) throw new Error("failed")
      setEmail("")
      setMessage("You are subscribed. Check your email for a welcome note.")
    } catch {
      setMessage("Unable to subscribe right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@company.com"
        className="flex-1 rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#c9a84c]"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-[#0d0d0d] px-5 py-3 text-sm font-medium text-[#f5f0e8] transition hover:bg-[#1a3a2a] disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Subscribe"}
      </button>
      {message ? <p className="text-sm text-[#6b6560] sm:col-span-2">{message}</p> : null}
    </form>
  )
}
