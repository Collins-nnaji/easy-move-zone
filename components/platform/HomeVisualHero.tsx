"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface HomeVisualHeroProps {
  heroVisuals: string[]
  citiesCount: number
  listingsCount: number
}

export function HomeVisualHero({ heroVisuals, citiesCount, listingsCount }: HomeVisualHeroProps) {
  const [scrollY, setScrollY] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateReduceMotion = () => setReduceMotion(mediaQuery.matches)
    updateReduceMotion()

    const onChange = () => updateReduceMotion()
    mediaQuery.addEventListener("change", onChange)

    let ticking = false
    const onScroll = () => {
      if (ticking || mediaQuery.matches) return
      ticking = true
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY)
        ticking = false
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      mediaQuery.removeEventListener("change", onChange)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  const depth = reduceMotion ? 0 : Math.min(scrollY, 900)
  const layerAOffset = depth * 0.11
  const gradientOffset = depth * 0.04
  const contentOffset = depth * -0.035
  const heroImage = heroVisuals[0] ?? heroVisuals[1] ?? ""

  return (
    <section className="emz-hero-section">
      <div className="emz-home-full-hero relative overflow-hidden rounded-3xl border border-[#dbe4f0] shadow-[0_35px_80px_-42px_rgba(15,23,42,0.58)]">
        <div className="emz-home-hero-layer-parallax" style={{ transform: `translate3d(0, ${layerAOffset}px, 0)` }}>
          <div className="emz-home-hero-bg-layer emz-home-hero-bg-layer-a" style={{ backgroundImage: `url(${heroImage})` }} />
        </div>
        <div className="emz-home-hero-gradient-wave" style={{ transform: `translate3d(0, ${gradientOffset}px, 0)` }} />
        <div className="emz-home-hero-vignette" />

        <div className="relative z-10 flex min-h-[clamp(680px,calc(100svh-4.5rem),940px)] items-end p-6 text-white md:p-10 lg:p-14">
          <div className="space-y-6 pb-3" style={{ transform: `translate3d(0, ${contentOffset}px, 0)` }}>
            <span className="emz-hero-reveal inline-flex rounded-full border border-white/30 bg-white/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              Property ownership platform
            </span>
            <h1 className="emz-hero-reveal emz-hero-reveal-delay-1 max-w-4xl font-[var(--font-playfair)] text-6xl font-black leading-[0.9] text-white md:text-8xl">
              Buy smarter.
              <br />
              Sell and upgrade faster.
            </h1>
            <p className="emz-hero-reveal emz-hero-reveal-delay-2 max-w-2xl text-base leading-7 text-sky-50/95 md:text-xl">
              Verified listings, installment-friendly pathways, and city intelligence in one clear buy/sell flow.
            </p>
            <div className="emz-hero-reveal emz-hero-reveal-delay-3 flex flex-wrap gap-3">
              <Link href="/services" className="emz-pill-cta rounded-full px-6 py-3 text-sm font-semibold">
                Browse listings
              </Link>
              <Link
                href="/markets#intel-tool"
                className="rounded-full border border-white/40 bg-white/12 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm"
              >
                Explore city intel
              </Link>
            </div>
            <div className="emz-hero-reveal emz-hero-reveal-delay-3 inline-flex flex-wrap gap-2 rounded-2xl border border-white/25 bg-black/20 p-3 text-xs font-semibold text-slate-100 backdrop-blur-sm">
              <span className="rounded-full bg-white/15 px-3 py-1.5">{citiesCount}+ cities</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">{listingsCount}+ verified listings</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">Installment options</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">Trade-up support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
