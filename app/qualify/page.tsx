"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  RotateCcw,
  Sparkles,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const
const STEPS = ["Your profile", "Skills & goals", "Your situation", "Your results"]

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-secondary text-black" : i === step ? "bg-primary text-black" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium text-center max-w-[66px] ${i === step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${i < step ? "bg-secondary" : "bg-border"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function PillGroup<T extends string>({
  options, value, onChange,
}: {
  options: { label: string; value: T }[]
  value: T | T[]
  onChange: (v: T) => void
}) {
  const isSelected = (v: T) => Array.isArray(value) ? value.includes(v) : value === v
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ label, value: v }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isSelected(v) ? "bg-primary text-black border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

interface VisaMatch {
  country: string
  visa: string
  score: number
  timeline: string
  costRange: string
}

interface AssessmentResult {
  matches: VisaMatch[]
  summary: string
  nextSteps: string[]
}

function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? "text-secondary" : score >= 50 ? "text-accent" : "text-muted-foreground"

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" className="text-border" />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          className={`${color} animate-gauge`}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, "--gauge-offset": offset } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${color}`}>{score}%</span>
      </div>
    </div>
  )
}

function MatchCard({ match, rank }: { match: VisaMatch; rank: number }) {
  const isBest = rank === 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.4, ease: EASE }}
      className={`rounded-2xl border bg-white p-5 shadow-[0_14px_30px_-24px_rgba(0,0,0,0.45)] ${isBest ? "border-secondary/50 ring-1 ring-secondary/20" : "border-black/10"}`}
    >
      {isBest && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3 h-3" /> Best match
        </div>
      )}
      <div className="flex items-start gap-4">
        <ScoreGauge score={match.score} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{match.country}</span>
          </div>
          <h3 className="font-bold text-base mb-2">{match.visa}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{match.timeline}</span>
            <span className="flex items-center gap-1"><Banknote className="w-3 h-3" />{match.costRange}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function QualifyPage() {
  const [step, setStep] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<AssessmentResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const [age, setAge] = React.useState(30)
  const [education, setEducation] = React.useState<string>("bachelors")
  const [experience, setExperience] = React.useState(4)
  const [profession, setProfession] = React.useState("")

  const [english, setEnglish] = React.useState<string>("fluent")
  const [goals, setGoals] = React.useState<string[]>(["work"])
  const [destination, setDestination] = React.useState<string>("no-preference")
  const [timeline, setTimeline] = React.useState<string>("6-12")

  const [budget, setBudget] = React.useState<string>("2m-5m")
  const [family, setFamily] = React.useState<string>("single")

  const profileCompletion = React.useMemo(() => {
    const checks = [
      profession.trim().length > 1,
      goals.length > 0,
      destination !== "",
      timeline !== "",
      budget !== "",
      family !== "",
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [profession, goals, destination, timeline, budget, family])

  function toggleGoal(g: string) {
    setGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setStep(3)

    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age, education, experience, profession,
          english, goals, destination, timeline,
          budget, family,
        }),
      })

      if (!res.ok) throw new Error("Assessment failed")

      const data: AssessmentResult = await res.json()
      setResult(data)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setStep(0)
    setResult(null)
    setError(null)
  }

  const topMatch = result?.matches?.[0] ?? null

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 bg-gradient-to-b from-white via-white to-black/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <Link href="/suite" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/70 hover:text-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Suite
          </Link>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="rounded-3xl border border-black/10 bg-white p-6 md:p-8 mb-6 shadow-[0_24px_56px_-34px_rgba(0,0,0,0.42)]"
        >
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold mb-3">
                <BadgeCheck className="w-3.5 h-3.5" /> Assessment cockpit
              </div>
              <h1 className="display-title text-3xl md:text-5xl font-bold text-black mb-2">
                AI migration assessment workspace
              </h1>
              <p className="text-black/70 text-sm md:text-base">
                Structured profile capture and route intelligence scoring for UK, Canada, and Europe pathways.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-black text-white p-5">
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 mb-2">
                <Activity className="w-3.5 h-3.5" />
                Live assessment state
              </div>
              <div className="text-3xl font-bold mb-1">{profileCompletion}%</div>
              <p className="text-xs text-white/70 mb-3">Profile completion before score confidence peaks.</p>
              <div className="h-2 rounded-full bg-white/15 overflow-hidden mb-3">
                <div className="h-full bg-white transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
              </div>
              <div className="text-xs text-white/75">
                Current stage: <span className="font-semibold text-white">{STEPS[step]}</span>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5 items-start">
          <section className="rounded-2xl border border-black/10 bg-white p-5 md:p-6 shadow-[0_20px_46px_-35px_rgba(0,0,0,0.45)]">
            <StepBar step={step} />

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                  <div className="space-y-5 rounded-xl border border-black/10 bg-white p-5">
                    <h2 className="font-bold">Your Profile</h2>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold">Age</label>
                        <span className="text-sm font-bold text-primary">{age} years</span>
                      </div>
                      <input type="range" min={17} max={65} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-2 block">Highest Education</label>
                      <PillGroup
                        options={[
                          { label: "Secondary / SSCE", value: "secondary" },
                          { label: "Diploma / HND", value: "diploma" },
                          { label: "Bachelor’s", value: "bachelors" },
                          { label: "Master’s", value: "masters" },
                          { label: "PhD", value: "phd" },
                        ]}
                        value={education}
                        onChange={setEducation}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold">Years of Work Experience</label>
                        <span className="text-sm font-bold text-primary">{experience} yr{experience !== 1 ? "s" : ""}</span>
                      </div>
                      <input type="range" min={0} max={30} value={experience} onChange={(e) => setExperience(Number(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-2 block">Current Profession / Job Title</label>
                      <input
                        type="text"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="e.g. Software Engineer, Nurse, Accountant"
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-medium placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                      />
                    </div>
                  </div>
                  <Button className="w-full gap-1.5" onClick={() => setStep(1)} disabled={!profession.trim()}>
                    Skills & Goals <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                  <div className="space-y-5 rounded-xl border border-black/10 bg-white p-5">
                    <h2 className="font-bold">Skills & Goals</h2>
                    <div>
                      <label className="text-sm font-bold mb-2 block">English Proficiency</label>
                      <PillGroup
                        options={[
                          { label: "Beginner", value: "beginner" },
                          { label: "Intermediate", value: "intermediate" },
                          { label: "Fluent", value: "fluent" },
                          { label: "IELTS 5.5", value: "ielts-5.5" },
                          { label: "IELTS 6.0", value: "ielts-6.0" },
                          { label: "IELTS 6.5", value: "ielts-6.5" },
                          { label: "IELTS 7.0+", value: "ielts-7.0" },
                        ]}
                        value={english}
                        onChange={setEnglish}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1 block">Migration Goals</label>
                      <p className="text-xs text-muted-foreground mb-2">Select all that apply</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Work", value: "work" },
                          { label: "Study", value: "study" },
                          { label: "Start a business", value: "business" },
                          { label: "Family reunification", value: "family" },
                        ].map(({ label, value: v }) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => toggleGoal(v)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${goals.includes(v) ? "bg-primary text-black border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-2 block">Preferred Destination</label>
                      <PillGroup
                        options={[
                          { label: "United Kingdom", value: "uk" },
                          { label: "Canada", value: "canada" },
                          { label: "Europe", value: "europe" },
                          { label: "No preference", value: "no-preference" },
                        ]}
                        value={destination}
                        onChange={setDestination}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-2 block">How Soon Do You Want to Move?</label>
                      <PillGroup
                        options={[
                          { label: "ASAP (1–3 months)", value: "0-3" },
                          { label: "3–6 months", value: "3-6" },
                          { label: "6–12 months", value: "6-12" },
                          { label: "1–2 years", value: "12-24" },
                          { label: "Just exploring", value: "exploring" },
                        ]}
                        value={timeline}
                        onChange={setTimeline}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
                    <Button onClick={() => setStep(2)} className="flex-1 gap-1.5" disabled={goals.length === 0}>
                      Your Situation <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                  <div className="space-y-5 rounded-xl border border-black/10 bg-white p-5">
                    <h2 className="font-bold">Your Situation</h2>
                    <div>
                      <label className="text-sm font-bold mb-2 block">Budget Range (₦)</label>
                      <p className="text-xs text-muted-foreground mb-2">Total amount you can invest in your relocation</p>
                      <PillGroup
                        options={[
                          { label: "Under ₦500K", value: "under-500k" },
                          { label: "₦500K – ₦2M", value: "500k-2m" },
                          { label: "₦2M – ₦5M", value: "2m-5m" },
                          { label: "₦5M – ₦10M", value: "5m-10m" },
                          { label: "₦10M+", value: "10m-plus" },
                        ]}
                        value={budget}
                        onChange={setBudget}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-2 block">Family Size</label>
                      <PillGroup
                        options={[
                          { label: "Single", value: "single" },
                          { label: "Couple", value: "couple" },
                          { label: "With children", value: "with-children" },
                        ]}
                        value={family}
                        onChange={setFamily}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-black/10 bg-white p-5">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Review your profile</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div><span className="text-muted-foreground">Age:</span> <span className="font-bold">{age}</span></div>
                      <div><span className="text-muted-foreground">Education:</span> <span className="font-bold capitalize">{education}</span></div>
                      <div><span className="text-muted-foreground">Experience:</span> <span className="font-bold">{experience} yrs</span></div>
                      <div><span className="text-muted-foreground">Profession:</span> <span className="font-bold">{profession || "—"}</span></div>
                      <div><span className="text-muted-foreground">English:</span> <span className="font-bold capitalize">{english.replace("ielts-", "IELTS ")}</span></div>
                      <div><span className="text-muted-foreground">Budget:</span> <span className="font-bold">{budget.replace("under-", "Under ₦").replace("k", "K").replace("-", " – ₦").replace("m", "M").replace("plus", "+")}</span></div>
                      <div><span className="text-muted-foreground">Family:</span> <span className="font-bold capitalize">{family.replace("-", " ")}</span></div>
                      <div><span className="text-muted-foreground">Goals:</span> <span className="font-bold capitalize">{goals.join(", ")}</span></div>
                      <div><span className="text-muted-foreground">Destination:</span> <span className="font-bold capitalize">{destination.replace("-", " ")}</span></div>
                      <div><span className="text-muted-foreground">Timeline:</span> <span className="font-bold">{timeline === "exploring" ? "Exploring" : timeline.replace("-", "–") + " months"}</span></div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                    <Button onClick={handleSubmit} className="flex-1 gap-1.5">
                      Get My Results <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                  {loading && (
                    <div className="rounded-xl border border-black/10 bg-white p-10 text-center">
                      <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                      <h3 className="font-bold text-lg mb-1">Analysing your profile</h3>
                      <p className="text-sm text-muted-foreground">Our AI is matching you to the best visa pathways…</p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl border border-destructive/30 bg-white p-6 text-center">
                      <p className="text-destructive font-bold mb-3">{error}</p>
                      <Button variant="outline" onClick={handleReset} className="gap-2">
                        <RotateCcw className="w-4 h-4" /> Try again
                      </Button>
                    </div>
                  )}

                  {result && !loading && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, ease: EASE }}
                        className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Assessment</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
                      </motion.div>

                      <div>
                        <h2 className="font-bold text-lg mb-4">Your visa matches</h2>
                        <div className="space-y-3">
                          {result.matches.map((match, i) => (
                            <MatchCard key={match.visa} match={match} rank={i} />
                          ))}
                        </div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, ease: EASE }}
                        className="rounded-xl border border-black/10 bg-white p-6"
                      >
                        <h3 className="font-bold text-sm mb-4">Suggested next steps</h3>
                        <div className="space-y-3">
                          {result.nextSteps.map((s, i) => (
                            <div key={i} className="flex gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                              <p className="text-sm text-muted-foreground">{s}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      <div className="bg-white border border-black/12 rounded-2xl p-6 text-center shadow-[0_18px_44px_-26px_rgba(0,0,0,0.35)]">
                        <h3 className="text-lg font-bold text-black mb-2">Ready to execute?</h3>
                        <p className="text-black/70 text-xs mb-5">Move into the document and funding modules to operationalize this route.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Link href="/document-support">
                            <Button className="bg-white text-black hover:bg-white/90 gap-2 font-bold w-full sm:w-auto">
                              Open document support <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href="/calculator">
                            <Button variant="outline" className="border-black/20 text-black hover:bg-black/5 gap-2 w-full sm:w-auto">
                              Open calculator
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="text-center text-xs text-muted-foreground py-4 flex flex-wrap justify-center gap-4">
                        {["AI-powered results", "Route intelligence", "Document workflow", "Execution planning"].map((t) => (
                          <span key={t} className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-accent" /> {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={handleReset} className="flex-1 gap-2">
                          <RotateCcw className="w-4 h-4" /> Start new assessment
                        </Button>
                        <Link href="/suite" className="flex-1">
                          <Button className="w-full gap-1.5">Go to Suite <ArrowRight className="w-4 h-4" /></Button>
                        </Link>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <section className="rounded-2xl border border-black/10 bg-black text-white p-5">
              <h3 className="font-bold mb-2">Assessment panel</h3>
              <div className="text-xs text-white/70 mb-3">
                {loading ? "Running route models..." : step < 3 ? "Collecting profile inputs..." : "Model output ready."}
              </div>
              <div className="space-y-2 text-xs">
                <div className="rounded-lg border border-white/15 bg-white/[0.06] p-2.5 flex items-center justify-between">
                  <span className="text-white/70">Current step</span>
                  <span className="font-semibold">{STEPS[step]}</span>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/[0.06] p-2.5 flex items-center justify-between">
                  <span className="text-white/70">Profile completion</span>
                  <span className="font-semibold">{profileCompletion}%</span>
                </div>
                {topMatch && (
                  <div className="rounded-lg border border-white/15 bg-white/[0.06] p-2.5">
                    <div className="text-white/70 mb-1">Top route</div>
                    <div className="font-semibold">{topMatch.country} · {topMatch.visa}</div>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <h3 className="font-bold text-black mb-2">Signal snapshot</h3>
              <div className="space-y-2 text-xs">
                {[
                  `Profession: ${profession || "Pending input"}`,
                  `Destination: ${destination.replace("-", " ")}`,
                  `Goals: ${goals.join(", ") || "None"}`,
                  `Timeline: ${timeline === "exploring" ? "Exploring" : `${timeline.replace("-", "–")} months`}`,
                ].map((item) => (
                  <div key={item} className="rounded-lg border border-black/10 bg-black/[0.02] p-2.5 text-black/75">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <h3 className="font-bold text-black mb-2">Quick links</h3>
              <div className="space-y-2">
                <Link href="/document-support" className="flex items-center justify-between rounded-lg border border-black/12 bg-white px-3 py-2 text-sm text-black/80 hover:bg-black/[0.03]">
                  Document support <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/calculator" className="flex items-center justify-between rounded-lg border border-black/12 bg-white px-3 py-2 text-sm text-black/80 hover:bg-black/[0.03]">
                  Calculator <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/suite" className="flex items-center justify-between rounded-lg border border-black/12 bg-white px-3 py-2 text-sm text-black/80 hover:bg-black/[0.03]">
                  Suite dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
