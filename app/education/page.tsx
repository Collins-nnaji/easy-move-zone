import type { Metadata } from "next"
import { EducationClient } from "@/components/education/EducationClient"
import { MobilityFrame } from "@/components/mobility/MobilityFrame"
import { authServer } from "@/lib/auth/server"

export const metadata: Metadata = {
  title: "Education pathway",
  description:
    "Compare universities, courses and international tuition fees in the UK, Ireland, the Netherlands, Germany, Canada, Australia and the US. Check your fit and draft personal statements.",
  alternates: { canonical: "/education" },
}

export default async function EducationPage() {
  const session = await authServer.getSession()
  return (
    <MobilityFrame
      compact
      eyebrow="Education pathway"
      title="Study abroad, with a route to work after."
      lede="Find a course, see the visa and work rights that come with it, then check your fit and write your statement."
    >
      <EducationClient signedIn={Boolean(session?.data?.user)} />
    </MobilityFrame>
  )
}
