"use client"

import { useState } from "react"
import { Loader2, MessageCircleQuestion, Send } from "lucide-react"
import { askVisaQuestion } from "@/lib/visa/client"

export function AiQaPanel({ nationality, destinationCountry, visaType }: {
  nationality: string
  destinationCountry: string
  visaType: string
}) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [asking, setAsking] = useState(false)

  async function onAsk(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || asking) return
    setAsking(true)
    setAnswer("")
    try {
      const result = await askVisaQuestion({ question: question.trim(), nationality, destinationCountry, visaType })
      setAnswer(result)
    } catch {
      setAnswer("Unable to answer right now. Please try again.")
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#e4dfd5] bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#4a5047]">
        <MessageCircleQuestion className="h-4 w-4 text-[#e0511f]" /> Ask about this visa
      </h3>
      <form onSubmit={onAsk} className="mt-3 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Do I need a return flight booked?"
          className="min-w-0 flex-1 rounded-xl border border-[#e4dfd5] px-3 py-2 text-sm outline-none focus:border-[#e0511f]"
        />
        <button
          type="submit"
          disabled={asking}
          className="inline-flex items-center gap-1 rounded-xl bg-[#e0511f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c8451a] disabled:opacity-50"
        >
          {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
      {answer ? <p className="mt-3 text-sm text-[#1b231e]">{answer}</p> : null}
    </div>
  )
}
