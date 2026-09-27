"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Headphones } from "lucide-react"
import { HomeHowItWorks } from "@/components/platform/HomeHowItWorks"
import { HomeJobsPreview, PREVIEW_COUNT } from "@/components/platform/HomeJobsPreview"

const PRIMARY = "#2f5d50"
const INK = "#1b231e"
const easeOut = [0.16, 1, 0.3, 1] as const

/** Checklist + verified seal — used for Check sponsorship. */
function VerifiedChecklistIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="10" y="6" width="36" height="48" rx="6" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 18h12M18 28h16M18 38h10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <circle cx="22" cy="18" r="3.2" fill="#efece4" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="22" cy="28" r="3.2" fill="#efece4" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="22" cy="38" r="3.2" fill="#efece4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M20.2 18.1l1.3 1.4 2.6-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.2 28.1l1.3 1.4 2.6-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="46" cy="46" r="14" fill={PRIMARY} />
      <circle cx="46" cy="46" r="14" stroke="#1b231e" strokeWidth="1.5" opacity="0.12" />
      <path
        d="M39.5 46.2l4.1 4.2 8.4-9.2"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Large hero visual: sponsorship checklist with verified seal. */
function HeroVerifiedVisual() {
  return (
    <svg viewBox="0 0 420 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full max-w-md" aria-hidden>
      <defs>
        <linearGradient id="heroSheet" x1="80" y1="40" x2="340" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#f7f4ee" />
        </linearGradient>
        <filter id="heroSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#1b231e" floodOpacity="0.12" />
        </filter>
      </defs>

      <ellipse cx="210" cy="400" rx="150" ry="28" fill="#1b231e" opacity="0.06" />

      <g filter="url(#heroSoft)">
        <rect x="78" y="56" width="264" height="340" rx="28" fill="url(#heroSheet)" stroke="#e4dfd5" strokeWidth="2" />
        <rect x="150" y="40" width="120" height="36" rx="12" fill="#1b231e" />
        <rect x="178" y="50" width="64" height="16" rx="8" fill="#2f5d50" />

        {[
          { y: 120, label: "Licensed employer", done: true },
          { y: 178, label: "Visa route match", done: true },
          { y: 236, label: "Role fit checked", done: true },
          { y: 294, label: "Ready to apply", done: false },
        ].map((row) => (
          <g key={row.label}>
            <rect x="112" y={row.y} width="196" height="44" rx="14" fill="#efece4" />
            <circle
              cx="136"
              cy={row.y + 22}
              r="12"
              fill={row.done ? PRIMARY : "#fff"}
              stroke={row.done ? PRIMARY : "#c9c3b8"}
              strokeWidth="2"
            />
            {row.done ? (
              <path
                d={`M130 ${row.y + 22}l4.2 4.4 8-9`}
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            <text
              x="160"
              y={row.y + 27}
              fill="#1b231e"
              fontSize="15"
              fontWeight="700"
              fontFamily="system-ui,sans-serif"
            >
              {row.label}
            </text>
          </g>
        ))}
      </g>

      <g transform="translate(286 318)">
        <circle cx="48" cy="48" r="46" fill={PRIMARY} />
        <circle cx="48" cy="48" r="38" stroke="#fff" strokeWidth="2.5" opacity="0.35" />
        <path
          d="M28 50l12 12 28-30"
          stroke="#fff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export function HomePageClient() {
  const reduceMotion = useReducedMotion()
  const fadeUp = (delay = 0, y = 18) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, delay, ease: easeOut },
        }

  const float = reduceMotion
    ? {}
    : {
        animate: { y: [0, -10, 0] },
        transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" as const },
      }

  const sealPulse = reduceMotion
    ? {}
    : {
        animate: { scale: [1, 1.04, 1] },
        transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const },
      }

  return (
    <div style={{ background: "#efece4", color: INK }} className="overflow-hidden">
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 8% -10%, rgba(47,93,80,0.18) 0%, transparent 55%), radial-gradient(50% 40% at 92% 20%, rgba(27,35,30,0.08) 0%, transparent 50%), linear-gradient(180deg, #f3f2ec 0%, #efece4 55%, #e8e3d8 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(27,35,30,0.07) 1px, transparent 0)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to top, black, transparent)",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-4 pt-8 pb-10 sm:gap-8 sm:px-6 sm:pt-12 sm:pb-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)] lg:gap-8 lg:px-8 lg:pt-14 lg:pb-14">
          <div className="min-w-0 max-w-none lg:pr-2">
            <motion.p
              {...fadeUp(0, 12)}
              className="text-sm font-extrabold tracking-tight sm:text-base lg:text-lg"
              style={{ color: PRIMARY }}
            >
              EasyMoveZone
            </motion.p>
            <motion.h1
              {...fadeUp(0.06, 18)}
              className="mt-2 max-w-[14ch] text-[2.5rem] font-extrabold leading-[1.02] tracking-tight sm:mt-3 sm:max-w-none sm:text-5xl md:text-6xl lg:text-[3.75rem] xl:text-[4.25rem]"
            >
              Move careers.
              <span className="block" style={{ color: PRIMARY }}>
                Move countries.
              </span>
            </motion.h1>
            <motion.p
              {...fadeUp(0.1, 14)}
              className="mt-3 max-w-2xl text-[15px] leading-snug text-[#5f655c] sm:mt-4 sm:text-lg sm:leading-relaxed"
            >
              Score your path to any destination, match licensed sponsors, and prove the role — or ask a specialist when
              your case needs hands-on help.
            </motion.p>

            <motion.div
              {...fadeUp(0.14, 12)}
              className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-stretch"
            >
              <Link
                href="/workspace"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-bold text-white transition hover:brightness-105 sm:min-h-12 sm:min-w-[11rem] sm:flex-none sm:px-6 sm:text-base"
                style={{ background: PRIMARY, boxShadow: "0 12px 28px rgba(47,93,80,.24)" }}
              >
                Open My Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sponsors"
                className="group inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white/85 px-5 text-[15px] font-bold text-[#1b231e] backdrop-blur-sm transition hover:border-[#e0511f]/45 hover:bg-white sm:min-h-12 sm:min-w-[11rem] sm:flex-none sm:px-6 sm:text-base"
              >
                <VerifiedChecklistIcon className="h-6 w-6 text-[#1b231e] transition group-hover:text-[#e0511f]" />
                Check sponsorship
              </Link>
              <Link
                href="/specialist-support"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#1b231e]/15 bg-[#1b231e] px-5 text-[15px] font-bold text-white transition hover:bg-[#2a332c] sm:min-h-12 sm:min-w-[11rem] sm:flex-none sm:px-6 sm:text-base"
              >
                <Headphones className="h-4 w-4" />
                Specialist help
              </Link>
            </motion.div>
          </div>

          <motion.div
            {...fadeUp(0.08, 22)}
            className="relative mx-auto flex w-full max-w-[340px] items-center justify-center sm:max-w-[380px] lg:mx-0 lg:max-w-none lg:justify-end"
          >
            <motion.div {...float} className="relative w-full max-w-[380px]">
              <HeroVerifiedVisual />
              <motion.div
                {...sealPulse}
                className="pointer-events-none absolute bottom-5 right-2 rounded-full bg-[#1b231e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg sm:bottom-7 sm:right-3 sm:px-3 sm:py-1.5 sm:text-[11px]"
              >
                Verified route
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[#ded8cc] bg-[#1b231e] py-5 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[['3', 'planning modes'], [String(PREVIEW_COUNT), 'jobs on this page'], ['1', 'joined-up report'], ['24/7', 'self-serve planning']].map(([value, label]) => (
            <div key={label} className="text-center sm:text-left"><p className="text-2xl font-extrabold text-[#9bc2b5]">{value}</p><p className="text-xs font-semibold text-white/65">{label}</p></div>
          ))}
        </div>
      </section>

      <HomeJobsPreview />

      <HomeHowItWorks />
    </div>
  )
}
