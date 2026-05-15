import type { Metadata } from "next"
import { LandlordPostClient } from "@/components/landlord/LandlordPostClient"

export const metadata: Metadata = {
  title: "Post a Listing — EasyMoveZone",
  description: "List your property on EasyMoveZone to reach verified movers and tenants.",
}

export default function LandlordPostPage() {
  return <LandlordPostClient />
}
