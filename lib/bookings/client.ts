"use client"

import type { MoveBooking, NewBookingInput } from "@/lib/bookings/types"

/** Reserve a trip, stay or visa service for the signed-in user. */
export async function createBooking(input: NewBookingInput): Promise<MoveBooking> {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { booking: MoveBooking }).booking
}

/** List the signed-in user's bookings (newest first). */
export async function fetchBookings(): Promise<MoveBooking[]> {
  const res = await fetch("/api/bookings", { cache: "no-store" })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) return []
  return ((await res.json()) as { bookings: MoveBooking[] }).bookings
}
