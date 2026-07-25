"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Briefcase } from "lucide-react";
import { BoxGlyph, HeroFreightArt, NairaGlyph, RouteGlyph, ShieldGlyph } from "./FreightArt";

const PRIMARY = "#e0511f";
const INK = "#1b231e";

// Company-only value props — no driver-side messaging.
const valueProps = [
  { glyph: BoxGlyph, title: "Post funded jobs", body: "Fund a job and it goes live to rated drivers instantly. No listing fees." },
  { glyph: RouteGlyph, title: "Track every run live", body: "Watch GPS from pickup to delivery, with photo and code confirmation at each stop." },
  { glyph: ShieldGlyph, title: "Hire verified drivers", body: "Every driver's licence, hazmat cert, and insurance is checked. Rate them after each job." },
  { glyph: NairaGlyph, title: "Pay 8% on completion", body: "No subscription, no upfront fees. The 8% platform fee only applies when a job completes." },
] as const;

const steps = [
  { step: "01", label: "Post & fund", sub: "Describe the route and goods, set the pay, and fund it in naira." },
  { step: "02", label: "A driver runs it", sub: "A rated driver claims the job. Track pickup and delivery live with GPS and photos." },
  { step: "03", label: "Confirm & pay", sub: "Confirm delivery and the pay is released. You're charged 8% only on completion." },
] as const;

const drivers = [
  { rating: "4.9 ★", vehicle: "Semi · Heavy goods", zone: "Lagos · 210 jobs" },
  { rating: "4.8 ★", vehicle: "Tanker · Hazmat", zone: "Port Harcourt · 96 jobs" },
  { rating: "5.0 ★", vehicle: "Sprinter · Parcel", zone: "Abuja · 340 jobs" },
] as const;

const easeOut = [0.16, 1, 0.3, 1] as const;

export function CompanyLandingClient() {
  const reduceMotion = useReducedMotion();
  const fadeUp = (delay = 0, y = 18) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, delay, ease: easeOut },
        };

  return (
    <div style={{ background: "#efece4", color: INK }} className="overflow-hidden">
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 50% at 12% 0%, rgba(224,81,31,0.16) 0%, transparent 60%), radial-gradient(55% 45% at 100% 10%, rgba(243,170,121,0.22) 0%, transparent 55%)" }}
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-16 pb-14 sm:px-6 lg:px-8 lg:pt-20 lg:pb-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <motion.p {...fadeUp(0, 12)} className="text-sm font-extrabold tracking-tight" style={{ color: PRIMARY }}>
                For companies &amp; fleets
              </motion.p>
              <motion.h1 {...fadeUp(0.06, 22)} className="mt-4 text-[2.75rem] font-extrabold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.1rem]" style={{ textWrap: "balance" } as React.CSSProperties}>
                Post jobs.
                <span className="block" style={{ color: PRIMARY }}>Move goods on time.</span>
              </motion.h1>
              <motion.p {...fadeUp(0.12, 18)} className="mt-5 max-w-lg text-lg leading-relaxed text-[#5f655c]">
                Post funded delivery jobs and hire rated drivers across Nigeria. Pay in naira,
                track every run live, and only pay the 8% fee when a job completes.
              </motion.p>
              <motion.div {...fadeUp(0.18, 18)} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/fleet/jobs?post=1" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90" style={{ background: PRIMARY, boxShadow: "0 12px 30px rgba(224,81,31,.32)" }}>
                  <Briefcase className="h-[1.125rem] w-[1.125rem]" />
                  Post a job
                </Link>
                <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#d8d2c6] bg-white/70 px-7 py-4 text-base font-semibold text-[#4a5047] backdrop-blur transition hover:bg-white">
                  How it works
                  <ArrowRight className="h-4 w-4" />
                </a>
              </motion.div>
              <motion.div {...fadeUp(0.24, 16)} className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-[#ded7cb] pt-6 text-sm">
                {[["Naira", "secure payouts"], ["8%", "only on completion"], ["Live", "GPS tracking"]].map(([stat, label]) => (
                  <div key={stat}>
                    <div className="font-extrabold" style={{ color: PRIMARY }}>{stat}</div>
                    <div className="mt-0.5 text-[#7c827a]">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
            <motion.div {...fadeUp(0.1, 24)} className="relative order-first lg:order-none">
              <HeroFreightArt className="mx-auto w-full max-w-[26rem] sm:max-w-[32rem] lg:max-w-none" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-[#e4dfd5] bg-[#f6f3ec] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeUp()} className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything you need to move goods.
          </motion.h2>
          <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((p, i) => {
              const Glyph = p.glyph;
              return (
                <motion.div key={p.title} {...fadeUp(0.06 * i)}>
                  <Glyph className="h-8 w-8" style={{ color: PRIMARY }} />
                  <h3 className="mt-4 text-lg font-extrabold tracking-tight">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5f655c]">{p.body}</p>
                </motion.div>
              );
            })}
          </div>
          <motion.div {...fadeUp(0.1)} className="mt-14 flex flex-wrap items-end justify-between gap-3 border-t border-[#e4dfd5] pt-10">
            <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">Rated drivers ready now</h3>
            <Link href="/fleet/drivers" className="inline-flex items-center gap-1.5 text-sm font-bold transition hover:gap-2.5" style={{ color: PRIMARY }}>
              Browse drivers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {drivers.map((d, i) => (
              <motion.div key={d.zone} {...fadeUp(0.05 * i)} className="rounded-2xl border border-[#e4dfd5] bg-white px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.05]">
                <div className="text-xl font-extrabold">{d.rating}</div>
                <div className="mt-1 text-sm font-semibold text-[#5f655c]">{d.vehicle}</div>
                <div className="mt-1 text-sm text-[#8a8f86]">{d.zone}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 py-16 lg:py-20" style={{ background: INK }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div {...fadeUp()}>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f3aa79]">How it works</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                From posted job
                <br />
                <span className="text-white/50">to delivered on time.</span>
              </h2>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/fleet/jobs?post=1" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90" style={{ background: PRIMARY, boxShadow: "0 10px 26px rgba(224,81,31,.34)" }}>
                  Post a job
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
            <div className="flex flex-col gap-3">
              {steps.map((s, i) => (
                <motion.div key={s.step} {...fadeUp(0.06 * i)} className="flex items-start gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <span className="font-mono text-sm font-bold text-[#f3aa79]">{s.step}</span>
                  <div>
                    <p className="text-base font-bold text-white">{s.label}</p>
                    <p className="mt-1 text-sm text-white/55">{s.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
