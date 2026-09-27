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
      eyebrow="Education pathway"
      title="Study abroad, with a route to work after."
      lede="Compare universities, courses and fees across popular study destinations, check how well you fit, and write your personal statement in one place."
    >
      <EducationClient signedIn={Boolean(session?.data?.user)} />
    </MobilityFrame>
  )
}
