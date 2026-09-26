"use client"

/**
 * Company mark with cascading sources, then a letter avatar (never a broken img).
 * curated logo_url → permanent logo.dev map → DuckDuckGo favicon → initials avatar.
 */
import { useEffect, useMemo, useState } from "react"
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

function logoDevFromCompany(company: string): string | null {
  const domain = domainFromCompanyName(company)
  return domain ? `https://img.logo.dev/${domain}` : null
}

function cleanLogoUrl(url?: string | null): string | null {
  const value = url?.trim()
  if (!value) return null
  if (value === "null" || value === "undefined") return null
  return value
}

export function companyLogoSources(company: string, careerUrl?: string | null): string[] {
  const domains = [domainFromCareerUrl(careerUrl), domainFromCompanyName(company)].filter(
    (d): d is string => Boolean(d),
  )
  return [
    getPermanentLogo(company),
    logoDevFromCompany(company),
    ...domains.map((domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`),
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
      [cleanLogoUrl(logoUrl), ...companyLogoSources(company, careerUrl)].filter(
        (s): s is string => Boolean(s),
      ),
    [company, logoUrl, careerUrl],
  )
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setAttempt(0)
  }, [company, logoUrl, careerUrl])

  const src = attempt < sources.length ? sources[attempt] : undefined
  const avatar = fallback ?? <LetterAvatar company={company} />

  return (
    <span
      className={
        className ??
        "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#efece4] bg-white"
      }
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain p-1.5"
          onError={() => setAttempt((n) => n + 1)}
        />
      ) : (
        avatar
      )}
    </span>
  )
}
