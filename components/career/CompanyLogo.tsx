"use client"

/**
 * Company mark with cascading sources over a letter avatar (never a broken img).
 * The avatar stays visible until a source loads at a usable size; placeholder
 * favicons (16px globes) and dead hosts are skipped.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getPermanentLogo } from "@/lib/career/permanent-logos"

const ATS_HOSTS = [
  "greenhouse.io",
  "ashbyhq.com",
  "lever.co",
  "smartrecruiters.com",
  "workable.com",
  "myworkdayjobs.com",
  "workday.com",
  "bamboohr.com",
  "jobvite.com",
  "icims.com",
  "teamtailor.com",
  "recruitee.com",
  "breezy.hr",
  "personio.de",
  "successfactors.com",
  "taleo.net",
  "oraclecloud.com",
  "eightfold.ai",
  "rippling.com",
  "pinpointhq.com",
  "join.com",
]

const CAREERS_SUBDOMAINS = /^(careers?|jobs|apply|talent|work|recruiting|hire|www)\./

const AVATAR_PALETTE = [
  "#e0511f",
  "#1b231e",
  "#2f6f6a",
  "#7a3b24",
  "#3d5a80",
  "#5c4d7a",
  "#4a7043",
  "#8b5a2b",
]

function domainFromCareerUrl(careerUrl?: string | null): string | null {
  if (!careerUrl) return null
  try {
    const host = new URL(careerUrl).hostname.toLowerCase()
    if (ATS_HOSTS.some((ats) => host === ats || host.endsWith(`.${ats}`))) return null
    return host.replace(CAREERS_SUBDOMAINS, "")
  } catch {
    return null
  }
}

function domainFromCompanyName(company: string): string | null {
  const slug = company
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\b(uk|usa|inc|ltd|limited|corp|corporation|plc|group|holdings|technologies|labs|solutions|services)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
  return slug.length >= 3 ? `${slug}.com` : null
}

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN
const DEAD_LOGO_HOSTS = /(^|\.)(logo\.clearbit\.com|icons\.duckduckgo\.com)$/
const MIN_LOGO_PX = 32
const LOAD_TIMEOUT_MS = 5000

function logoDevDomain(url: string | null | undefined): string | null {
  return url?.match(/(?:img\.logo\.dev|logo\.clearbit\.com)\/([^/?#]+)/)?.[1] ?? null
}

function cleanLogoUrl(url?: string | null): string | null {
  const value = url?.trim()
  if (!value || value === "null" || value === "undefined") return null
  try {
    const parsed = new URL(value)
    if (DEAD_LOGO_HOSTS.test(parsed.hostname)) return null
    if (parsed.hostname === "img.logo.dev" && !LOGO_DEV_TOKEN) return null
  } catch {
    return null
  }
  return value
}

/** logo.dev needs a publishable token; without one, fall back to Google's favicon service (128px when known). */
export function companyLogoSources(company: string, careerUrl?: string | null, logoUrl?: string | null): string[] {
  const permanent = getPermanentLogo(company)
  const permanentDomain = logoDevDomain(permanent)
  const domains = [
    ...new Set(
      [logoDevDomain(logoUrl), permanentDomain, domainFromCareerUrl(careerUrl), domainFromCompanyName(company)].filter(
        (d): d is string => Boolean(d),
      ),
    ),
  ]
  return [
    permanent && !permanentDomain ? permanent : null,
    ...(LOGO_DEV_TOKEN ? domains.map((d) => `https://img.logo.dev/${d}?token=${LOGO_DEV_TOKEN}&size=128&format=png`) : []),
    ...domains.map((d) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`),
  ].filter((src): src is string => Boolean(src))
}

function initials(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function avatarColor(company: string): string {
  let hash = 0
  for (let i = 0; i < company.length; i++) hash = (hash * 31 + company.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]!
}

function LetterAvatar({ company }: { company: string }) {
  return (
    <span
      aria-hidden
      className="flex h-full w-full items-center justify-center text-[11px] font-extrabold tracking-tight text-white"
      style={{ background: avatarColor(company || "?") }}
    >
      {initials(company || "?")}
    </span>
  )
}

type Props = {
  company: string
  logoUrl?: string | null
  careerUrl?: string | null
  className?: string
  /** Optional override when every logo source fails. Defaults to a letter avatar. */
  fallback?: React.ReactNode
}

export function CompanyLogo({ company, logoUrl, careerUrl, className, fallback }: Props) {
  const sources = useMemo(
    () =>
      [cleanLogoUrl(logoUrl), ...companyLogoSources(company, careerUrl, logoUrl)].filter(
        (s): s is string => Boolean(s),
      ),
    [company, logoUrl, careerUrl],
  )
  const [state, setState] = useState({ key: "", attempt: 0, loaded: false })
  const sourceKey = sources.join("|")
  const current = state.key === sourceKey ? state : { key: sourceKey, attempt: 0, loaded: false }
  const src = current.attempt < sources.length ? sources[current.attempt] : undefined
  const avatar = fallback ?? <LetterAvatar company={company} />

  const advance = useCallback(
    (failed: string) =>
      setState((prev) => {
        const base = prev.key === sourceKey ? prev : { key: sourceKey, attempt: 0, loaded: false }
        if (sources[base.attempt] !== failed) return base
        return { key: sourceKey, attempt: base.attempt + 1, loaded: false }
      }),
    [sourceKey, sources],
  )

  const accept = useCallback(
    (img: HTMLImageElement) => {
      if (img.naturalWidth < MIN_LOGO_PX || img.naturalHeight < MIN_LOGO_PX) {
        advance(img.dataset.src ?? "")
        return
      }
      setState((prev) => {
        const base = prev.key === sourceKey ? prev : { key: sourceKey, attempt: 0, loaded: false }
        return sources[base.attempt] === img.dataset.src ? { ...base, loaded: true } : base
      })
    },
    [advance, sourceKey, sources],
  )

  const imgRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!src || current.loaded) return
    const img = imgRef.current
    if (img?.complete) {
      if (img.naturalWidth > 0) accept(img)
      else advance(src)
      return
    }
    const timer = setTimeout(() => advance(src), LOAD_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [src, current.loaded, accept, advance])

  return (
    <span
      className={`relative ${
        className ??
        "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#efece4] bg-white"
      }`}
    >
      {!current.loaded && avatar}
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          key={src}
          src={src}
          data-src={src}
          alt=""
          decoding="async"
          referrerPolicy="no-referrer"
          className={`h-full w-full object-contain p-1.5 ${current.loaded ? "" : "absolute inset-0 opacity-0"}`}
          onLoad={(event) => accept(event.currentTarget)}
          onError={() => advance(src)}
        />
      )}
    </span>
  )
}
