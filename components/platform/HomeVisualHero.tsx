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
  const layerAOffset = depth * 0.08
  const layerBOffset = depth * 0.14
  const gradientOffset = depth * 0.04
  const mosaicOffset = depth * -0.06
  const statsOffset = depth * -0.03

  return (
    <section className="emz-hero-section">
      <div className="emz-home-full-hero relative overflow-hidden rounded-3xl border border-[#dbe4f0] shadow-[0_35px_80px_-42px_rgba(15,23,42,0.58)]">
        <div className="emz-home-hero-layer-parallax" style={{ transform: `translate3d(0, ${layerAOffset}px, 0)` }}>
          <div className="emz-home-hero-bg-layer emz-home-hero-bg-layer-a" style={{ backgroundImage: `url(${heroVisuals[0]})` }} />
        </div>
        <div className="emz-home-hero-layer-parallax" style={{ transform: `translate3d(0, ${layerBOffset}px, 0)` }}>
          <div className="emz-home-hero-bg-layer emz-home-hero-bg-layer-b" style={{ backgroundImage: `url(${heroVisuals[1]})` }} />
        </div>
        <div className="emz-home-hero-gradient-wave" style={{ transform: `translate3d(0, ${gradientOffset}px, 0)` }} />
        <div className="emz-home-hero-vignette" />

        <div className="relative z-10 grid min-h-[clamp(620px,calc(100svh-5rem),900px)] gap-6 p-5 text-white md:p-8 lg:grid-cols-[1fr_0.92fr] lg:gap-8 lg:p-10">
          <div className="mt-auto space-y-5 pb-2">
            <span className="emz-hero-reveal inline-flex rounded-full border border-white/30 bg-white/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              Property ownership platform
            </span>
            <h1 className="emz-hero-reveal emz-hero-reveal-delay-1 font-[var(--font-playfair)] text-5xl font-black leading-[0.92] text-white md:text-7xl">
              Buy smarter.
              <br />
              Sell and upgrade faster.
            </h1>
            <p className="emz-hero-reveal emz-hero-reveal-delay-2 max-w-xl text-base leading-7 text-sky-50/95 md:text-lg">
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
            <div className="emz-hero-reveal emz-hero-reveal-delay-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-100">
              <span className="rounded-full bg-white/15 px-3 py-1.5">Verified supply</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">Installment options</span>
              <span className="rounded-full bg-white/15 px-3 py-1.5">Trade-up support</span>
            </div>
          </div>

          <div className="mb-2 mt-auto grid grid-cols-2 gap-3" style={{ transform: `translate3d(0, ${mosaicOffset}px, 0)` }}>
            {heroVisuals.slice(2, 6).map((photo, index) => (
              <div key={photo} className={index % 2 === 0 ? "emz-photo-drift-a" : "emz-photo-drift-b"}>
                <div
                  className={`emz-photo-card ${index === 1 || index === 3 ? "mt-5" : ""}`}
                  style={{ backgroundImage: `url(${photo})` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-5 left-5 z-20 hidden md:block" style={{ transform: `translate3d(0, ${statsOffset}px, 0)` }}>
          <div className="rounded-2xl border border-white/30 bg-white/12 p-3 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-sky-100">Live platform snapshot</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-white">
              <div className="emz-hero-breathe rounded-xl bg-black/25 p-2">
                <p className="text-lg font-bold">{citiesCount}+</p>
                <p className="text-[10px] text-sky-100">Cities</p>
              </div>
              <div className="emz-hero-breathe rounded-xl bg-black/25 p-2" style={{ animationDelay: "140ms" }}>
                <p className="text-lg font-bold">{listingsCount}+</p>
                <p className="text-[10px] text-sky-100">Listings</p>
              </div>
              <div className="emz-hero-breathe rounded-xl bg-black/25 p-2" style={{ animationDelay: "260ms" }}>
                <p className="text-lg font-bold">&lt;24h</p>
                <p className="text-[10px] text-sky-100">Response</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
