"use client"

import { FormEvent, useState } from "react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export function IntelligenceChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask about neighborhoods, commute trade-offs, school proximity, or what city best fits your move profile.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSend(event: FormEvent) {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai/intelligence-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history: nextMessages }),
      })
      if (!response.ok) throw new Error("request failed")
      const json = (await response.json()) as { answer: string }
      setMessages((prev) => [...prev, { role: "assistant", content: json.answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I could not fetch intelligence right now. Please try again shortly.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="emz-gloss-card rounded-2xl p-4 shadow-sm">
      <h3 className="font-[var(--font-playfair)] text-xl font-bold text-[#0f172a]">Neighbourhood AI Assistant</h3>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
              message.role === "assistant"
                ? "bg-white text-[#0f172a]"
                : "ml-auto bg-[#155eef] text-white"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={onSend} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a neighborhood question..."
          className="flex-1 rounded-xl border border-[#c8d8f0] px-3 py-2 text-sm outline-none focus:border-[#155eef]"
        />
        <button
          type="submit"
          disabled={loading}
          className="emz-pill-cta rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </aside>
  )
}
