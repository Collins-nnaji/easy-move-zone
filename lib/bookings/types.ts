export type BookingType = "trip" | "stay" | "visa" | "school" | "job"

export type BookingStatus = "reserved" | "confirmed" | "cancelled"

export interface MoveBooking {
  id: string
  authUserId: string
  bookingType: BookingType
  destinationCity: string
  destinationCountry: string
  itemTitle: string
  provider: string
  priceLabel: string
  startDate: string | null
  endDate: string | null
  guests: number
  status: BookingStatus
  notes: string
  createdAt: string
  updatedAt: string
}

/** Fields a client supplies when reserving — server fills the rest. */
export interface NewBookingInput {
  bookingType: BookingType
  destinationCity: string
  destinationCountry?: string
  itemTitle: string
  provider?: string
  priceLabel?: string
  startDate?: string | null
  endDate?: string | null
  guests?: number
  notes?: string
}
