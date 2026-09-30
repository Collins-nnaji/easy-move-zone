import type { Metadata } from "next"
import { Briefcase, FileText, GraduationCap, Medal, Repeat, ShieldCheck, Target } from "lucide-react"
import { LandingPage, type LandingContent } from "@/components/seo/LandingPage"
import { DESTINATION_COUNT } from "@/lib/seo/facts"
import { buildPageMetadata } from "@/lib/site-metadata"

const path = "/jobs-in-uk"
const title = "Jobs in the UK with Visa Sponsorship · EasyMoveZone"
const description =
  "Find jobs in the UK with visa sponsorship. Check if an employer is a licensed sponsor, see how well you fit each role and apply with a UK-ready CV. Start free."

export const metadata: Metadata = buildPageMetadata({
  title,
  absoluteTitle: true,
  description,
  path,
  keywords: [
    "jobs in UK",
    "UK jobs",
    "jobs in UK for foreigners",
    "UK jobs with visa sponsorship",
    "how to find a job in UK",
    "how to get a job in UK from abroad",
    "UK job sites for foreigners",
    "skilled worker visa jobs",
    "UK licensed sponsors",
    "visa sponsorship jobs UK",
    "CV for UK jobs",
    "jobs in London with visa sponsorship",
  ],
})

const content: LandingContent = {
  path,
  schema: { name: title, description },
  hero: {
    eyebrow: "UK jobs for international applicants",
    title: "Find Jobs in the UK",
    highlight: "with Visa Sponsorship",
    lede: "Search UK roles, check the employer against the official register of licensed sponsors, and know whether you fit before you spend an evening on an application.",
    cta: { appHref: "/jobs", signedInLabel: "Browse UK jobs", signedOutLabel: "Start free — browse jobs" },
    secondary: { label: "Check a sponsor", href: "/visa-sponsor-checker" },
    trust: ["Free account", "No credit card", "Official UK sponsor register"],
  },
  stats: [
    { value: "120,000+", label: "Licensed UK sponsors" },
    { value: "£0", label: "To browse every role" },
    { value: String(DESTINATION_COUNT), label: "Destinations covered" },
    { value: "1 click", label: "To tailor your CV to a role" },
  ],
  steps: {
    title: "From search to a stronger application in three steps",
    subtitle: "Skip the roles that can't sponsor you and put your effort where it counts.",
    items: [
      { title: "Search sponsor-friendly roles", body: "Browse UK jobs that mention visa sponsorship or come from employers known to sponsor." },
      { title: "Check the employer and your fit", body: "Look the company up on the licensed sponsor register and run Fit Check against the job's must-haves." },
      { title: "Apply with a UK-ready CV", body: "Build a clean, two-page UK-style CV and tailor it to the role before you apply." },
    ],
  },
  features: {
    eyebrow: "Why EasyMoveZone",
    title: "Built for people who need a sponsor, not just a job",
    subtitle: "General job boards don't tell you whether an employer can sponsor you. We start there.",
    items: [
      {
        icon: ShieldCheck,
        title: "Licensed sponsor check",
        body: "Search the Home Office register of licensed sponsors by company name before you apply.",
        href: "/visa-sponsor-checker",
        linkLabel: "Check a sponsor free",
      },
      {
        icon: Target,
        title: "Fit Check before you apply",
        body: "See your fit level, the must-haves you're missing and whether it's worth applying.",
        href: "/ai-job-search",
        linkLabel: "How Fit Check works",
      },
      {
        icon: FileText,
        title: "A CV UK employers expect",
        body: "Upload your current CV and turn it into a clear, ATS-friendly UK format you can edit and download.",
        href: "/cv-builder",
        linkLabel: "Build your CV",
      },
      {
        icon: Medal,
        title: "Proof beyond your CV",
        body: "Earn bronze, silver or gold badges in timed work simulations for the role you want.",
        href: "/work-simulation",
        linkLabel: "Try a simulation",
      },
    ],
  },
  audiences: {
    title: "Who uses EasyMoveZone to find UK jobs",
    subtitle: "Different starting points, one goal: a UK role with a sponsor behind it.",
    items: [
      {
        icon: Briefcase,
        title: "Skilled workers abroad",
        body: "Nurses, engineers, developers and other professionals looking for a Skilled Worker sponsor.",
        href: "/jobs",
        linkLabel: "Browse jobs",
      },
      {
        icon: GraduationCap,
        title: "International students",
        body: "Graduates in the UK planning the switch from a student or Graduate visa to sponsored work.",
        href: "/education",
        linkLabel: "Explore study routes",
      },
      {
        icon: Repeat,
        title: "Career changers",
        body: "People moving into a new field and a new country at the same time, who need a clear plan.",
        href: "/career-change",
        linkLabel: "Plan a career change",
      },
    ],
  },
  faqs: [
    {
      question: "Can a foreigner get a job in the UK?",
      answer:
        "Yes. Most people who aren't UK or Irish citizens need a visa to work in the UK, and the main route is the Skilled Worker visa. It needs a job offer from an employer the Home Office has licensed to sponsor workers, in an eligible role that meets the salary rules.",
    },
    {
      question: "How do I find UK jobs that offer visa sponsorship?",
      answer:
        "Search for roles that mention sponsorship, then confirm the employer is on the register of licensed sponsors. EasyMoveZone does both in one place, and Fit Check tells you whether the role matches your experience before you apply.",
    },
    {
      question: "How do I check if a UK company can sponsor a visa?",
      answer:
        "The Home Office publishes a register of licensed sponsors. Search it by company name in EasyMoveZone Sponsors. A licence means the employer is allowed to sponsor — it doesn't guarantee that a particular vacancy offers sponsorship, so always confirm with the employer.",
    },
    {
      question: "What should a UK CV look like?",
      answer:
        "UK CVs are usually two pages, in reverse-chronological order, with a short profile at the top. Leave out your photo, date of birth and marital status. Focus on results in each role and match your wording to the job description.",
    },
    {
      question: "Is EasyMoveZone free to use?",
      answer:
        "Creating an account is free. Browsing jobs, searching sponsors, building CVs and taking work simulations are free. Fit Check and tailored application packs are part of the paid Jobs membership.",
    },
  ],
  crossLink: {
    eyebrow: "Open to other countries?",
    title: "Find jobs abroad with visa sponsorship",
    body: `Compare skilled-work routes across ${DESTINATION_COUNT} destinations, from Ireland and Germany to Canada and Australia.`,
    href: "/jobs-abroad",
    label: "Explore jobs abroad",
  },
  bottomCta: {
    title: "Start your UK job search the right way",
    body: "Search sponsor-friendly roles, check every employer and apply with a CV built for the UK.",
  },
}

export default function JobsInUkPage() {
  return <LandingPage content={content} />
}
