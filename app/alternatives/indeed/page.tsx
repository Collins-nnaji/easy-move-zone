import type { Metadata } from "next"
import { Globe2, Layers, Map as MapIcon, Search, ShieldCheck, Target, Briefcase } from "lucide-react"
import { LandingPage, type LandingContent } from "@/components/seo/LandingPage"
import { DESTINATION_COUNT } from "@/lib/seo/facts"
import { buildPageMetadata } from "@/lib/site-metadata"

const path = "/alternatives/indeed"
const title = "Indeed Alternative for Visa Sponsorship Jobs · EasyMoveZone"
const description =
  "Looking for an Indeed alternative for visa sponsorship jobs? EasyMoveZone checks employers against the UK sponsor register and scores your fit. Try it free."

export const metadata: Metadata = buildPageMetadata({
  title,
  absoluteTitle: true,
  description,
  path,
  keywords: [
    "Indeed alternative",
    "sites like Indeed",
    "Indeed UK alternative",
    "alternative to Indeed",
    "Indeed visa sponsorship jobs",
    "Indeed job search",
    "Indeed UK",
    "job sites like Indeed for foreigners",
    "best job sites for visa sponsorship",
    "UK job sites for foreigners",
    "Indeed vs EasyMoveZone",
    "visa sponsorship job board",
  ],
})

const content: LandingContent = {
  path,
  schema: { name: title, description },
  hero: {
    eyebrow: "Indeed alternative for visa seekers",
    title: "Best Free Indeed Alternative —",
    highlight: "EasyMoveZone",
    lede: "Indeed is a great place to see a huge range of jobs. If you need visa sponsorship, EasyMoveZone adds what a general job board doesn't: a licensed sponsor check, route guides and a fit score for every role.",
    cta: { appHref: "/jobs", signedInLabel: "Browse sponsored jobs", signedOutLabel: "Start free — browse jobs" },
    secondary: { label: "Check a sponsor", href: "/visa-sponsor-checker" },
    trust: ["Free account", "No credit card", "Use it alongside any job board"],
  },
  stats: [
    { value: "120,000+", label: "Licensed UK sponsors" },
    { value: String(DESTINATION_COUNT), label: "Destination route guides" },
    { value: "£0", label: "To browse and check sponsors" },
    { value: "4", label: "Answers on every Fit Check" },
  ],
  steps: {
    title: "Switching takes a few minutes",
    subtitle: "Keep using the job boards you like. Use EasyMoveZone to decide which roles are worth your time.",
    items: [
      { title: "Create a free account", body: "Sign up with email or Google and upload your CV once." },
      { title: "Check any employer", body: "Search the UK licensed sponsor register — including companies you found on other job boards." },
      { title: "Focus your applications", body: "Browse sponsorship-friendly roles, run Fit Check and tailor your CV for the ones that fit." },
    ],
  },
  features: {
    eyebrow: "Why people switch",
    title: "What visa seekers get that a general job board doesn't offer",
    subtitle: "We're not trying to list every job. We help you find the ones that can lead to a visa.",
    items: [
      {
        icon: ShieldCheck,
        title: "Sponsor check built in",
        body: "Look up any UK employer on the official register of licensed sponsors in seconds.",
        href: "/visa-sponsor-checker",
        linkLabel: "Check a sponsor free",
      },
      {
        icon: MapIcon,
        title: "Route guides by country",
        body: `Plain-English skilled-work routes for ${DESTINATION_COUNT} destinations, with official links.`,
        href: "/jobs-abroad",
        linkLabel: "Compare countries",
      },
      {
        icon: Target,
        title: "Fit Check on every role",
        body: "See your fit level, missing must-haves and a sponsorship signal before you apply.",
        href: "/ai-job-search",
        linkLabel: "How Fit Check works",
      },
      {
        icon: Layers,
        title: "Tailored applications",
        body: "Create a role-specific CV and cover letter from your real experience in one click.",
        href: "/cover-letter-generator",
        linkLabel: "See application packs",
      },
    ],
  },
  comparison: {
    title: "EasyMoveZone vs Indeed",
    subtitle: "An honest look at where each one fits. Many people use both.",
    competitor: "Indeed",
    rows: [
      { feature: "Number of job listings", us: "Focused on sponsorship-friendly roles", them: "Very large, across all job types" },
      { feature: "Free for job seekers", us: true, them: true },
      { feature: "UK licensed sponsor register check", us: true, them: "Not a listed feature" },
      { feature: "Visa route guides by country", us: `${DESTINATION_COUNT} destinations`, them: "Not a core feature" },
      { feature: "Fit score against job must-haves", us: "Yes, with Jobs membership", them: "Varies by listing" },
      { feature: "CV tailored to each job, with cover letter", us: "Yes, with Jobs membership", them: "Limited" },
      { feature: "CV builder", us: true, them: true },
      { feature: "Company reviews and salary data", us: false, them: true },
    ],
    note: "Based on publicly available information as of September 2026; features change, so check each site. Indeed is a trademark of its owner. EasyMoveZone is not affiliated with Indeed.",
  },
  audiences: {
    title: "Who EasyMoveZone is the better fit for",
    subtitle: "If any of these sounds like you, add EasyMoveZone to your job search.",
    items: [
      {
        icon: Search,
        title: "Anyone who needs a UK sponsor",
        body: "Stop applying to employers that can't sponsor you. Check the register first.",
        href: "/jobs-in-uk",
        linkLabel: "Find UK sponsored jobs",
      },
      {
        icon: Globe2,
        title: "People comparing countries",
        body: "Weigh up visa routes and job markets across destinations before you commit.",
        href: "/jobs-abroad",
        linkLabel: "Explore jobs abroad",
      },
      {
        icon: Briefcase,
        title: "Job boards plus a second check",
        body: "Keep finding jobs anywhere, then use EasyMoveZone to verify the employer and tailor your CV.",
        href: "/cv-builder",
        linkLabel: "Build your CV",
      },
    ],
  },
  faqs: [
    {
      question: "What is the best alternative to Indeed for visa sponsorship jobs?",
      answer:
        "If you need a visa, look for a tool that checks whether the employer can sponsor you. EasyMoveZone lets you search the UK register of licensed sponsors, browse sponsorship-friendly roles and check your fit for each one — free to start.",
    },
    {
      question: "Does Indeed show visa sponsorship jobs?",
      answer:
        "You can search Indeed for terms like \"visa sponsorship\", and some employers mention it in their ads. Results depend on how each ad is written, so it is worth confirming the employer holds a sponsor licence before you apply.",
    },
    {
      question: "Can I use EasyMoveZone and Indeed together?",
      answer:
        "Yes, and many people do. Find roles wherever you like, then look the employer up in EasyMoveZone Sponsors and use Fit Check and tailored CVs to strengthen your application.",
    },
    {
      question: "Is EasyMoveZone free like Indeed?",
      answer:
        "Creating an account, browsing jobs, searching sponsors, building CVs and taking work simulations are free. Fit Check and tailored application packs are part of the paid Jobs membership.",
    },
    {
      question: "Are there other job sites like Indeed for foreigners?",
      answer:
        "Yes. Large boards such as LinkedIn and Glassdoor, national boards in each country and specialist sponsorship tools like EasyMoveZone all have a place. Use a big board for range and a sponsorship tool to check employers and focus your effort.",
    },
  ],
  crossLink: {
    eyebrow: "Start with the UK",
    title: "Find jobs in the UK with visa sponsorship",
    body: "Browse UK roles and check every employer against the official licensed sponsor register.",
    href: "/jobs-in-uk",
    label: "See UK jobs",
  },
  bottomCta: {
    title: "Add a sponsor check to your job search",
    body: "Keep your favourite job boards. Use EasyMoveZone to find the roles that can actually sponsor you.",
  },
}

export default function IndeedAlternativePage() {
  return <LandingPage content={content} />
}
