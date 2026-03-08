"use client"

import { FormEvent, useState } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AskYourMarketChat({ corridorId }: { corridorId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ask anything about your corridor. I will answer from your engagement context and market intelligence.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { role: "user", content: trimmed }])
    setInput("")
    setLoading(true)
    try {
      const response = await fetch("/api/ai/ask-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ corridorId, question: trimmed }),
      })
      if (!response.ok) throw new Error("failed")
      const json = (await response.json()) as { answer: string }
      setMessages((prev) => [...prev, { role: "assistant", content: json.answer }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I could not answer right now. Please retry shortly." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="emz-gloss-card rounded-2xl p-5">
      <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0d0d0d]">Ask Your Market</h3>
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-black/10 bg-[#f5f0e8] p-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
              message.role === "assistant" ? "bg-white text-[#1a1a1a]" : "ml-auto bg-[#0d0d0d] text-[#f5f0e8]"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input value={input} onChange={(event) => setInput(event.target.value)} className="flex-1 rounded-xl border border-black/15 px-3 py-2 text-sm" placeholder="Ask a corridor question..." />
        <button type="submit" disabled={loading} className="emz-pill-cta rounded-xl bg-[#0d0d0d] px-3 py-2 text-sm text-[#f5f0e8]">
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  )
}
