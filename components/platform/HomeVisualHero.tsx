"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface HeroCard {
  image: string
  city: string
  title: string
  price: string
  badge: "Buy" | "Installment" | "Commercial"
}

interface HomeVisualHeroProps {
  heroVisuals: string[]
  heroCards: HeroCard[]
  citiesCount: number
  servicesCount: number
}

export function HomeVisualHero({ heroVisuals, heroCards, citiesCount, servicesCount }: HomeVisualHeroProps) {
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
  const layerOffset = depth * 0.08
  const contentOffset = depth * -0.03
  const cardsOffset = depth * -0.05
  const heroImage = heroVisuals[0] ?? heroVisuals[1] ?? ""
  const cards = heroCards.slice(0, 4)
  const layouts = [
    { top: "0px", left: "0px", width: "300px", height: "220px", className: "emz-home-stack-card-a" },
    { top: "24px", right: "0px", width: "285px", height: "208px", className: "emz-home-stack-card-b" },
    { bottom: "26px", left: "32px", width: "268px", height: "196px", className: "emz-home-stack-card-c" },
    { bottom: "0px", right: "28px", width: "228px", height: "166px", className: "emz-home-stack-card-d" },
  ] as const

  return (
    <section className="emz-hero-section !max-w-none px-0 sm:px-0 lg:px-0">
      <div className="relative overflow-hidden bg-[#0b1829] text-white">
        <div className="emz-home-hero-grid-lines" />
        <div className="emz-home-hero-glow-a" />
        <div className="emz-home-hero-glow-b" />

        <div
          className="absolute inset-0"
          style={{
            transform: `translate3d(0, ${layerOffset}px, 0)`,
            backgroundImage: `linear-gradient(120deg,rgba(8,16,29,0.8),rgba(21,34,53,0.74) 40%,rgba(28,48,80,0.7) 100%), url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.56,
          }}
        />

        <div className="relative z-10 mx-auto grid min-h-[86vh] w-full max-w-[1280px] grid-cols-1 gap-10 px-6 pb-8 pt-12 md:px-10 lg:grid-cols-[1fr_480px] lg:gap-16 lg:px-14 lg:pt-20">
          <div className="emz-home-hero-content-enter self-center" style={{ transform: `translate3d(0, ${contentOffset}px, 0)` }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4fc3f7]/25 bg-[#4fc3f7]/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7dd6ff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4fc3f7]" />
              Migration intelligence platform
            </span>
            <h1 className="mt-6 font-[var(--font-playfair)] text-6xl font-semibold leading-[0.95] text-white md:text-8xl">
              Move smarter.
              <br />
              <em className="italic text-[#4fc3f7]">Execute</em> and
              <br />
              settle faster.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/70 md:text-lg">
              Verified services, expert-led relocation pathways, and city intelligence in one clear end-to-end flow for serious movers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="rounded-full bg-[#1976d2] px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1e88e5]">
                Explore services
              </Link>
              <Link href="/cities#intel-tool" className="rounded-full border border-white/25 bg-transparent px-7 py-3 text-sm font-semibold text-white/90 transition hover:border-white/60 hover:text-white">
                Explore city intel
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/70">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Visa coordination</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Housing search</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Entity setup</span>
            </div>
          </div>

          <div className="emz-home-hero-cards-enter hidden self-center lg:block" style={{ transform: `translate3d(0, ${cardsOffset}px, 0)` }}>
            <div className="relative h-[440px]">
              {cards.map((card, index) => {
                const layout = layouts[index]
                const { className, ...cardLayout } = layout
                return (
                  <article
                    key={`${card.title}-${index}`}
                    className={`emz-home-stack-card ${className}`}
                    style={{ ...cardLayout, backgroundImage: `linear-gradient(180deg,transparent 45%,rgba(3,8,20,0.74) 100%), url(${card.image})` }}
                  >
                    <span
                      className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        card.badge === "Installment"
                          ? "bg-[#e8a020] text-[#0b1829]"
                          : card.badge === "Commercial"
                            ? "bg-[#7b1fa2] text-white"
                            : "bg-[#1976d2] text-white"
                      }`}
                    >
                      {card.badge}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9bdfff]">{card.city}</p>
                      <p className="text-sm font-semibold text-white">{card.title}</p>
                      <p className="text-xs text-white/75">{card.price}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-6 border-t border-white/10 px-6 py-5 md:px-10 lg:px-14">
          {[
            { value: `${citiesCount}+`, label: "Cities covered" },
            { value: `${servicesCount}`, label: "Verified services" },
            { value: "3", label: "Relocation pathways" },
            { value: "98%", label: "Client satisfaction" },
          ].map((item, index) => (
            <div key={item.label} className="flex items-center gap-5">
              <div>
                <p className="font-[var(--font-playfair)] text-4xl font-semibold leading-none text-white">{item.value}</p>
                <p className="mt-1 text-xs text-white/55">{item.label}</p>
              </div>
              {index < 3 ? <span className="hidden h-8 w-px bg-white/20 md:block" /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
