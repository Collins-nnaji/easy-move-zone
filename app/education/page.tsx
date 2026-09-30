import type { Metadata } from "next"
import { EducationClient } from "@/components/education/EducationClient"
import { MobilityFrame } from "@/components/mobility/MobilityFrame"
import { authServer } from "@/lib/auth/server"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Study Abroad — Courses, Fees and Work Rights",
  description:
    "Compare universities, courses and international tuition fees in the UK, Ireland, the Netherlands, Germany, Canada, Australia and the US. Check your fit and draft personal statements.",
  path: "/education",
  keywords: ["study abroad", "international tuition fees", "post-study work visa", "study in the UK", "personal statement help"],
})

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
