import type { Metadata } from "next"
import { Bullets, LegalLink, LegalPage, Mail } from "@/components/platform/LegalPage"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "How EasyMoveZone collects, uses and protects personal information when you book produce moves or contact us.",
  path: "/legal/privacy",
})

const sections = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: <>
      <p>EasyMoveZone (&ldquo;we&rdquo;, &ldquo;us&rdquo;) runs a produce corridor for moving Nigerian food between states and toward export ports. We are the controller of the personal information described in this policy.</p>
      <p>You can contact us about privacy at <Mail />.</p>
    </>,
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    body: <>
      <p><strong className="text-[#1b231e]">Information you give us</strong></p>
      <Bullets items={[
        "Account details: your name, email address and password, or the basic profile Google shares if you sign in with Google.",
        "Move details you type into a booking: crop, weight, origin, destination, ready date and a contact name or phone.",
        "Messages you send through the contact form, including an optional phone number.",
      ]} />
      <p><strong className="text-[#1b231e]">Information created when you use the service</strong></p>
      <Bullets items={[
        "Shipment references saved in this browser until you clear site data.",
        "Technical data such as IP address, browser and device type, pages requested, and the sign-in cookies described in our Cookie Policy.",
      ]} />
    </>,
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: <>
      <Bullets items={[
        <><strong className="text-[#1b231e]">To provide the service</strong>: signing you in, keeping a move reference, and showing tracking steps.</>,
        <><strong className="text-[#1b231e]">To reply to you</strong>: answering questions about corridors, lots and export lanes.</>,
        <><strong className="text-[#1b231e]">To keep the service safe</strong>: preventing abuse, fixing errors and understanding which pages are used.</>,
        <><strong className="text-[#1b231e]">To meet legal obligations</strong>: keeping records the law requires, and responding to lawful requests.</>,
      ]} />
      <p>We don&apos;t sell your personal information.</p>
    </>,
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: <>
      <p>We share personal information with service providers who process it for us and under contract, including hosting, sign-in, email and error monitoring. A confirmed haulage partner receives the contact and load details needed to move that shipment.</p>
      <p>We may also disclose information if the law requires it, or as part of a business reorganisation. In a reorganisation, your information would stay protected by this policy.</p>
    </>,
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: <Bullets items={[
      "Account details: while your account is open, then deleted apart from anything the law requires us to keep.",
      "Moves saved only in this browser: until you clear site data on that device.",
      "Support messages: up to two years after the enquiry is resolved.",
    ]} />,
  },
  {
    id: "rights",
    title: "Your rights",
    body: <>
      <p>Depending on where you live, you can ask to access, correct or delete your personal information, or object to certain uses of it. Email <Mail /> and we will respond within one month.</p>
      <p>See also our <LegalLink href="/legal/terms">Terms of Service</LegalLink> and <LegalLink href="/legal/cookies">Cookie Policy</LegalLink>.</p>
    </>,
  },
  {
    id: "children",
    title: "Children",
    body: <p>EasyMoveZone is not intended for anyone under 18, and we don&apos;t knowingly collect their information.</p>,
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/legal/privacy"
      title="Privacy Policy"
      updated="2 October 2026"
      intro={<p>This policy explains what personal information EasyMoveZone collects when you book a produce move or write to us, and the choices you have.</p>}
      sections={sections}
    />
  )
}
