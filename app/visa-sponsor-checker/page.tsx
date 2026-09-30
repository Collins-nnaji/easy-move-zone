import type { Metadata } from "next"
import { Briefcase, Building2, GraduationCap, Hash, Link2, Search, ShieldCheck } from "lucide-react"
import { LandingPage, smartHref, type LandingContent } from "@/components/seo/LandingPage"
import { SponsorLookup } from "@/components/seo/SponsorLookup"
import { SponsorRegisterInsights } from "@/components/seo/SponsorRegisterInsights"
import { formatRegisterDate, getSponsorRegisterStats, roundedDown } from "@/lib/seo/sponsor-stats"
import { buildPageMetadata } from "@/lib/site-metadata"

const path = "/visa-sponsor-checker"
const title = "UK Visa Sponsor Checker — Free Company Search · EasyMoveZone"
const description =
  "Check if a company can sponsor your UK visa. Search over 120,000 employers on the Home Office register of licensed sponsors and see their rating. It's free."

export const metadata: Metadata = buildPageMetadata({
  title,
  absoluteTitle: true,
  description,
  path,
  keywords: [
    "visa sponsor checker",
    "UK visa sponsor checker",
    "check if a company sponsors visas",
    "UK licensed sponsors list",
    "register of licensed sponsors",
    "sponsor licence check",
    "companies that sponsor visas UK",
    "Skilled Worker sponsor list",
    "Tier 2 sponsor list",
    "does this company sponsor visas",
    "UK visa sponsorship companies",
    "Home Office sponsor list",
  ],
})

const fullSearch = { appHref: "/sponsors", signedInLabel: "Open full sponsor search", signedOutLabel: "Sign up free for full search" }

export default async function VisaSponsorCheckerPage() {
  const stats = await getSponsorRegisterStats()
  const registerDate = formatRegisterDate(stats?.loadedAt ?? null)
  const organisations = stats ? roundedDown(stats.organisations) : "120,000+"

  const content: LandingContent = {
    path,
    schema: {
      name: title,
      description,
      softwareApp: {
        name: "EasyMoveZone Visa Sponsor Checker",
        description: "Free search of the Home Office register of licensed sponsors, showing each employer's licence rating and visa routes.",
      },
    },
    hero: {
      eyebrow: "Free UK visa sponsor checker",
      title: "UK Visa Sponsor Checker:",
      highlight: "can this employer sponsor you?",
      lede: `Search ${organisations} UK employers on the Home Office register of licensed sponsors. See their licence rating and the visa routes they can sponsor, in seconds.`,
      extra: ({ signedIn }) => (
        <SponsorLookup
          fullSearchHref={smartHref(fullSearch, signedIn)}
          fullSearchLabel={signedIn ? fullSearch.signedInLabel : fullSearch.signedOutLabel}
          registerDate={registerDate}
        />
      ),
      cta: { appHref: "/sponsors", signedInLabel: "Open full sponsor search", signedOutLabel: "Create free account" },
      secondary: { label: "Find UK sponsored jobs", href: "/jobs-in-uk" },
      trust: ["No sign-up to search", "Free", "Home Office register data"],
    },
    stats: [
      { value: organisations, label: "Licensed organisations" },
      { value: stats ? roundedDown(stats.skilledWorkerOrganisations) : "Most", label: "Can sponsor Skilled Workers" },
      { value: stats ? roundedDown(stats.towns, 100) : "UK-wide", label: "Towns and cities" },
      { value: "£0", label: "To check any employer" },
    ],
    steps: {
      title: "Check a sponsor in three steps",
      subtitle: "Know whether an employer can sponsor you before you spend time on the application.",
      items: [
        { title: "Search the company", body: "Type the employer's name, or part of it. The register uses registered company names." },
        { title: "Read the licence", body: "See the licence type, its rating and the visa routes the employer is licensed for." },
        { title: "Confirm and apply", body: "Check the vacancy offers sponsorship, then apply with a CV built for UK employers." },
      ],
    },
    features: {
      eyebrow: "Why check with EasyMoveZone",
      title: "More than a spreadsheet of company names",
      subtitle: "The official register is a huge file. We make it searchable and connect it to real jobs.",
      items: [
        {
          icon: Search,
          title: "Instant name search",
          body: "No downloading or scrolling through a spreadsheet. Search by company name or town in seconds.",
        },
        {
          icon: ShieldCheck,
          title: "Rating and routes shown",
          body: "See straight away whether a licence is A- or B-rated and which visa routes it covers.",
        },
        {
          icon: Link2,
          title: "Linked to open roles",
          body: "Signed in, see careers pages and roles from that employer in our jobs database.",
          href: "/jobs-in-uk",
          linkLabel: "Browse UK sponsored jobs",
        },
        {
          icon: Hash,
          title: "Occupation codes and going rates",
          body: "Look up the occupation code for your job and the going rate that applies to it.",
          href: "/sponsors",
          linkLabel: "Open the full search",
        },
      ],
    },
    afterFeatures: <SponsorRegisterInsights stats={stats} registerDate={registerDate} />,
    audiences: {
      title: "Who uses the visa sponsor checker",
      subtitle: "Anyone who needs to know an employer can sponsor them before they commit.",
      items: [
        {
          icon: Briefcase,
          title: "Job seekers from abroad",
          body: "Check an employer before applying, or before you accept an offer that depends on sponsorship.",
          href: "/jobs-in-uk",
          linkLabel: "Find UK sponsored jobs",
        },
        {
          icon: GraduationCap,
          title: "Students and graduates in the UK",
          body: "Find employers who can sponsor you before your Student or Graduate visa runs out.",
          href: "/education",
          linkLabel: "Explore study routes",
        },
        {
          icon: Building2,
          title: "People using other job boards",
          body: "Found a role elsewhere? Check the employer here before you spend an evening on the application.",
          href: "/alternatives/indeed",
          linkLabel: "Compare with Indeed",
        },
      ],
    },
    faqs: [
      {
        question: "How do I check if a company can sponsor a UK visa?",
        answer:
          "Search the company name in the Home Office register of licensed sponsors. EasyMoveZone makes the register searchable for free: type the employer's name to see whether it holds a licence, its rating and the visa routes it covers.",
      },
      {
        question: "What is the register of licensed sponsors?",
        answer:
          "It's the official list of organisations the Home Office has licensed to sponsor workers, published on GOV.UK. An employer must be on it to sponsor you for routes such as the Skilled Worker visa, which replaced the Tier 2 (General) visa in December 2020.",
      },
      {
        question: "What do A rating and B rating mean on a sponsor licence?",
        answer:
          "An A rating means the sponsor is meeting its duties and can assign certificates of sponsorship. A B rating means the licence has been downgraded; the sponsor must follow an action plan and usually can't sponsor new workers until it returns to an A rating.",
      },
      {
        question: "If a company is on the list, will it sponsor me?",
        answer:
          "Not necessarily. A licence means the employer is allowed to sponsor, but each vacancy is the employer's choice, and the role must be eligible and meet the salary rules for your route. Check the job advert or ask the employer directly.",
      },
      {
        question: "What if a company isn't on the register?",
        answer:
          "Try searching part of the name, because the register uses registered company names that can differ from brand names. If it still isn't there, check the latest register on GOV.UK. An employer without a licence can't sponsor you unless it applies for one.",
      },
    ],
    crossLink: {
      eyebrow: "Found a sponsor?",
      title: "Find jobs in the UK with visa sponsorship",
      body: "Browse UK roles, run Fit Check against each job and apply with a CV built for UK employers.",
      href: "/jobs-in-uk",
      label: "See UK jobs",
    },
    bottomCta: {
      title: "Check every employer before you apply",
      body: "The full sponsor search adds careers pages, open roles and occupation codes for every licensed employer.",
    },
  }

  return <LandingPage content={content} />
}
