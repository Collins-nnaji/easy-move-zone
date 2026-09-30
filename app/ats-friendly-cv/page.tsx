import type { Metadata } from "next"
import { AlignLeft, Briefcase, GraduationCap, Heading, Repeat, Sparkles, Target } from "lucide-react"
import { LandingPage, type LandingContent } from "@/components/seo/LandingPage"
import { buildPageMetadata } from "@/lib/site-metadata"

const path = "/ats-friendly-cv"
const title = "ATS-Friendly CV Builder and Format Guide · EasyMoveZone"
const description =
  "Make an ATS-friendly CV that applicant tracking systems can read: single-column format, standard headings and job-matched wording. Build yours free today."

export const metadata: Metadata = buildPageMetadata({
  title,
  absoluteTitle: true,
  description,
  path,
  keywords: [
    "ATS friendly CV",
    "ATS friendly resume",
    "ATS CV format",
    "ATS CV template",
    "ATS resume",
    "how to make an ATS friendly CV",
    "ATS friendly resume builder free",
    "ATS resume format",
    "best ATS friendly resume",
    "ATS friendly CV for freshers",
    "applicant tracking system CV",
    "what is an ATS",
  ],
})

const content: LandingContent = {
  path,
  schema: {
    name: title,
    description,
    softwareApp: {
      name: "EasyMoveZone CV Builder",
      description: "Build an ATS-friendly, single-column CV and tailor it to each job's requirements.",
    },
  },
  hero: {
    eyebrow: "ATS-friendly CV",
    title: "Build an ATS-Friendly CV",
    highlight: "that gets read",
    lede: "Many employers screen CVs with an applicant tracking system before a person sees them. Build a clean, single-column CV that software can parse and recruiters enjoy reading.",
    cta: { appHref: "/workspace", signedInLabel: "Open my CVs", signedOutLabel: "Build my ATS CV free" },
    secondary: { label: "See the CV builder", href: "/cv-builder" },
    trust: ["Free account", "No credit card", "Single-column A4 layout"],
  },
  stats: [
    { value: "1 column", label: "Layout ATS can parse" },
    { value: "Standard", label: "Section headings" },
    { value: "£0", label: "To build and download" },
    { value: "1 click", label: "To tailor to a job" },
  ],
  steps: {
    title: "How to make an ATS-friendly CV",
    subtitle: "Formatting gets you parsed. Matching the job gets you shortlisted.",
    items: [
      { title: "Start from a clean format", body: "Upload your CV and we rebuild it in a single-column layout with standard headings." },
      { title: "Improve the wording", body: "Use AI to sharpen bullets for clarity and ATS readability without changing the facts." },
      { title: "Match each job", body: "Tailor your CV to a role's must-haves so the right terms appear in the right places." },
    ],
  },
  features: {
    eyebrow: "What makes it ATS-friendly",
    title: "The format rules, handled for you",
    subtitle: "Fancy templates look good to people but can confuse parsing software. We keep it simple.",
    items: [
      {
        icon: AlignLeft,
        title: "Single-column layout",
        body: "No tables, text boxes or sidebars that can scramble the order your details are read in.",
      },
      {
        icon: Heading,
        title: "Standard section headings",
        body: "Profile, Experience, Education and Skills — the labels tracking systems expect to find.",
      },
      {
        icon: Sparkles,
        title: "AI rewrites for readability",
        body: "Tighten bullets and lead with results. We instruct the AI to preserve every fact.",
        href: "/cv-builder",
        linkLabel: "Try the CV builder",
      },
      {
        icon: Target,
        title: "Tailored to the job",
        body: "Reorder and reword around a job's must-haves, using only your real experience.",
        href: "/cover-letter-generator",
        linkLabel: "Tailor with a cover letter",
      },
    ],
  },
  audiences: {
    title: "Who needs an ATS-friendly CV",
    subtitle: "If you apply online to larger employers, your CV is probably screened by software first.",
    items: [
      {
        icon: GraduationCap,
        title: "Freshers and graduates",
        body: "Get a clean first CV right from the start, instead of fixing a design-heavy template later.",
        href: "/cv-builder",
        linkLabel: "Build your first CV",
      },
      {
        icon: Briefcase,
        title: "Applicants to large employers",
        body: "Big companies and sponsors often receive thousands of applications and screen them automatically.",
        href: "/jobs-in-uk",
        linkLabel: "Find UK sponsored jobs",
      },
      {
        icon: Repeat,
        title: "Career changers",
        body: "Make sure the transferable skills a new field looks for are easy for software to find.",
        href: "/career-change",
        linkLabel: "Plan a career change",
      },
    ],
  },
  faqs: [
    {
      question: "What is an ATS?",
      answer:
        "An applicant tracking system (ATS) is software employers use to collect, sort and search job applications. It reads your CV into fields such as job titles, dates and skills so recruiters can filter and search candidates.",
    },
    {
      question: "What makes a CV ATS-friendly?",
      answer:
        "A single-column layout, standard section headings, plain fonts, dates in a consistent format and no key information inside images, tables or headers. It also uses the same terms as the job description where they genuinely describe your experience.",
    },
    {
      question: "Should I send my CV as a PDF or Word document?",
      answer:
        "Most modern applicant tracking systems read text-based PDFs well, and PDFs keep your layout intact. If an employer asks for Word, send Word. Never send a scanned image of your CV.",
    },
    {
      question: "Does EasyMoveZone give me an ATS score?",
      answer:
        "No. Every employer's system is configured differently, so a single score can be misleading. Instead we build your CV in an ATS-friendly format and, with the Jobs membership, tailor it to each job's actual must-haves.",
    },
    {
      question: "Is the ATS-friendly CV builder free?",
      answer:
        "Yes. Building, editing, improving with AI and downloading your CV are free with an account. Tailoring a CV to a specific job is part of the paid Jobs membership.",
    },
  ],
  crossLink: {
    eyebrow: "Build it now",
    title: "Use the free CV builder",
    body: "Upload your current CV, improve it with AI and download a clean one-column PDF.",
    href: "/cv-builder",
    label: "Open the CV builder",
  },
  bottomCta: {
    title: "Make sure your CV gets read",
    body: "Build a clean, ATS-friendly CV in minutes and tailor it to every role you care about.",
  },
}

export default function AtsFriendlyCvPage() {
  return <LandingPage content={content} />
}
