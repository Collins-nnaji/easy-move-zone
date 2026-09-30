import type { Metadata } from "next"
import { Bullets, LegalLink, LegalPage, Mail } from "@/components/platform/LegalPage"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description: "The terms for using EasyMoveZone career, CV, sponsorship job and relocation tools.",
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
    body: <p>EasyMoveZone helps you explore career and country moves. You can score and plan a move in My Workspace, build and store CVs and documents, browse visa-sponsored jobs and sponsor registers, run Fit Checks, create application packs, practise with Work Simulations, and ask for specialist support. We may add, change or remove features over time.</p>,
  },
  {
    id: "not-advice",
    title: "Not legal or immigration advice",
    body: <>
      <p>Scores, Fit Checks, route suggestions, sponsor lists, jobs and simulations are for general information only. They are not immigration, legal, financial or employment advice, and they don&apos;t guarantee that you will get a visa, a job or sponsorship.</p>
      <p>Immigration rules change often. Always check requirements with official government sources, and with a qualified, regulated adviser where appropriate, before you apply, sign a contract or relocate.</p>
    </>,
  },
  {
    id: "accounts",
    title: "Your account",
    body: <Bullets items={[
      "You must be at least 16 to use EasyMoveZone.",
      "Give accurate information and keep it up to date.",
      "Keep your login secure. You're responsible for activity under your account, so tell us straight away if you think someone else has accessed it.",
      <>You can stop using the service at any time. To close your account and delete your data, email <Mail />.</>,
    ]} />,
  },
  {
    id: "your-content",
    title: "Your content and documents",
    body: <>
      <p>You own the CVs, documents and information you add (&ldquo;your content&rdquo;). You give us permission to store, process and display your content only to run the service for you. For example, we may read your CV to structure it, score your move or tailor an application pack. This permission ends when you delete the content or close your account, except where we need to keep a copy by law.</p>
      <p>You confirm that you have the right to upload your content. Don&apos;t upload other people&apos;s documents or personal information without their permission.</p>
    </>,
  },
  {
    id: "ai-content",
    title: "AI-generated content",
    body: <>
      <p>Some features use AI to draft or refine text. We tell the AI to keep to the facts you provide, but it can still make mistakes. Review everything before you rely on it or send it to anyone.</p>
      <p>You&apos;re responsible for the CVs and applications you submit. Make sure they are truthful and don&apos;t misrepresent your experience, qualifications or right to work.</p>
    </>,
  },
  {
    id: "jobs",
    title: "Jobs, sponsors and third-party information",
    body: <p>Job listings and sponsor information may come from public registers and third-party sources. We can&apos;t guarantee that a listing is accurate, still open, or that an employer will sponsor you. Links to employer or government websites are provided for convenience. We aren&apos;t responsible for their content, and your dealings with employers are between you and them.</p>,
  },
  {
    id: "payments",
    title: "Paid plans",
    body: <Bullets items={[
      "Some features, such as Fit Check and application packs, need a paid Jobs membership. The price, billing period and any taxes are shown before you pay.",
      "Payments are processed by Stripe. Your membership renews automatically at the end of each billing period until you cancel.",
      "You can cancel at any time from the billing portal in the app. Cancelling stops the next renewal, and you keep access until the end of the period you've paid for.",
      "If you're a consumer in the UK or EU, you normally have 14 days to cancel a new subscription. If you ask us to start the service straight away and use it during that time, we may deduct an amount for what you've used from any refund, as the law allows.",
      "If we change the price, we'll give you notice before it applies to your next renewal, so you can cancel first.",
    ]} />,
  },
  {
    id: "specialist",
    title: "Specialist support",
    body: <p>A specialist support enquiry is a request for us to get in touch. It isn&apos;t a paid engagement or a promise of any particular outcome. Any paid advisory service will be agreed separately and in writing.</p>,
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: <>
      <p>You agree not to:</p>
      <Bullets items={[
        "break the law, or upload content that is unlawful, fraudulent, infringing or harmful",
        "create false documents or use the service to mislead employers, sponsors or authorities",
        "try to access other people's accounts or data, or probe, scan or disrupt our systems",
        "scrape, copy or resell the service or its data without our written permission",
        "overload the service, get around usage limits, or use bots to generate content in bulk",
      ]} />
    </>,
  },
  {
    id: "ip",
    title: "Our intellectual property",
    body: <p>The service, including its software, design, templates, scoring methods and branding, belongs to EasyMoveZone or its licensors. We give you a personal, non-transferable right to use it in line with these terms. CVs and application packs you create with our templates are yours to use for your own job search.</p>,
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: <p>We may suspend or close your account if you seriously or repeatedly break these terms, if the law requires it, or to protect other users or the service. Where it&apos;s reasonable, we&apos;ll tell you why and give you a chance to fix the problem first. If we close a paid account without good reason, we&apos;ll refund any unused prepaid period.</p>,
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    body: <>
      <p>We provide the service with reasonable care and skill. Apart from that, it is provided &ldquo;as is&rdquo;, and we can&apos;t promise it will always be available, error-free or suited to your particular goals.</p>
      <p>We aren&apos;t responsible for losses that weren&apos;t foreseeable, for business losses, or for decisions made by employers, sponsors or immigration authorities. Our total liability to you for any claim is limited to the amount you paid us in the 12 months before the claim.</p>
      <p>Nothing in these terms limits liability that can&apos;t legally be limited, such as for death or personal injury caused by negligence, or for fraud. Nothing affects your statutory rights as a consumer.</p>
    </>,
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: <p>We may update these terms when the service or the law changes. If we make important changes, we&apos;ll tell you in the app or by email before they take effect. If you keep using the service after that, you accept the updated terms.</p>,
  },
  {
    id: "law",
    title: "Governing law",
    body: <p>These terms are governed by the laws of England and Wales, and the courts of England and Wales will deal with any disputes. If you live elsewhere as a consumer, you keep the protection of your local mandatory laws and can bring claims in your local courts.</p>,
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      current="/legal/terms"
      title="Terms of Service"
      updated="27 September 2026"
      intro={<p>Please read these terms carefully. They explain what you can expect from EasyMoveZone, what we expect from you, and how paid plans work.</p>}
      sections={sections}
    />
  )
}
