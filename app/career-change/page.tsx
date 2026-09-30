import type { Metadata } from "next"
import { Compass, Fingerprint, Globe2, GraduationCap, LineChart, Medal, Route } from "lucide-react"
import { LandingPage, type LandingContent } from "@/components/seo/LandingPage"
import { buildPageMetadata } from "@/lib/site-metadata"

const path = "/career-change"
const title = "Career Change Planner — Find Your Next Role · EasyMoveZone"
const description =
  "Plan a career change with confidence. See which roles your skills transfer to, how feasible each switch is and what to learn next from live jobs. Start free."

export const metadata: Metadata = buildPageMetadata({
  title,
  absoluteTitle: true,
  description,
  path,
  keywords: [
    "career change",
    "career change planner",
    "switch career",
    "career change advice",
    "career guidance",
    "career counselling",
    "how to change careers",
    "transferable skills",
    "best careers to switch to",
    "career advice",
    "career change abroad",
    "career path planning",
  ],
})

const content: LandingContent = {
  path,
  schema: {
    name: title,
    description,
    softwareApp: {
      name: "EasyMoveZone Career Simulator",
      description: "Career change planner that maps your skills to new roles, scores feasibility and suggests what to learn next.",
    },
  },
  hero: {
    eyebrow: "Career change planner",
    title: "Plan Your Career Change",
    highlight: "with real data",
    lede: "See which roles your experience transfers to, how realistic each switch is, and which skills would move you forward fastest — based on live job demand, not guesswork.",
    cta: { appHref: "/workspace", signedInLabel: "Open My Workspace", signedOutLabel: "Start my plan free" },
    secondary: { label: "Try a work simulation", href: "/work-simulation" },
    trust: ["Free account", "No credit card", "Plan careers and countries together"],
  },
  stats: [
    { value: "£0", label: "To plan your switch" },
    { value: "Live", label: "Job data behind skill advice" },
    { value: "3", label: "Badge levels to prove skills" },
    { value: "1 plan", label: "For a new role and country" },
  ],
  steps: {
    title: "How to change careers without starting from zero",
    subtitle: "Most career changers already have more of what's needed than they think.",
    items: [
      { title: "Map your real skills", body: "Upload your CV and see the skills behind your job title — including the transferable ones." },
      { title: "Test target careers", body: "Check how feasible each switch is and which gaps stand between you and the role." },
      { title: "Close the gaps", body: "Learn what pays off most, prove it in a work simulation and apply with a CV that leads with fit." },
    ],
  },
  features: {
    eyebrow: "What's in My Workspace",
    title: "Career guidance built on evidence",
    subtitle: "Honest answers about where you can go next, and what it would take to get there.",
    items: [
      {
        icon: Fingerprint,
        title: "Digital Twin",
        body: "Turns your CV into the skills behind your title, so you can see what you really bring.",
        href: "/workspace",
        linkLabel: "Open My Workspace",
      },
      {
        icon: Route,
        title: "Career Simulator",
        body: "Scores how feasible a move into each target career is and highlights the gaps.",
      },
      {
        icon: LineChart,
        title: "Skill ROI",
        body: "Shows which skill to learn next, based on how often it appears in relevant live roles.",
      },
      {
        icon: Medal,
        title: "Work simulations",
        body: "Earn bronze, silver or gold badges in timed tasks for the role you're moving into.",
        href: "/work-simulation",
        linkLabel: "Try a simulation",
      },
    ],
  },
  audiences: {
    title: "Who plans a career change with EasyMoveZone",
    subtitle: "Whatever made you ready for something new, start with a clear view of your options.",
    items: [
      {
        icon: Compass,
        title: "Mid-career switchers",
        body: "Experienced people ready for a new field who want to reuse, not waste, what they've built.",
        href: "/cv-builder",
        linkLabel: "Rewrite your CV",
      },
      {
        icon: GraduationCap,
        title: "Graduates choosing a path",
        body: "Compare careers your degree and skills can lead to, then see what employers ask for.",
        href: "/education",
        linkLabel: "Explore education routes",
      },
      {
        icon: Globe2,
        title: "Changing career and country",
        body: "Line up a new role with a visa route, so each move supports the other.",
        href: "/jobs-abroad",
        linkLabel: "Find jobs abroad",
      },
    ],
  },
  faqs: [
    {
      question: "How do I change careers?",
      answer:
        "Start by listing the skills you already have, not just your job titles. Pick two or three target roles, compare their requirements with your skills, close the most important gaps with focused learning or projects, and rewrite your CV around transferable experience.",
    },
    {
      question: "What are transferable skills?",
      answer:
        "Transferable skills are abilities that are useful across jobs and industries — for example stakeholder management, data analysis, project delivery, customer service or writing. They are usually the bridge that makes a career change realistic.",
    },
    {
      question: "Is it too late to change careers at 30, 40 or 50?",
      answer:
        "No. Many people change careers later in life, and experienced switchers often bring skills that newer candidates lack. The key is choosing a target role where your existing experience counts, then filling the specific gaps.",
    },
    {
      question: "How is this different from career counselling?",
      answer:
        "A career counsellor offers personal guidance and support. EasyMoveZone gives you data-driven analysis of your skills and live job demand, any time you need it. If you want a person to review your situation, you can ask our specialists.",
    },
    {
      question: "Is the career change planner free?",
      answer:
        "Yes. My Workspace, including the Digital Twin, Career Simulator, Skill ROI and work simulations, is free with an account. Fit Check and tailored application packs for specific jobs are part of the paid Jobs membership.",
    },
  ],
  crossLink: {
    eyebrow: "Move careers and countries",
    title: "Find jobs abroad with visa sponsorship",
    body: "Pair your new career with a country that is hiring for it, and see which routes fit you.",
    href: "/jobs-abroad",
    label: "Explore jobs abroad",
  },
  bottomCta: {
    title: "Find out where your skills can take you",
    body: "Map your skills, test target careers and get a clear plan for your next move.",
  },
}

export default function CareerChangePage() {
  return <LandingPage content={content} />
}
