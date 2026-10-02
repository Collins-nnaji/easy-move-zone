import type { Metadata } from "next"
import { Bullets, LegalLink, LegalPage, Mail } from "@/components/platform/LegalPage"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description: "The terms for using EasyMoveZone to book produce moves, view bulk lots and follow export lanes.",
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
    body: <p>EasyMoveZone helps you move Nigerian farm produce between states, review bulk lots by the tonne, and follow export lanes to port. You can save a move, look up a shipment reference and contact us about a corridor. We may add, change or remove features over time.</p>,
  },
  {
    id: "estimates",
    title: "Estimates, lots and haulage",
    body: <>
      <p>Fares, distances and lot prices shown on the site are estimates and sample listings for planning. They are not a confirmed truck booking, a binding sale of goods, or a customs clearance.</p>
      <p>A move is confirmed when a dispatcher agrees the truck, the weight and the fare with you. Export documents such as phytosanitary certificates, certificates of origin and bills of lading are issued by the responsible bodies, and we list them so a shipment can be followed.</p>
    </>,
  },
  {
    id: "accounts",
    title: "Your account",
    body: <Bullets items={[
      "You must be at least 18 to book a move.",
      "Give accurate information about weight, crop and origin, and keep it up to date.",
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
        "break the law, or list produce you have no right to sell or move",
        "misstate weight, grade, origin or export status",
        "try to access other people's accounts or data, or disrupt the service",
        "scrape, copy or resell the service or its listings without our written permission",
      ]} />
    </>,
  },
  {
    id: "ip",
    title: "Our intellectual property",
    body: <p>The service, including its software, design, corridor information and branding, belongs to EasyMoveZone or its licensors. We give you a personal, non-transferable right to use it in line with these terms.</p>,
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    body: <>
      <p>We provide the service with reasonable care. Apart from that, estimates and sample lots are provided for planning, and we cannot promise a truck, a buyer or a sailing on a particular day until that move is confirmed.</p>
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
      updated="2 October 2026"
      intro={<p>These terms explain what EasyMoveZone provides when you book a produce move, review a bulk lot, or follow an export lane.</p>}
      sections={sections}
    />
  )
}
