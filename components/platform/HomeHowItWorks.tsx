"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const PRIMARY = "#2f5d50"
const ACCENT = "#e0511f"
const INK = "#1b231e"
const LINE = "#d9d2c5"
const easeOut = [0.16, 1, 0.3, 1] as const

function CareersArt() {
  return (
    <svg viewBox="0 0 160 120" fill="none" className="h-28 w-auto" aria-hidden>
      <rect x="8" y="72" width="60" height="32" rx="10" fill="#fff" stroke={LINE} strokeWidth="2" />
      <rect x="18" y="82" width="28" height="4" rx="2" fill="#c9c3b8" />
      <rect x="18" y="91" width="18" height="4" rx="2" fill="#e2ddd3" />
      <rect x="92" y="16" width="60" height="32" rx="10" fill={PRIMARY} />
      <rect x="102" y="26" width="28" height="4" rx="2" fill="#fff" opacity=".9" />
      <rect x="102" y="35" width="18" height="4" rx="2" fill="#fff" opacity=".5" />
      <path d="M68 86c26 0 12-52 24-54" stroke={PRIMARY} strokeWidth="2.5" strokeDasharray="4 5" strokeLinecap="round" />
      <path d="M85 27l7 5-7 5" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="76" cy="78" r="4" fill={ACCENT} />
      <circle cx="82" cy="60" r="4" fill={ACCENT} opacity=".7" />
      <circle cx="86" cy="44" r="4" fill={ACCENT} opacity=".45" />
      <circle cx="150" cy="16" r="9" fill={ACCENT} />
      <path d="M146 16.2l2.8 2.8 5-5.4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CountriesArt() {
  return (
    <svg viewBox="0 0 160 120" fill="none" className="h-28 w-auto" aria-hidden>
      <circle cx="54" cy="68" r="38" fill="#fff" stroke={LINE} strokeWidth="2" />
      <ellipse cx="54" cy="68" rx="16" ry="38" stroke={LINE} strokeWidth="1.5" />
      <path d="M17 56h74M17 80h74M54 30v76" stroke={LINE} strokeWidth="1.5" />
      <path d="M40 52c20-46 78-44 96-10" stroke={PRIMARY} strokeWidth="2.5" strokeDasharray="4 5" strokeLinecap="round" />
      <circle cx="40" cy="54" r="6" fill={INK} />
      <circle cx="40" cy="54" r="2.2" fill="#fff" />
      <path d="M136 22c-8 0-13 6-13 13 0 9 13 21 13 21s13-12 13-21c0-7-5-13-13-13z" fill={PRIMARY} />
      <circle cx="136" cy="35" r="4.5" fill="#fff" />
      <path d="M90 13l9 3-9 3 2-3z" fill={ACCENT} />
    </svg>
  )
}

function BothArt() {
  return (
    <svg viewBox="0 0 160 120" fill="none" className="h-28 w-auto" aria-hidden>
      <rect x="6" y="12" width="52" height="28" rx="9" fill="#fff" stroke={LINE} strokeWidth="2" />
      <rect x="15" y="21" width="24" height="4" rx="2" fill="#c9c3b8" />
      <rect x="15" y="29" width="15" height="4" rx="2" fill="#e2ddd3" />
      <circle cx="32" cy="92" r="20" fill="#fff" stroke={LINE} strokeWidth="2" />
      <ellipse cx="32" cy="92" rx="8" ry="20" stroke={LINE} strokeWidth="1.5" />
      <path d="M13 86h38M13 98h38" stroke={LINE} strokeWidth="1.5" />
      <path d="M58 26c26 0 22 34 44 34M52 92c30 0 26-32 50-32" stroke={PRIMARY} strokeWidth="2.5" strokeDasharray="4 5" strokeLinecap="round" />
      <path d="M102 60h14" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="136" cy="60" r="20" fill="#dfeae6" />
      <circle cx="136" cy="60" r="12" fill="#fff" stroke={PRIMARY} strokeWidth="2.5" />
      <circle cx="136" cy="60" r="5" fill={ACCENT} />
    </svg>
  )
}

function FitCheckArt() {
  return (
    <svg viewBox="0 0 280 180" fill="none" className="h-auto w-full max-w-[20rem]" aria-hidden>
      <rect x="1" y="1" width="278" height="178" rx="22" fill="#f6f3ec" />
      <path d="M40 118a50 50 0 01100 0" stroke="#e4ded2" strokeWidth="12" strokeLinecap="round" />
      <path d="M40 118a50 50 0 0183.3-37.3" stroke={PRIMARY} strokeWidth="12" strokeLinecap="round" />
      <path d="M90 118l24-30" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" />
      <circle cx="90" cy="118" r="7" fill={INK} />
      <text x="90" y="152" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Good fit</text>
      <text x="90" y="168" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7c827a">4 of 5 must-haves</text>
      {[
        { y: 44, ok: true, w: 70 },
        { y: 72, ok: true, w: 58 },
        { y: 100, ok: false, w: 64 },
      ].map((row) => (
        <g key={row.y}>
          <rect x="164" y={row.y - 11} width="98" height="22" rx="11" fill="#fff" />
          <circle cx="177" cy={row.y} r="6" fill={row.ok ? PRIMARY : "#fbe6da"} />
          {row.ok ? (
            <path d={`M174.2 ${row.y}l2 2 3.6-4`} stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d={`M177 ${row.y - 3}v3.4M177 ${row.y + 2.6}v.2`} stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
          )}
          <rect x="189" y={row.y - 2.5} width={row.w} height="5" rx="2.5" fill={row.ok ? "#c9d8d2" : "#f1cdb9"} />
        </g>
      ))}
      <rect x="164" y="130" width="98" height="26" rx="13" fill={PRIMARY} />
      <text x="213" y="147" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">Worth applying</text>
    </svg>
  )
}

function TailorCvArt() {
  return (
    <svg viewBox="0 0 280 180" fill="none" className="h-auto w-full max-w-[20rem]" aria-hidden>
      <rect x="1" y="1" width="278" height="178" rx="22" fill="#fff5ef" />
      <g opacity=".55">
        <rect x="30" y="30" width="92" height="122" rx="10" fill="#fff" stroke="#ecd9cc" strokeWidth="1.5" />
        <rect x="42" y="44" width="46" height="6" rx="3" fill="#dccfc4" />
        {[62, 74, 86, 98, 110, 122].map((y, i) => (
          <rect key={y} x="42" y={y} width={i % 2 ? 52 : 66} height="4" rx="2" fill="#ece2d9" />
        ))}
      </g>
      <path d="M130 91h18" stroke={ACCENT} strokeWidth="2.5" strokeDasharray="3 4" strokeLinecap="round" />
      <path d="M145 86l6 5-6 5" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="158" y="22" width="96" height="138" rx="12" fill="#fff" stroke={PRIMARY} strokeWidth="2" />
      <rect x="170" y="36" width="50" height="7" rx="3.5" fill={INK} />
      <rect x="170" y="48" width="34" height="4" rx="2" fill="#b9c9c2" />
      {[64, 78, 92].map((y) => (
        <g key={y}>
          <circle cx="173" cy={y + 2} r="2" fill={PRIMARY} />
          <rect x="179" y={y} width="62" height="4" rx="2" fill="#dfeae6" />
          <rect x="179" y={y} width="30" height="4" rx="2" fill={PRIMARY} opacity=".55" />
        </g>
      ))}
      <rect x="170" y="108" width="72" height="16" rx="8" fill="#fbe6da" />
      <text x="206" y="119" textAnchor="middle" fontSize="8" fontWeight="800" fill="#7a3b24">+ Cover letter</text>
      <rect x="170" y="130" width="72" height="16" rx="8" fill="#e8f1ed" />
      <text x="206" y="141" textAnchor="middle" fontSize="8" fontWeight="800" fill="#285045">+ Checklist</text>
      <path d="M232 36l14-14a4 4 0 015.7 5.7l-14 14-7.4 1.7z" fill={ACCENT} />
    </svg>
  )
}

function SimulationIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      <path d="M16 4h8M20 4v4" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="22" r="13" stroke={PRIMARY} strokeWidth="2" />
      <path d="M20 22V14" stroke={ACCENT} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M20 22l5 3" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TiersIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      <circle cx="9" cy="24" r="6.5" fill="#e7c9a9" stroke="#a86b3c" strokeWidth="1.6" />
      <circle cx="31" cy="24" r="6.5" fill="#e3e6e8" stroke="#8a9299" strokeWidth="1.6" />
      <circle cx="20" cy="17" r="8.5" fill="#f6dd8a" stroke="#b8860b" strokeWidth="1.8" />
      <path d="M17 17l2 2 4-4.5" stroke="#8a6408" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProfileBadgeIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      <path d="M14 24l-3 12 9-4 9 4-3-12" stroke={PRIMARY} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="20" cy="16" r="11" stroke={PRIMARY} strokeWidth="2" />
      <circle cx="20" cy="16" r="5" fill={ACCENT} />
    </svg>
  )
}

const directions = [
  { art: CareersArt, title: "Move careers", body: "See how your skills map to new roles, where the gaps are, and which learning pays off most.", href: "/career-change", linkLabel: "Plan a career change" },
  { art: CountriesArt, title: "Move countries", body: "Check how strong your visa route is, whether you need sponsorship, and what to do next.", href: "/jobs-abroad", linkLabel: "Find jobs abroad" },
  { art: BothArt, title: "Move both", body: "Plan a new role and a new country together, so each one supports the other.", href: "/jobs-in-uk", linkLabel: "Start with UK jobs" },
] as const

const features = [
  {
    art: FitCheckArt,
    title: "Fit Check",
    body: "Know before you apply. See how well you fit the role, which must-haves you're missing, and whether the employer can sponsor you — the same answer every time you check.",
    points: ["Clear fit level", "Missing must-haves", "Sponsorship signal", "Apply or skip advice"],
    href: "/ai-job-search",
    linkLabel: "How AI job search works",
  },
  {
    art: TailorCvArt,
    title: "Tailor CV",
    body: "Turn your saved CV into one written for this role. We reorder and reword around the job's must-haves, using only your real experience.",
    points: ["ATS-friendly CV", "Cover letter", "Application checklist", "Saved to My CVs"],
    href: "/cover-letter-generator",
    linkLabel: "See the cover letter generator",
  },
] as const

const pillars = [
  { icon: SimulationIcon, title: "Timed simulations", body: "Real tasks for the role you want to move into." },
  { icon: TiersIcon, title: "Bronze, silver, gold", body: "Score 60%, 75% or 88% to earn each badge." },
  { icon: ProfileBadgeIcon, title: "Kept on your profile", body: "A weaker retake never takes a badge away." },
] as const

function useFadeUp() {
  const reduceMotion = useReducedMotion()
  return (delay = 0, y = 16) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, delay, ease: easeOut },
        }
}

export function HomeJobFeatures() {
  const fadeUp = useFadeUp()
  return (
    <section className="border-t border-[#e4dfd5] bg-white pb-14 pt-8 sm:pb-20 sm:pt-10" style={{ color: INK }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp()} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: ACCENT }}>On every job</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Check your fit, then tailor your CV in one click.</h2>
        </motion.div>
        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-[#ece7dd]">
          {features.map((feature, index) => (
            <motion.div key={feature.title} {...fadeUp(index * 0.08)} className="flex flex-col items-center text-center lg:px-10">
              <feature.art />
              <h3 className="mt-6 text-xl font-extrabold">{feature.title}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#646a63]">{feature.body}</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] font-bold text-[#3f463f]">
                {feature.points.map((point) => (
                  <li key={point} className="inline-flex items-center gap-1.5">
                    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
                      <circle cx="8" cy="8" r="8" fill={index === 0 ? "#dfeae6" : "#fbe6da"} />
                      <path d="M4.8 8.2l2.1 2.1 4.2-4.6" fill="none" stroke={index === 0 ? PRIMARY : ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
              <Link href={feature.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline" style={{ color: PRIMARY }}>
                {feature.linkLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeHowItWorks() {
  const fadeUp = useFadeUp()
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24" style={{ color: INK }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(27,35,30,0.08) 1px, transparent 0)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp()} className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: ACCENT }}>How EasyMoveZone works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">One plan, shaped around the move you&apos;re making.</h2>
          <p className="mt-3 text-[#60665f]">Pick your direction once. Your score, gaps and next steps follow from it.</p>
        </motion.div>

        <div className="mt-12 grid gap-10 sm:mt-14 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#ece7dd]">
          {directions.map((item, index) => (
            <motion.div key={item.title} {...fadeUp(index * 0.06)} className="flex flex-col items-center text-center md:px-8">
              <item.art />
              <h3 className="mt-5 text-xl font-extrabold">{item.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#646a63]">{item.body}</p>
              <Link href={item.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline" style={{ color: PRIMARY }}>
                {item.linkLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp(0.05)} className="mt-16 grid gap-8 border-t border-[#ece7dd] pt-12 sm:mt-20 lg:grid-cols-[1fr_1.6fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: PRIMARY }}>Work simulations</p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Prove you can do the role. Earn a badge for it.</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#646a63]">Take a timed simulation for the job you&apos;re aiming for. Pass it and you earn a badge that shows your skills, not just your CV.</p>
            <Link href="/work-simulation" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline" style={{ color: ACCENT }}>
              Try a work simulation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#ece7dd]">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="flex gap-3 sm:flex-col sm:px-6 sm:first:pl-0 lg:first:pl-6">
                <pillar.icon />
                <div>
                  <p className="text-sm font-extrabold">{pillar.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#686e67]">{pillar.body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.05)} className="mt-10 flex flex-col items-start gap-6 border-t border-[#ece7dd] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/workspace" className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-6 py-3.5 text-sm font-extrabold text-white transition hover:brightness-110" style={{ background: PRIMARY, boxShadow: "0 12px 28px rgba(47,93,80,.24)" }}>
            Open My Workspace <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex flex-col gap-2 sm:items-end sm:text-right">
            <p className="text-sm text-[#5f655c]">
              <span className="font-extrabold text-[#1b231e]">Complex case?</span> Family, refusals or several countries.{" "}
              <Link href="/specialist-support" className="whitespace-nowrap font-bold underline-offset-4 hover:underline" style={{ color: ACCENT }}>Talk to a specialist →</Link>
            </p>
            <p className="flex gap-4 text-sm font-bold text-[#4a5047]">
              <Link href="/jobs" className="underline-offset-4 hover:underline">Browse sponsorship jobs</Link>
              <Link href="/contact" className="underline-offset-4 hover:underline">Contact</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
