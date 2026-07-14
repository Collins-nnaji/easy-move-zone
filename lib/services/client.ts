"use client"

import type { NewServiceBookingInput, ServiceBooking } from "@/lib/services/types"

/** Book a relocation service (requires sign-in). Returns the created booking with its assigned manager. */
export async function bookService(input: NewServiceBookingInput): Promise<ServiceBooking> {
  const res = await fetch("/api/services/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) {
    let message = "Couldn't book that service — try again."
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      // no JSON body
    }
    throw new Error(message)
  }
  return ((await res.json()) as { booking: ServiceBooking }).booking
}

/** List the signed-in user's booked services. */
export async function fetchMyServices(): Promise<ServiceBooking[]> {
  const res = await fetch("/api/services/mine", { cache: "no-store" })
  if (!res.ok) return []
  return ((await res.json()) as { bookings: ServiceBooking[] }).bookings
}
