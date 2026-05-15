import type { Metadata } from "next"
import { VendorPostClient } from "@/components/vendor/VendorPostClient"

export const metadata: Metadata = {
  title: "Post a Service — EasyMoveZone",
  description: "List your moving or relocation service on EasyMoveZone to reach verified clients.",
}

export default function VendorPostPage() {
  return <VendorPostClient />
}
