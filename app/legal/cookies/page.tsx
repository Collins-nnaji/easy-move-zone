import type { Metadata } from "next"
import { Bullets, LegalLink, LegalPage } from "@/components/platform/LegalPage"
import { buildPageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = buildPageMetadata({
  title: "Cookie Policy",
  description: "The cookies and browser storage EasyMoveZone uses to keep you signed in and remember a move on this device.",
  path: "/legal/cookies",
})

const rows = [
  { name: "Sign-in session cookies", purpose: "Keep you signed in and protect your account from forged requests.", type: "Strictly necessary", duration: "Session to 30 days" },
  { name: "Shipment drafts (local storage)", purpose: "Remembers moves you save in this browser so tracking can find the reference.", type: "Functional", duration: "Until you clear it" },
  { name: "Google Analytics (_ga, _ga_*)", purpose: "Counts visits and shows which pages are used, so we can improve the site.", type: "Analytics", duration: "Up to 2 years" },
]

const sections = [
  {
    id: "what",
    title: "What cookies are",
    body: <p>Cookies are small text files a website stores in your browser. Local storage is a similar feature that lets a site remember information on your device. We use both to run EasyMoveZone and to keep a move reference on the device where you saved it.</p>,
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
      <p>Google Analytics is provided by Google, which receives your IP address and browsing data from these cookies. You can opt out with the <LegalLink href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out add-on</LegalLink>. We don&apos;t use advertising cookies.</p>
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
      <p>If you block strictly necessary cookies you won&apos;t be able to sign in. If you clear local storage, move references saved only on that device are removed.</p>
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
      updated="2 October 2026"
      intro={<p>This policy explains the browser storage EasyMoveZone uses to keep you signed in and to remember a move on this device.</p>}
      sections={sections}
    />
  )
}
