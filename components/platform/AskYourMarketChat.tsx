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
      content: "Ask anything about your move. I will help with neighbourhood fit, viewings, and relocation decisions.",
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
      <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">Ask Your Move Advisor AI</h3>
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
              message.role === "assistant" ? "bg-white text-[#0f172a]" : "ml-auto bg-[#e0511f] text-white"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input value={input} onChange={(event) => setInput(event.target.value)} className="flex-1 rounded-xl border border-[#c8d8f0] px-3 py-2 text-sm" placeholder="Ask a move question..." />
        <button type="submit" disabled={loading} className="emz-pill-cta rounded-xl px-3 py-2 text-sm font-semibold">
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  )
}
