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
        body: JSON.stringify({ email, listType: "relocation-intelligence" }),
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
        className="flex-1 rounded-xl border border-[#c8d8f0] bg-white px-4 py-3 text-sm outline-none focus:border-[#e0511f]"
      />
      <button
        type="submit"
        disabled={loading}
        className="emz-pill-cta rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Subscribe"}
      </button>
      {message ? <p className="text-sm text-[#64748b] sm:col-span-2">{message}</p> : null}
    </form>
  )
}
