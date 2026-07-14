"use client"

import type { NewRequestInput } from "@/lib/requests/types"

/** Submit a concierge relocation request. Works signed-in or anonymously. */
export async function submitRequest(input: NewRequestInput): Promise<void> {
  const res = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    let message = "Couldn't send your request — try again."
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      // no JSON body
    }
    throw new Error(message)
  }
}
