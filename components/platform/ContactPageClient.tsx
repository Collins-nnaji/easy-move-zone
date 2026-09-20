"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, CheckCircle2, Loader2, Mail, MessageSquare, Phone, Send, User } from "lucide-react"
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants"

const easeOut = [0.16, 1, 0.3, 1] as const

type ContactPageClientProps = {
  initialMessage?: string
  pageContext?: string | null
}

export function ContactPageClient({ initialMessage = "", pageContext = null }: ContactPageClientProps) {
  const reduceMotion = useReducedMotion()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState(initialMessage)
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [error, setError] = useState("")

  const contextLine = useMemo(() => pageContext?.trim() || null, [pageContext])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          subject: subject || undefined,
          message,
          pageContext: contextLine || undefined,
        }),
      })
      const data = (await res.json()) as { error?: string; ok?: boolean }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.")
        setStatus("error")
        return
      }
      setStatus("success")
      setName("")
      setEmail("")
      setPhone("")
      setSubject("")
      setMessage("")
    } catch {
      setError("Network error. You can still reach us by email.")
      setStatus("error")
    }
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#030712]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_20%_-20%,rgba(224,81,31,0.45),transparent)]"
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -right-24 top-1/4 h-[min(45vw,380px)] w-[min(45vw,380px)] rounded-full bg-[#bf6a3c]/18 blur-[88px]"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.05, 1], opacity: [0.22, 0.38, 0.22] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <div className="home-hero-grid pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <motion.p
            {...(reduceMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } })}
            transition={{ duration: 0.45, ease: easeOut }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300/90"
          >
            Contact
          </motion.p>
          <motion.h1
            {...(reduceMotion ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } })}
            transition={{ duration: 0.5, delay: 0.04, ease: easeOut }}
            className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            Talk to the EasyMoveZone team
          </motion.h1>
          <motion.p
            {...(reduceMotion ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } })}
            transition={{ duration: 0.5, delay: 0.08, ease: easeOut }}
            className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base"
          >
            Questions about loads, payouts, fleet posting, or compliance? Send a note — we read every message.
          </motion.p>

          <motion.div
            {...(reduceMotion ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } })}
            transition={{ duration: 0.5, delay: 0.12, ease: easeOut }}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <a
              href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#bf6a3c]/40 hover:bg-white/10"
            >
              <Mail className="h-5 w-5 text-orange-300" />
              {PUBLIC_CONTACT_EMAIL}
            </a>
            <Link
              href="/move"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-200/90 underline decoration-orange-500/35 underline-offset-4 hover:text-white"
            >
              Open driver app
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/fleet"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-200/90 underline decoration-orange-500/35 underline-offset-4 hover:text-white"
            >
              Fleet console
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[#e2e8f0] bg-[#f4f4f4] py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <h2 className="text-lg font-semibold text-[#0f172a] sm:text-xl">Why write in?</h2>
              <ul className="mt-6 space-y-4 text-sm text-[#475569]">
                <li className="flex gap-3">
                  <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-[#e0511f]" />
                  <span>Driver payouts, compliance vault, and load claims.</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#e0511f]" />
                  <span>Fleet posting, funding loads, and finding rated drivers.</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#e0511f]" />
                  <span>Leave a phone number if you prefer a callback (optional).</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-lg shadow-[#e0511f]/[0.06] sm:p-8">
                {status === "success" ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-[#0f172a]">Message received</p>
                    <p className="mx-auto mt-2 max-w-md text-sm text-[#64748b]">
                      Thanks — we&apos;ll get back to you soon. You can also email{" "}
                      <a className="font-semibold text-[#e0511f] hover:underline" href={`mailto:${PUBLIC_CONTACT_EMAIL}`}>
                        {PUBLIC_CONTACT_EMAIL}
                      </a>
                      .
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus("idle")}
                      className="mt-8 rounded-full border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:bg-[#f8fafc]"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
                    <h2 className="text-lg font-semibold text-[#0f172a]">Send a message</h2>
                    {contextLine ? (
                      <p className="rounded-xl border border-[#bf6a3c]/20 bg-[#f0f9ff] px-3 py-2 text-xs text-[#0c4a6e]">
                        <span className="font-semibold">Context: </span>
                        {contextLine}
                      </p>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          <User className="h-3.5 w-3.5" aria-hidden />
                          Name
                        </span>
                        <input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                          className="w-full rounded-xl border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#bf6a3c] focus:ring-2 focus:ring-[#bf6a3c]/20"
                          placeholder="Your full name"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          <Mail className="h-3.5 w-3.5" aria-hidden />
                          Email
                        </span>
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          className="w-full rounded-xl border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#bf6a3c] focus:ring-2 focus:ring-[#bf6a3c]/20"
                          placeholder="you@example.com"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          <Phone className="h-3.5 w-3.5" aria-hidden />
                          Phone <span className="font-normal normal-case text-[#94a3b8]">(optional)</span>
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          autoComplete="tel"
                          className="w-full rounded-xl border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#bf6a3c] focus:ring-2 focus:ring-[#bf6a3c]/20"
                          placeholder="+234 …"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                          Subject <span className="font-normal normal-case text-[#94a3b8]">(optional)</span>
                        </span>
                        <input
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full rounded-xl border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#bf6a3c] focus:ring-2 focus:ring-[#bf6a3c]/20"
                          placeholder="e.g. Question about a Lisbon nomad visa"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748b]">Message</span>
                        <textarea
                          required
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full resize-y rounded-xl border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#bf6a3c] focus:ring-2 focus:ring-[#bf6a3c]/20"
                          placeholder="How can we help?"
                        />
                      </label>
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e0511f] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#c8451a] disabled:opacity-60 sm:w-auto sm:px-8"
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
