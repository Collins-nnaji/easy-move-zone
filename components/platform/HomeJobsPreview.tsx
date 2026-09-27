"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, ChevronRight, MapPin } from "lucide-react"
import { CompanyLogo } from "@/components/career/CompanyLogo"

type PreviewJob = {
  id: string
  title: string
  company: string | null
  city: string
  country: string
  flag: string
  sponsorship: string
  url: string | null
  logoUrl: string | null
  jobType: string | null
  featured: boolean
}

export const PREVIEW_COUNT = 10

export function HomeJobsPreview() {
  const [jobs, setJobs] = useState<PreviewJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    void fetch(`/api/jobs?sample=1&limit=${PREVIEW_COUNT}`, { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { jobs: [] }))
      .then((data) => { if (active) setJobs(Array.isArray(data.jobs) ? data.jobs.slice(0, PREVIEW_COUNT) : []) })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false; controller.abort() }
  }, [])

  return (
    <section className="border-t border-[#e4dfd5] bg-[#efece4] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e0511f]">Live opportunities</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-[#1b231e] sm:text-4xl">
              {PREVIEW_COUNT} roles from the jobs board
            </h2>
          </div>
          <Link href="/jobs" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1b231e] px-5 text-sm font-bold text-white">
            View all jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 space-y-2">
            {Array.from({ length: PREVIEW_COUNT }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/70" />)}
          </div>
        ) : jobs.length ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-[#ddd8ce] bg-white shadow-[0_12px_35px_rgba(27,35,30,.06)]">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs?jobId=${encodeURIComponent(job.id)}`}
                className="group flex items-center gap-3 border-b border-[#ebe7df] px-4 py-4 transition last:border-b-0 hover:bg-[#f4f7f5] sm:gap-4 sm:px-5"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <CompanyLogo company={job.company ?? job.title} logoUrl={job.logoUrl} careerUrl={job.url} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-extrabold leading-snug text-[#1b231e] group-hover:text-[#2f5d50] sm:text-[15px]">{job.title}</h3>
                      {job.featured && <span className="rounded-full bg-[#e5efeb] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#285045]">Featured</span>}
                    </div>
                    <p className="mt-1 truncate text-xs font-bold text-[#2f5d50]">{job.company ?? "Hiring company"}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#626861]">
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" /> {job.flag} {job.city}{job.country && job.country !== job.city ? `, ${job.country}` : ""}</span>
                      <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" /> {job.jobType || "Role details available"}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden shrink-0 items-center gap-3 sm:flex">
                  <span className="rounded-full bg-[#edf3f0] px-3 py-1 text-[10px] font-extrabold text-[#285045]">{job.sponsorship || "Sponsorship checked"}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd8ce] text-[#2f5d50] transition group-hover:border-[#2f5d50] group-hover:bg-[#2f5d50] group-hover:text-white"><ChevronRight className="h-4 w-4" /></span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#2f5d50] sm:hidden" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-[#d8d2c6] bg-white/60 px-6 py-12 text-center">
            <BriefcaseBusiness className="mx-auto h-7 w-7 text-[#e0511f]" />
            <p className="mt-3 font-extrabold text-[#1b231e]">The live jobs feed is being refreshed.</p>
            <p className="mt-1 text-sm text-[#6b716a]">Open the board to search as soon as roles are available.</p>
          </div>
        )}
      </div>
    </section>
  )
}
