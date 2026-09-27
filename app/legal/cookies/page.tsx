import type { Metadata } from "next"
import { Bullets, LegalLink, LegalPage } from "@/components/platform/LegalPage"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "The cookies and browser storage EasyMoveZone uses, and how to control them.",
}

const rows = [
  { name: "Sign-in session cookies", purpose: "Keep you signed in and protect your account from forged requests.", type: "Strictly necessary", duration: "Session to 30 days" },
  { name: "Workspace progress (local storage)", purpose: "Remembers your in-progress move plan, profile draft and detected skills on this device so you don't lose work.", type: "Functional", duration: "Until you clear it" },
  { name: "Stripe cookies", purpose: "Set by Stripe on checkout and billing pages to process payments and prevent fraud.", type: "Strictly necessary", duration: "Up to 2 years" },
]

const sections = [
  {
    id: "what",
    title: "What cookies are",
    body: <p>Cookies are small text files that a website stores in your browser. Local storage is a similar browser feature that lets a site remember information on your device. We use both only to run EasyMoveZone and remember your progress.</p>,
  },
  {
    id: "what-we-use",
    title: "What we use",
    body: <>
      <div className="overflow-x-auto rounded-2xl border border-[#e4dfd5] bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-[#faf8f3] text-[12px] uppercase tracking-wide text-[#6e746b]">
            <tr><th className="px-4 py-3 font-bold">Name</th><th className="px-4 py-3 font-bold">Purpose</th><th className="px-4 py-3 font-bold">Type</th><th className="px-4 py-3 font-bold">Duration</th></tr>
          </thead>
          <tbody className="divide-y divide-[#efe9dd]">
            {rows.map((row) => <tr key={row.name} className="align-top"><td className="px-4 py-3 font-semibold text-[#1b231e]">{row.name}</td><td className="px-4 py-3">{row.purpose}</td><td className="px-4 py-3 whitespace-nowrap">{row.type}</td><td className="px-4 py-3 whitespace-nowrap">{row.duration}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p>We don&apos;t use advertising or cross-site tracking cookies, and we don&apos;t currently use analytics cookies. If we add analytics, we&apos;ll update this policy and ask for your consent first where the law requires it.</p>
    </>,
  },
  {
    id: "control",
    title: "How to control cookies",
    body: <>
      <p>You can block or delete cookies and local storage in your browser settings. Here are the guides for common browsers:</p>
      <Bullets items={[
        <LegalLink key="chrome" href="https://support.google.com/chrome/answer/95647">Google Chrome</LegalLink>,
        <LegalLink key="safari" href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac">Safari</LegalLink>,
        <LegalLink key="firefox" href="https://support.mozilla.org/kb/clear-cookies-and-site-data-firefox">Firefox</LegalLink>,
        <LegalLink key="edge" href="https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09">Microsoft Edge</LegalLink>,
      ]} />
      <p>If you block strictly necessary cookies you won&apos;t be able to sign in. If you clear local storage, any unsaved workspace progress on that device will be lost. Anything saved to your account is not affected.</p>
    </>,
  },
  {
    id: "more",
    title: "More information",
    body: <p>For more on how we handle personal information, see our <LegalLink href="/legal/privacy">Privacy Policy</LegalLink>.</p>,
  },
]

export default function CookiesPage() {
  return (
    <LegalPage
      current="/legal/cookies"
      title="Cookie Policy"
      updated="27 September 2026"
      intro={<p>This policy explains the small amount of browser storage EasyMoveZone uses. It&apos;s there to keep you signed in and to save your progress, not to track you.</p>}
      sections={sections}
    />
  )
}
