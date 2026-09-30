import type { Metadata } from "next"
import { Briefcase, ClipboardCheck, FileSignature, FileText, Globe2, PenLine, Repeat } from "lucide-react"
import { LandingPage, type LandingContent } from "@/components/seo/LandingPage"
import { buildPageMetadata } from "@/lib/site-metadata"

const path = "/cover-letter-generator"
const title = "AI Cover Letter Generator Tailored to the Job · EasyMoveZone"
const description =
  "AI cover letter generator that writes to the job you're applying for, with a matching tailored CV and checklist, from your real experience. Get started today."

export const metadata: Metadata = buildPageMetadata({
  title,
  absoluteTitle: true,
  description,
  path,
  keywords: [
    "AI cover letter generator",
    "cover letter generator",
    "cover letter for job application",
    "how to write a cover letter",
    "best AI for cover letter writing",
    "tailored cover letter",
    "UK CV and cover letter",
    "AI for job applications",
    "how to make a cover letter for a job",
    "cover letter writer",
    "job application AI",
    "CV and cover letter writing",
  ],
})

const content: LandingContent = {
  path,
  schema: {
    name: title,
    description,
    softwareApp: {
      name: "EasyMoveZone Application Pack",
      description: "Generates a job-specific cover letter, tailored CV and application checklist from your saved CV.",
    },
  },
  hero: {
    eyebrow: "AI cover letter generator",
    title: "AI Cover Letter Generator",
    highlight: "tailored to the job",
    lede: "Pick a role, and EasyMoveZone writes a cover letter for that exact job — plus a matching tailored CV and an application checklist — using only your real experience.",
    cta: { appHref: "/jobs", signedInLabel: "Pick a job to apply for", signedOutLabel: "Start free — pick a job" },
    secondary: { label: "Build your CV first", href: "/cv-builder" },
    trust: ["Browse roles free", "Membership unlocks application packs", "Cancel anytime"],
  },
  stats: [
    { value: "3-in-1", label: "Cover letter, CV and checklist" },
    { value: "1 click", label: "From job to application pack" },
    { value: "ATS", label: "Friendly single-column CV" },
    { value: "Saved", label: "To My CVs to edit and reuse" },
  ],
  steps: {
    title: "A tailored cover letter in three steps",
    subtitle: "No blank page and no generic template. Every letter starts from the job and your CV.",
    items: [
      { title: "Save your CV", body: "Upload or build your CV once in My Workspace so it can be matched to any role." },
      { title: "Choose a job", body: "Find a role on the jobs board and check your fit against its must-haves." },
      { title: "Generate your pack", body: "Get a cover letter, tailored CV and checklist written for that job, ready to review and send." },
    ],
  },
  features: {
    eyebrow: "Why it works",
    title: "Cover letters that sound like you, for the job in front of you",
    subtitle: "Recruiters spot generic letters instantly. Yours is built from the job's requirements.",
    items: [
      {
        icon: FileSignature,
        title: "Written for the specific role",
        body: "Each letter responds to the job's must-haves, company and location — not a one-size template.",
      },
      {
        icon: FileText,
        title: "Matching tailored CV",
        body: "Your CV is reordered and reworded around the same requirements, so both documents tell one story.",
        href: "/ats-friendly-cv",
        linkLabel: "About ATS-friendly CVs",
      },
      {
        icon: ClipboardCheck,
        title: "Application checklist",
        body: "A short list of what to double-check or prepare before you hit submit.",
      },
      {
        icon: PenLine,
        title: "Your facts, your edits",
        body: "We instruct the AI to keep to your real chronology and experience. Review and edit everything before sending.",
      },
    ],
  },
  audiences: {
    title: "Who uses the cover letter generator",
    subtitle: "People who want strong, specific applications without spending an hour on each one.",
    items: [
      {
        icon: Briefcase,
        title: "Active job seekers",
        body: "Applying to several roles a week and want each letter to feel written for that job.",
        href: "/ai-job-search",
        linkLabel: "Find roles with AI",
      },
      {
        icon: Globe2,
        title: "International applicants",
        body: "Writing to UK or overseas employers and want the tone and format to feel local.",
        href: "/jobs-abroad",
        linkLabel: "Find jobs abroad",
      },
      {
        icon: Repeat,
        title: "Career changers",
        body: "Need to explain clearly why your experience fits a role in a new field.",
        href: "/career-change",
        linkLabel: "Plan a career change",
      },
    ],
  },
  faqs: [
    {
      question: "How do I write a cover letter for a job application?",
      answer:
        "Open by naming the role and why you want it, spend a paragraph or two showing how your experience meets the job's key requirements with specific examples, and close with a clear, polite call to action. Keep it to one page.",
    },
    {
      question: "How long should a cover letter be?",
      answer:
        "Three to five short paragraphs, or roughly half to one page. Recruiters skim, so lead with your strongest match to the role and cut anything generic.",
    },
    {
      question: "Is it okay to use AI to write a cover letter?",
      answer:
        "Yes, as long as the content is true and you review it. Use AI to get a strong, specific first draft quickly, then check every claim and adjust the tone so it sounds like you.",
    },
    {
      question: "Is the cover letter generator free?",
      answer:
        "Application packs, including the cover letter and tailored CV, are part of the paid Jobs membership. Browsing jobs and building your CV are free, so you can set everything up before you subscribe.",
    },
    {
      question: "Can I edit the cover letter after it's generated?",
      answer:
        "Yes. Your application pack is saved to My CVs, where you can edit, download and reuse it for similar roles.",
    },
  ],
  crossLink: {
    eyebrow: "Before you write",
    title: "Check your fit with AI job search",
    body: "Find out whether a role is worth applying for — and what's missing — before you write a word.",
    href: "/ai-job-search",
    label: "See AI job search",
  },
  bottomCta: {
    title: "Send applications that feel written for the job",
    body: "Pick a role and get a tailored cover letter, CV and checklist in one go.",
  },
}

export default function CoverLetterGeneratorPage() {
  return <LandingPage content={content} />
}
