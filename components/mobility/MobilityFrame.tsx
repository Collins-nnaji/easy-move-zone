"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export function MobilityFrame({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string
  title: string
  lede: string
  children: ReactNode
}) {
  return (
    <div style={{ background: "#efece4", color: "#1b231e" }}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        {eyebrow && (
          <p className="text-sm font-extrabold tracking-tight text-[#e0511f]">{eyebrow}</p>
        )}
        <h1 className={`page-title text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl ${eyebrow ? "mt-3" : ""}`}>
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5f655c] sm:mt-4 sm:text-base">{lede}</p>
        <div className="mt-6 sm:mt-8">{children}</div>
      </div>
    </div>
  )
}

export function ViewTabs({
  items,
}: {
  items: { href: string; label: string; active?: boolean }[]
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2" role="tablist">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          role="tab"
          aria-selected={item.active}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            item.active
              ? "bg-[#1b231e] text-white"
              : "bg-white text-[#4a5047] hover:text-[#1b231e]"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}

export function useMobilityNavActive() {
  const pathname = usePathname()
  return {
    explore: pathname === "/explore" || pathname.startsWith("/destinations/"),
    check: pathname === "/can-i-move",
    adviser: pathname === "/adviser",
    jobs: pathname === "/jobs",
    settle: pathname === "/settle",
  }
}
