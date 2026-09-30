import type { Metadata } from "next"
import { Bullets, LegalLink, LegalPage, Mail } from "@/components/platform/LegalPage"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "How EasyMoveZone collects, uses, stores and protects your personal information, and the choices you have.",
  path: "/legal/privacy",
})

const sections = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: <>
      <p>EasyMoveZone (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides tools that help you plan a career or country move: My Workspace, CVs and documents, Jobs and Fit Check, sponsor search, Work Simulation and specialist support. We are the controller of the personal information described in this policy.</p>
      <p>You can contact us about privacy at any time at <Mail />.</p>
    </>,
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    body: <>
      <p><strong className="text-[#1b231e]">Information you give us</strong></p>
      <Bullets items={[
        "Account details: your name, email address and password, or the basic profile Google shares if you sign in with Google.",
        "Career and move details: current and target roles, experience, education, skills, destinations, savings range, family situation and sponsorship needs you enter into My Workspace.",
        "CVs you build or edit with us, and application packs you create for jobs.",
        "Documents you upload, such as CVs, certificates, passports or ID, and offer letters. Identity documents can contain sensitive details, so please only upload what you need.",
        "Work Simulation answers, scores and badges.",
        "Messages you send us through the contact or specialist support forms.",
      ]} />
      <p><strong className="text-[#1b231e]">Information created when you use the service</strong></p>
      <Bullets items={[
        "Text we extract from your uploaded documents, structured CV data, skills we detect, move scores and Fit Check results.",
        "Subscription status and a customer reference from our payment provider. We never see or store your full card number.",
        "Technical data such as IP address, browser and device type, pages requested, error logs, and the sign-in cookies and local storage described in our Cookie Policy.",
      ]} />
    </>,
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: <>
      <Bullets items={[
        <><strong className="text-[#1b231e]">To provide the service</strong> (performance of our contract with you): signing you in, saving your workspace, CVs and documents, generating scores, Fit Checks and application packs, and running Work Simulations.</>,
        <><strong className="text-[#1b231e]">To take payments</strong> (contract): managing your Jobs membership and billing through Stripe.</>,
        <><strong className="text-[#1b231e]">To support you</strong> (contract and legitimate interests): answering enquiries and passing specialist requests to our support team.</>,
        <><strong className="text-[#1b231e]">To keep the service safe and working</strong> (legitimate interests): preventing abuse and fraud, rate limiting, fixing errors and improving features.</>,
        <><strong className="text-[#1b231e]">To meet legal obligations</strong>: keeping payment and tax records, and responding to lawful requests.</>,
      ]} />
      <p>We don&apos;t sell your personal information, and we don&apos;t use it for third-party advertising.</p>
    </>,
  },
  {
    id: "ai",
    title: "How we use AI",
    body: <>
      <p>Some features use AI models from OpenAI and Microsoft Azure OpenAI. These include reading and structuring your CV, drafting or refining CV sections, scoring your move, and tailoring application packs. For these features we send the relevant text (for example, your CV and the job description) to the model provider to produce a result.</p>
      <p>We use these providers under business terms that don&apos;t allow them to use your content to train their models. We instruct the models not to invent facts, but AI output can still be wrong, so please review everything before you use it.</p>
      <p>AI results are there to help you. We don&apos;t use them to make decisions that have legal or similarly significant effects on you.</p>
    </>,
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: <>
      <p>We share personal information only with service providers who process it on our behalf and under contract:</p>
      <Bullets items={[
        "Neon: database, account sign-in and private file storage for your documents.",
        "Stripe: payment processing and subscription billing.",
        "OpenAI and Microsoft (Azure OpenAI): AI processing, as described above.",
        "Email or SMS providers, where we send you service notifications.",
        "Hosting and error-monitoring providers that run the website.",
      ]} />
      <p>We may also disclose information if the law requires it, to protect people&apos;s rights and safety, or as part of a business reorganisation, sale or merger. In a reorganisation, sale or merger, your information would stay protected by this policy.</p>
      <p>We never share your documents with employers, sponsors or advisers unless you ask us to.</p>
    </>,
  },
  {
    id: "storage",
    title: "Where your data is stored and how we protect it",
    body: <>
      <p>Your data is stored with our providers, mainly in data centres in the United States. When we transfer personal information outside the UK or EEA, we rely on recognised safeguards such as the UK International Data Transfer Addendum and the EU Standard Contractual Clauses.</p>
      <p>Uploaded documents are kept in private storage that only your signed-in account can access. They are never published at a public web address. Data is encrypted in transit, and access to production systems is restricted to people who need it.</p>
    </>,
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: <Bullets items={[
      "Account, workspace and CV data: while your account is open. When you close your account we delete it, apart from anything the law requires us to keep.",
      "Uploaded documents: until you delete them or close your account. Deleting a document also removes the stored file.",
      "Payment and tax records: for as long as the law requires, usually six years.",
      "Support messages: up to two years after your enquiry is resolved.",
      "Backups: deleted data may remain in encrypted backups for a short period until they are overwritten.",
    ]} />,
  },
  {
    id: "rights",
    title: "Your rights",
    body: <>
      <p>Depending on where you live, including under UK and EU data protection law, you have the right to:</p>
      <Bullets items={[
        "access the personal information we hold about you and get a copy of it",
        "have inaccurate information corrected",
        "have your information deleted",
        "restrict or object to certain processing",
        "receive your information in a portable format",
        "withdraw consent where we rely on it",
      ]} />
      <p>You can delete CVs and documents yourself in My Workspace. For anything else, email <Mail />. We&apos;ll respond within one month.</p>
      <p>If you&apos;re unhappy with how we handle your information, you can complain to the UK Information Commissioner&apos;s Office (<LegalLink href="https://ico.org.uk/make-a-complaint/">ico.org.uk</LegalLink>) or to your local data protection authority.</p>
    </>,
  },
  {
    id: "children",
    title: "Children",
    body: <p>EasyMoveZone is not intended for anyone under 16, and we don&apos;t knowingly collect their information. If you believe a child has given us personal information, contact us and we&apos;ll delete it.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>We may update this policy as the service changes. If we make significant changes, we&apos;ll tell you in the app or by email before they take effect. The date at the top shows when this policy was last revised. See also our <LegalLink href="/legal/terms">Terms of Service</LegalLink> and <LegalLink href="/legal/cookies">Cookie Policy</LegalLink>.</p>,
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/legal/privacy"
      title="Privacy Policy"
      updated="27 September 2026"
      intro={<p>This policy explains what personal information EasyMoveZone collects, why we collect it, who we share it with, and the choices you have. We only ask for what we need to help you plan your move.</p>}
      sections={sections}
    />
  )
}
