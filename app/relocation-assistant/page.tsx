"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Bot, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
}

const QUICK_PROMPTS = [
  "I am a student moving to Canada in 6 months. Give me my action plan.",
  "Compare London vs Berlin for digital nomad relocation.",
  "What documents should I prepare for a UK work move?",
]

function generateAssistantReply(input: string) {
  const lower = input.toLowerCase()

  if (lower.includes("student") || lower.includes("study")) {
    return "Student relocation plan: (1) run Assessment to pick strongest route, (2) open Relocation Guides for study playbook, (3) use Document Workspace to track admission + funds evidence, (4) compare city costs before housing search."
  }
  if (lower.includes("digital nomad") || lower.includes("nomad")) {
    return "Digital nomad plan: (1) evaluate country policy fit in Guides, (2) compare cost-of-living and housing lanes, (3) shortlist moving partners for light relocation logistics, (4) join city communities to accelerate onboarding."
  }
  if (lower.includes("document")) {
    return "Document strategy: start from required IDs and funds proof, then route-specific evidence. Use Document Support to mark missing/needs-fix and keep status at least 80% before final submission."
  }
  return "Recommended flow: Assessment → Document Support → Cost-of-Living → Housing Search → Moving Companies → Communities. I can break this into a week-by-week execution timeline if you share your route and move date."
}

export default function RelocationAssistantPage() {
  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "seed",
      role: "assistant",
      text: "Welcome to EasyMoveZone AI Relocation Assistant. Tell me your route, move goal, and timeline, and I will generate a practical action plan across platform tools.",
    },
  ])

  function sendMessage(raw: string) {
    const value = raw.trim()
    if (!value) return

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: value }
    const assistantMsg: ChatMessage = { id: `a-${Date.now()}-${Math.random()}`, role: "assistant", text: generateAssistantReply(value) }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput("")
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 bg-gradient-to-b from-white via-white to-black/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <Link href="/suite" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/70 hover:text-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Suite
          </Link>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 mb-6 shadow-[0_24px_56px_-34px_rgba(0,0,0,0.42)]"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-black mb-3">
            <Bot className="w-3.5 h-3.5" />
            AI relocation assistant
          </div>
          <h1 className="display-title text-3xl md:text-5xl text-black mb-2">Plan your move with AI</h1>
          <p className="text-black/70 max-w-3xl">
            Ask relocation questions and get actionable recommendations connected to EasyMoveZone modules.
          </p>
        </motion.section>

        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5 items-start">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {messages.map((msg) => (
                <div key={msg.id} className={`rounded-xl p-3 text-sm ${msg.role === "assistant" ? "bg-black/[0.04] border border-black/10 text-black/80" : "bg-black text-white ml-8"}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage(input)
                }}
                placeholder="Ask: I am relocating to Toronto with family in 4 months..."
                className="flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black"
              />
              <Button onClick={() => sendMessage(input)} className="gap-2">
                <Send className="w-4 h-4" /> Send
              </Button>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <section className="rounded-2xl border border-black/10 bg-black text-white p-5">
              <h3 className="font-bold mb-2">Quick prompts</h3>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs hover:bg-white/[0.1] transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <h3 className="font-bold text-black mb-2">Platform actions</h3>
              <div className="space-y-2">
                <Link href="/qualify" className="flex items-center justify-between rounded-lg border border-black/12 bg-white px-3 py-2 text-sm text-black/80 hover:bg-black/[0.03]">
                  Run assessment <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/document-support" className="flex items-center justify-between rounded-lg border border-black/12 bg-white px-3 py-2 text-sm text-black/80 hover:bg-black/[0.03]">
                  Open documents <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/moving-companies" className="flex items-center justify-between rounded-lg border border-black/12 bg-white px-3 py-2 text-sm text-black/80 hover:bg-black/[0.03]">
                  Compare movers <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="inline-flex items-center gap-1 text-xs text-black/60 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Monetization lane
              </div>
              <p className="text-sm text-black/70">
                Assistant recommendations can route users directly into affiliate movers, partner housing leads, and premium guide upgrades.
              </p>
            </section>
          </aside>
        </section>
      </div>
    </div>
  )
}
