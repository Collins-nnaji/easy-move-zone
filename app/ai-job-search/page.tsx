import type { Metadata } from "next"
import { Clock, FileSignature, Globe2, ListChecks, Repeat, ShieldCheck, Target } from "lucide-react"
import { LandingPage, type LandingContent } from "@/components/seo/LandingPage"
import { buildPageMetadata } from "@/lib/site-metadata"

const path = "/ai-job-search"
const title = "AI Job Search That Checks Your Fit First · EasyMoveZone"
const description =
  "AI job search that tells you if a role fits before you apply: your fit level, missing must-haves and a sponsorship signal. Then tailor your CV. Try it free."

export const metadata: Metadata = buildPageMetadata({
  title,
  absoluteTitle: true,
  description,
  path,
  keywords: [
    "AI job search",
    "AI job finder",
    "AI for job search",
    "AI for jobs",
    "best AI job search tool",
    "job search AI tools",
    "how to find a job using AI",
    "AI for job applications",
    "using AI for job search",
    "job search with AI",
    "AI job matching",
    "AI resume analyzer",
  ],
})

const content: LandingContent = {
  path,
  schema: {
    name: title,
    description,
    softwareApp: {
      name: "EasyMoveZone Fit Check",
      description: "AI job matching that compares your CV with a job's must-haves and tells you whether to apply.",
    },
  },
  hero: {
    eyebrow: "AI job search",
    title: "AI Job Search",
    highlight: "that checks your fit first",
    lede: "Stop sending applications into the void. EasyMoveZone reads the job's must-haves, compares them with your CV and tells you plainly whether it's worth applying.",
    cta: { appHref: "/jobs", signedInLabel: "Open the jobs board", signedOutLabel: "Start free — find jobs" },
    secondary: { label: "Build your CV first", href: "/cv-builder" },
    trust: ["Free account", "No credit card", "No auto-applying on your behalf"],
  },
  stats: [
    { value: "4", label: "Answers on every Fit Check" },
    { value: "Same", label: "Result every time you check" },
    { value: "£0", label: "To browse every role" },
    { value: "1 click", label: "From fit to tailored CV" },
  ],
  steps: {
    title: "Let AI do the reading, you make the call",
    subtitle: "You stay in control of every application. AI just removes the guesswork.",
    items: [
      { title: "Add your CV", body: "Upload a PDF or Word CV once. We structure it so it can be matched against any role." },
      { title: "Run Fit Check on a job", body: "Get your fit level, the must-haves you're missing, a sponsorship signal and apply-or-skip advice." },
      { title: "Tailor and apply", body: "Turn your CV into one written for that role, with a matching cover letter, in one click." },
    ],
  },
  features: {
    eyebrow: "What the AI does",
    title: "Smarter than keyword matching",
    subtitle: "Fit Check looks at what the employer actually requires, not just which words appear in the ad.",
    items: [
      {
        icon: ListChecks,
        title: "Must-haves, not keywords",
        body: "Each job's real requirements are worked out and stored, so you see exactly which ones you meet.",
      },
      {
        icon: Repeat,
        title: "Consistent answers",
        body: "The same job and CV give the same result every time — no re-rolling until it says yes.",
      },
      {
        icon: ShieldCheck,
        title: "Sponsorship signal",
        body: "See whether the employer is likely to sponsor a visa, alongside your fit for the role.",
        href: "/jobs-in-uk",
        linkLabel: "UK sponsored jobs",
      },
      {
        icon: FileSignature,
        title: "Tailored application pack",
        body: "Generate a role-specific CV, cover letter and checklist from your real experience.",
        href: "/cover-letter-generator",
        linkLabel: "See the cover letter tool",
      },
    ],
  },
  audiences: {
    title: "Who uses AI job search on EasyMoveZone",
    subtitle: "Anyone who would rather send ten strong applications than a hundred weak ones.",
    items: [
      {
        icon: Clock,
        title: "Busy professionals",
        body: "Job hunting around a full-time job and want to spend limited evenings on the right roles.",
        href: "/jobs",
        linkLabel: "Browse jobs",
      },
      {
        icon: Globe2,
        title: "People moving country",
        body: "Candidates who need a sponsor and can't afford to apply to employers that won't sponsor.",
        href: "/jobs-abroad",
        linkLabel: "Find jobs abroad",
      },
      {
        icon: Target,
        title: "Career changers",
        body: "People testing whether their skills transfer to a new field before they commit.",
        href: "/career-change",
        linkLabel: "Plan a career change",
      },
    ],
  },
  faqs: [
    {
      question: "How can I use AI to find a job?",
      answer:
        "Use AI to do the slow reading: compare your CV with each job's requirements, spot the skills you're missing and tailor your CV for the roles you choose. EasyMoveZone does this with Fit Check and application packs, while you decide where to apply.",
    },
    {
      question: "What is the best AI tool for job searching?",
      answer:
        "It depends on your goal. If you want volume, auto-apply tools send lots of applications. If you want fewer, stronger applications — especially when you need visa sponsorship — a tool that checks your fit and the employer first, like EasyMoveZone, saves more time.",
    },
    {
      question: "Does EasyMoveZone apply to jobs for me?",
      answer:
        "No. We don't auto-apply. Mass applications tend to get filtered out, and you should always review what is sent in your name. We help you pick the right roles and prepare a tailored application quickly.",
    },
    {
      question: "Is AI job matching accurate?",
      answer:
        "Fit Check is a strong guide, not a guarantee. It compares your CV with the job's must-haves and explains its reasoning, so you can see why it reached a result. Always read the full job description before applying.",
    },
    {
      question: "Is the AI job search free?",
      answer:
        "Browsing jobs and building your CV are free with an account. Fit Check and tailored application packs are part of the paid Jobs membership, which you can cancel at any time.",
    },
  ],
  crossLink: {
    eyebrow: "Next step after Fit Check",
    title: "Generate a cover letter tailored to the job",
    body: "Turn a good fit into a strong application with a role-specific CV, cover letter and checklist.",
    href: "/cover-letter-generator",
    label: "See the cover letter generator",
  },
  bottomCta: {
    title: "Spend your time on jobs you can get",
    body: "Check your fit, see what's missing and tailor your CV before you apply.",
  },
}

export default function AiJobSearchPage() {
  return <LandingPage content={content} />
}
