"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, BadgeCheck, Building2, CheckCircle2, Loader2 } from "lucide-react"

export function PropertyEnquiry({ propertyId, city }: { propertyId: string; city: string }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(
    `Hi, I'm interested in this property in ${city}. Please send me the full details and arrange a viewing.`,
  )
  const [state, setState] = useState<"idle" | "sending" | "sent" | "auth" | "error">("idle")

  async function submit() {
    if (!message.trim()) return
    setState("sending")
    try {
      const res = await fetch(`/api/properties/${propertyId}/enquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      })
      if (res.status === 401) { setState("auth"); return }
      if (!res.ok) throw new Error("bad")
      setState("sent")
    } catch {
      setState("error")
    }
  }

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0511f]/10">
          <Building2 className="h-6 w-6 text-[#e0511f]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#0f172a]">EasyMoveZone</span>
            <BadgeCheck className="h-4 w-4 text-[#059669]" />
          </div>
          <div className="text-xs text-[#64748b]">Platform listing · verified in-house</div>
        </div>
      </div>

      {state === "sent" ? (
        <div className="rounded-xl border border-[#059669]/20 bg-[#f0fdf4] p-4 text-center">
          <CheckCircle2 className="mx-auto h-6 w-6 text-[#059669]" />
          <p className="mt-2 text-sm font-semibold text-[#0f172a]">Enquiry sent</p>
          <p className="mt-1 text-xs text-[#475569]">Our closing team will be in touch. Track it in your dashboard.</p>
          <Link href="/dashboard" className="mt-3 inline-block text-xs font-bold text-[#e0511f] hover:underline">
            Go to dashboard →
          </Link>
        </div>
      ) : state === "auth" ? (
        <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-center">
          <p className="text-sm text-[#475569]">Sign in to send your enquiry — it keeps everything in one place.</p>
          <Link
            href={`/auth?redirect=/properties/${propertyId}`}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#e0511f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#c8451a]"
          >
            Sign in to continue
          </Link>
        </div>
      ) : open ? (
        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-[#e2e8f0] p-3 text-sm text-[#0f172a] placeholder:text-slate-400 focus:border-[#e0511f]/50 focus:outline-none focus:ring-2 focus:ring-[#e0511f]/15"
            placeholder="Tell us what you'd like to know…"
          />
          {state === "error" && <p className="text-xs text-red-600">Couldn’t send that — please try again.</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border border-[#e2e8f0] py-2.5 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={state === "sending"}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e0511f] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#c8451a] disabled:opacity-60"
            >
              {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
              {state === "sending" ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e0511f] py-3 text-sm font-bold text-white transition-colors hover:bg-[#c8451a]"
        >
          <MessageSquare className="h-4 w-4" /> Send enquiry
        </button>
      )}
      <p className="mt-3 text-center text-xs text-[#94a3b8]">We route enquiries to our closing team—not random agents.</p>
    </div>
  )
}
