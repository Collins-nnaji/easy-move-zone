import type { Metadata } from "next"
import { Download, FolderOpen, Globe2, GraduationCap, Repeat, Sparkles, Upload } from "lucide-react"
import { LandingPage, type LandingContent } from "@/components/seo/LandingPage"
import { buildPageMetadata } from "@/lib/site-metadata"

const path = "/cv-builder"
const title = "Free CV Builder — Make a Job-Ready CV · EasyMoveZone"
const description =
  "Free CV builder: upload your CV or start blank, improve it with AI without inventing facts, and download a clean, professional PDF. Create your free account."

export const metadata: Metadata = buildPageMetadata({
  title,
  absoluteTitle: true,
  description,
  path,
  keywords: [
    "CV builder",
    "free CV builder",
    "CV maker",
    "free CV maker online",
    "resume builder",
    "how to make a CV for a job",
    "how to make a professional CV",
    "CV format for job",
    "professional CV format",
    "CV for UK jobs",
    "how to write a CV",
    "online CV maker",
  ],
})

const content: LandingContent = {
  path,
  schema: {
    name: title,
    description,
    softwareApp: {
      name: "EasyMoveZone CV Builder",
      description: "Free online CV builder with AI improvements that keep your real experience, and PDF download.",
    },
  },
  hero: {
    eyebrow: "Free CV builder",
    title: "Free CV Builder",
    highlight: "for job-ready CVs",
    lede: "Upload the CV you already have or start from scratch. Improve it with AI that keeps to your real experience, then download a clean, professional PDF.",
    cta: { appHref: "/workspace", signedInLabel: "Open my CVs", signedOutLabel: "Build my CV free" },
    secondary: { label: "ATS-friendly CV tips", href: "/ats-friendly-cv" },
    trust: ["Free account", "No credit card", "PDF and Word upload"],
  },
  stats: [
    { value: "£0", label: "To build and download" },
    { value: "A4 PDF", label: "Clean one-column download" },
    { value: "PDF · Word", label: "Upload your current CV" },
    { value: "AI", label: "Rewrites that keep your facts" },
  ],
  steps: {
    title: "Make a CV for a job in three steps",
    subtitle: "No design skills, no fiddly templates. Just a clear CV that reads well to people and software.",
    items: [
      { title: "Upload or start blank", body: "Drop in a PDF or Word CV and we'll read it into editable sections, or start a new one." },
      { title: "Edit and improve with AI", body: "Rewrite sections for clarity and impact. AI keeps every fact from your real experience." },
      { title: "Download and apply", body: "Export a clean PDF and keep separate versions for different roles." },
    ],
  },
  features: {
    eyebrow: "Why this CV maker",
    title: "A CV builder that respects your experience",
    subtitle: "Most CV makers sell you a template. We help you say what you've done, clearly.",
    items: [
      {
        icon: Upload,
        title: "Start from your current CV",
        body: "Upload a PDF or Word file and we'll structure it into sections you can edit.",
      },
      {
        icon: Sparkles,
        title: "AI that doesn't make things up",
        body: "Improve wording, impact and readability. We instruct the AI to keep every fact — you review every change.",
      },
      {
        icon: Download,
        title: "Clean, ATS-friendly layout",
        body: "A single-column design with standard headings that applicant tracking systems can read.",
        href: "/ats-friendly-cv",
        linkLabel: "Why ATS matters",
      },
      {
        icon: FolderOpen,
        title: "One place for every version",
        body: "Keep CVs for different roles alongside your certificates and documents in My Workspace.",
        href: "/workspace",
        linkLabel: "Open My Workspace",
      },
    ],
  },
  audiences: {
    title: "Who builds CVs with EasyMoveZone",
    subtitle: "From a first job to a move across the world.",
    items: [
      {
        icon: GraduationCap,
        title: "Graduates and first-time applicants",
        body: "Turn education, projects and part-time work into a CV that shows what you can do.",
        href: "/work-simulation",
        linkLabel: "Add proof with simulations",
      },
      {
        icon: Globe2,
        title: "Applying for jobs in the UK",
        body: "Switch to a two-page UK-style CV without a photo or personal details employers don't need.",
        href: "/jobs-in-uk",
        linkLabel: "Find UK jobs",
      },
      {
        icon: Repeat,
        title: "Career changers",
        body: "Lead with transferable skills so recruiters in a new field see the fit straight away.",
        href: "/career-change",
        linkLabel: "Plan a career change",
      },
    ],
  },
  faqs: [
    {
      question: "How do I make a CV for a job?",
      answer:
        "Start with your contact details and a short profile, then list your experience in reverse-chronological order with results, followed by education and skills. Keep it to two pages and match your wording to the job description. EasyMoveZone structures this for you when you upload or start a CV.",
    },
    {
      question: "What is the best CV format?",
      answer:
        "For most people, a reverse-chronological CV with a single-column layout works best. It is easy for recruiters to scan and for applicant tracking systems to read. Avoid tables, text boxes and graphics for key information.",
    },
    {
      question: "How long should a CV be?",
      answer:
        "In the UK, two pages is the norm. Graduates can often fit everything on one page, while senior or academic CVs sometimes run longer. Cut anything that doesn't support the job you are applying for.",
    },
    {
      question: "What's the difference between a CV and a resume?",
      answer:
        "In the UK, Ireland and much of Europe, \"CV\" means the standard job application document. In the US and Canada the same document is called a resume and is usually shorter. EasyMoveZone works for both.",
    },
    {
      question: "Is the CV builder really free?",
      answer:
        "Yes. Building, editing, improving with AI and downloading your CV are free with an account. Tailoring a CV to a specific job with a cover letter is part of the paid Jobs membership.",
    },
  ],
  crossLink: {
    eyebrow: "Get past the software",
    title: "Make your CV ATS-friendly",
    body: "Learn what applicant tracking systems look for and how to format a CV that gets read.",
    href: "/ats-friendly-cv",
    label: "Read the ATS guide",
  },
  bottomCta: {
    title: "Build a CV you're proud to send",
    body: "Upload what you have, improve it with AI and download a clean PDF — free.",
  },
}

export default function CvBuilderPage() {
  return <LandingPage content={content} />
}
