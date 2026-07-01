"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface BookingRow {
  id: string
  auth_user_id: string
  booking_type: string
  destination_city: string
  item_title: string
  provider: string | null
  price_label: string | null
  status: string
  created_at: string
}

export function AdminBookingsClient() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then(async (res) => {
        if (!res.ok) throw new Error("failed")
        return (await res.json()) as { bookings: BookingRow[] }
      })
      .then((data) => setBookings(data.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading bookings…
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-xl font-bold">Bookings</h1>
      <p className="mt-1 text-sm text-white/50">{bookings.length} reservations across all users</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wide text-white/40">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bookings.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30">No bookings yet.</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{b.item_title}</div>
                    {b.provider ? <div className="text-xs text-white/40">{b.provider}</div> : null}
                  </td>
                  <td className="px-4 py-3 capitalize">{b.booking_type}</td>
                  <td className="px-4 py-3">{b.destination_city}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs capitalize">{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40">{new Date(b.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
