import type { Metadata } from "next"
import { Briefcase, Compass, Gauge, GraduationCap, Headphones, Map as MapIcon, Users } from "lucide-react"
import { LandingPage, type LandingContent } from "@/components/seo/LandingPage"
import { DESTINATION_COUNT, GUIDE_COUNTRY_NAMES, listCountries } from "@/lib/seo/facts"
import { buildPageMetadata } from "@/lib/site-metadata"

const path = "/jobs-abroad"
const title = "Jobs Abroad and Visa Sponsorship by Country · EasyMoveZone"
const description =
  "Find jobs abroad with visa sponsorship. Compare work routes in the UK, Canada, Australia, Germany, Ireland and more, then apply with a tailored CV. Start free."

export const metadata: Metadata = buildPageMetadata({
  title,
  absoluteTitle: true,
  description,
  path,
  keywords: [
    "jobs abroad",
    "work abroad",
    "international jobs",
    "overseas jobs",
    "jobs abroad with visa sponsorship",
    "jobs in Canada with visa sponsorship",
    "jobs in Australia for foreigners",
    "jobs in Germany for foreigners",
    "jobs in Ireland with visa sponsorship",
    "how to apply for jobs in a foreign country",
    "Europe job apply website",
    "work visa jobs",
  ],
})

const content: LandingContent = {
  path,
  schema: { name: title, description },
  hero: {
    eyebrow: `Work abroad in ${DESTINATION_COUNT} destinations`,
    title: "Find Jobs Abroad",
    highlight: "with Visa Sponsorship",
    lede: "See which work visa routes fit you, find employers who hire international staff, and apply with a CV written for the role — all before you book a flight.",
    cta: { appHref: "/jobs", signedInLabel: "Browse jobs abroad", signedOutLabel: "Start free — browse jobs" },
    secondary: { label: "Compare countries", href: "/sponsors" },
    trust: ["Free account", "No credit card", `${DESTINATION_COUNT} country route guides`],
  },
  stats: [
    { value: String(DESTINATION_COUNT), label: "Destinations covered" },
    { value: "£0", label: "To browse every role" },
    { value: "120,000+", label: "Licensed UK sponsors" },
    { value: "1 plan", label: "For your job and your move" },
  ],
  steps: {
    title: "How to find a job abroad without guessing",
    subtitle: "Pick a destination, check your route, then go after roles that can actually get you there.",
    items: [
      { title: "Choose where you want to work", body: "Compare skilled-work routes, sponsorship rules and official links for each destination." },
      { title: "Check your chances", body: "Score your visa route and career fit in My Workspace, and see what would make it stronger." },
      { title: "Apply to the right roles", body: "Browse jobs by country, run Fit Check and tailor your CV before you apply." },
    ],
  },
  features: {
    eyebrow: "Why EasyMoveZone",
    title: "Everything you need to work in another country",
    subtitle: "Job boards list vacancies. We help you work out which ones can lead to a visa.",
    items: [
      {
        icon: MapIcon,
        title: "Route guides by country",
        body: `Plain-English guides to skilled-work routes in ${listCountries(GUIDE_COUNTRY_NAMES)}.`,
        href: "/sponsors",
        linkLabel: "Open route guides",
      },
      {
        icon: Briefcase,
        title: "Jobs by destination",
        body: "Browse sponsorship-friendly roles by country and see who is hiring international staff.",
        href: "/jobs",
        linkLabel: "Browse jobs",
      },
      {
        icon: Gauge,
        title: "Your move chances",
        body: "My Workspace scores your immigration route for a destination and shows your next steps.",
        href: "/workspace",
        linkLabel: "Open My Workspace",
      },
      {
        icon: Headphones,
        title: "Specialist help",
        body: "Family moves, refusals or several countries at once? Ask a specialist to review your case.",
        href: "/specialist-support",
        linkLabel: "Get specialist help",
      },
    ],
  },
  audiences: {
    title: "Who looks for jobs abroad with EasyMoveZone",
    subtitle: "Whether it's your first move or your third, start from what you already have.",
    items: [
      {
        icon: Compass,
        title: "Skilled professionals",
        body: "Experienced people in healthcare, tech, engineering and other shortage fields ready to move.",
        href: "/jobs-in-uk",
        linkLabel: "Start with UK jobs",
      },
      {
        icon: GraduationCap,
        title: "Students and graduates",
        body: "Study abroad first, then use post-study work rights as a path to a sponsored job.",
        href: "/education",
        linkLabel: "Explore study routes",
      },
      {
        icon: Users,
        title: "Career and country changers",
        body: "People changing field and country together, who want a plan that makes both work.",
        href: "/career-change",
        linkLabel: "Plan a career change",
      },
    ],
  },
  faqs: [
    {
      question: "Which countries sponsor foreign workers?",
      answer:
        "Many do. The UK has the Skilled Worker visa, Ireland has employment permits, Germany and the Netherlands offer the EU Blue Card and highly skilled migrant routes, and Canada, Australia and New Zealand run employer-sponsored and skilled migration programmes. Our route guides summarise each one with links to official sources.",
    },
    {
      question: "How do I apply for a job in a foreign country?",
      answer:
        "Pick a destination whose visa routes fit your job and experience, target employers that hire international staff, adapt your CV to local norms, and apply online. Many first interviews are held by video, so you can often start the process from home.",
    },
    {
      question: "Do I need a job offer before I move abroad?",
      answer:
        "For most employer-sponsored work visas, yes — the employer sponsors you for a specific role. Some countries also run points-based skilled migration routes, such as Canada's Express Entry, that don't always need a job offer. Check the current official rules for your destination.",
    },
    {
      question: "How can I tell if a job abroad with visa sponsorship is real?",
      answer:
        "Be wary of anyone who asks you to pay for a job offer or a visa. Check the employer's official website, and for UK roles confirm the company is on the register of licensed sponsors. If an offer seems too good to be true, get a second opinion.",
    },
    {
      question: "Is EasyMoveZone free to use?",
      answer:
        "Creating an account is free. Country guides, job browsing, sponsor search, CV building and work simulations are free. Fit Check and tailored application packs are part of the paid Jobs membership.",
    },
  ],
  crossLink: {
    eyebrow: "Most searched destination",
    title: "Find jobs in the UK with visa sponsorship",
    body: "Search the official UK register of licensed sponsors and browse UK roles in one place.",
    href: "/jobs-in-uk",
    label: "See UK jobs",
  },
  bottomCta: {
    title: "Your job abroad starts with the right route",
    body: "Compare countries, check your chances and apply to roles that can sponsor you.",
  },
}

export default function JobsAbroadPage() {
  return <LandingPage content={content} />
}
