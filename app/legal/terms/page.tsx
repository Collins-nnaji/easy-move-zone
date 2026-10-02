import type { Metadata } from "next"
import { Bullets, LegalLink, LegalPage, Mail } from "@/components/platform/LegalPage"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description: "The terms for using EasyMoveZone to book home moves, office relocations and bulky-item transport.",
  path: "/legal/terms",
})

const sections = [
  {
    id: "agreement",
    title: "About these terms",
    body: <>
      <p>These terms are an agreement between you and EasyMoveZone (&ldquo;we&rdquo;, &ldquo;us&rdquo;) and apply whenever you use our website, apps and services (the &ldquo;service&rdquo;). By creating an account or using the service, you agree to them. If you don&apos;t agree, please don&apos;t use the service.</p>
      <p>Our <LegalLink href="/legal/privacy">Privacy Policy</LegalLink> and <LegalLink href="/legal/cookies">Cookie Policy</LegalLink> explain how we handle your information.</p>
    </>,
  },
  {
    id: "service",
    title: "The service",
    body: <p>EasyMoveZone helps coordinate trucks, moving crews and optional packing, unpacking, assembly and cleaning for home moves, office relocations and bulky-item transport. You can request a quote, track a move reference and contact our team. We may add, change or remove features over time.</p>,
  },
  {
    id: "estimates",
    title: "Quotes and booking confirmation",
    body: <>
      <p>Submitting the quote request does not take payment or reserve a truck or crew. Service coverage and available extras are confirmed by our team.</p>
      <p>A request is not a confirmed booking. Your move is confirmed when our team agrees the quote, date, truck, crew and included services with you. Quotes account for inventory, distance, stairs and access. Changes to these details may require a revised quote, agreed before work proceeds. Keep an item checklist and condition photos. Report missing or damaged items to support with your reference and evidence so our team can review the issue with the crew. Any applicable liability or cover is stated in the agreed booking terms.</p>
    </>,
  },
  {
    id: "accounts",
    title: "Your account",
    body: <Bullets items={[
      "You must be at least 18 to book a move.",
      "Give accurate information about your inventory, addresses and access, and keep it up to date.",
      "Keep your login secure. You are responsible for activity under your account.",
      <>You can stop using the service at any time. To close your account, email <Mail />.</>,
    ]} />,
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: <>
      <p>You agree not to:</p>
      <Bullets items={[
        "break the law, or request transport for items you have no right to move",
        "misstate inventory, item condition, access or collection details",
        "try to access other people's accounts or data, or disrupt the service",
        "scrape, copy or resell the service or its listings without our written permission",
      ]} />
    </>,
  },
  {
    id: "ip",
    title: "Our intellectual property",
    body: <p>The service, including its software, design, moving service information and branding, belongs to EasyMoveZone or its licensors. We give you a personal, non-transferable right to use it in line with these terms.</p>,
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    body: <>
      <p>We provide the service with reasonable care. We cannot promise a truck, a crew or a particular date until the booking arrangements are confirmed.</p>
      <p>Nothing in these terms limits liability that cannot legally be limited, including for death or personal injury caused by negligence, or for fraud.</p>
    </>,
  },
  {
    id: "law",
    title: "Governing law",
    body: <p>These terms are governed by the laws of the Federal Republic of Nigeria. If you use the service as a consumer outside Nigeria, you keep the protection of any local mandatory laws.</p>,
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      current="/legal/terms"
      title="Terms of Service"
      updated="3 October 2026"
      intro={<p>These terms explain what EasyMoveZone provides when you request a home move, office relocation or bulky-item delivery.</p>}
      sections={sections}
    />
  )
}
