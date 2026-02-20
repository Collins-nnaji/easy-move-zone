"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2, ChevronRight, ArrowRight, BadgeCheck, Star,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { fmtN } from "@/lib/mortgage"

/* ── Step bar ─────────────────────────────────────────── */
const STEPS = ["Your profile", "Relocation goals", "Financial picture", "Submit for assessment"]

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? "bg-secondary text-white" : i === step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium text-center max-w-[60px] ${i === step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${i < step ? "bg-secondary" : "bg-border"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

/* ── Pill selector ─────────────────────────────────────── */
function PillGroup<T extends string>({
  options, value, onChange, multi = false,
}: {
  options: { label: string; value: T }[]
  value: T | T[]
  onChange: (v: T) => void
  multi?: boolean
}) {
  const isSelected = (v: T) => Array.isArray(value) ? value.includes(v) : value === v
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ label, value: v }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            isSelected(v) ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/40"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/* ── Destination fit card ─────────────────────────────── */
const DESTINATION_FIT = [
  { id: "uk", name: "United Kingdom", tag: "Work · Study", href: "/destinations?country=uk" },
  { id: "canada", name: "Canada", tag: "Express Entry · PNP", href: "/destinations?country=canada" },
  { id: "us", name: "United States", tag: "Work · H1B · Study", href: "/destinations?country=us" },
  { id: "uae", name: "UAE", tag: "Residency · Work", href: "/destinations?country=uae" },
]

function DestinationCard({ dest }: { dest: (typeof DESTINATION_FIT)[0] }) {
  return (
    <div className="fintech-card p-5 border-secondary/20">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-bold text-sm">{dest.name}</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">Explore</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{dest.tag}</p>
      <div className="flex gap-2">
        <Link href={dest.href} className="flex-1">
          <Button size="sm" variant="outline" className="w-full">Guide</Button>
        </Link>
        <Link href="/calculator" className="flex-1">
          <Button size="sm" className="w-full gap-1">Cost <ArrowRight className="w-3 h-3" /></Button>
        </Link>
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function QualifyPage() {
  const [step, setStep] = React.useState(0)

  /* Step 1 */
  const [empType, setEmpType] = React.useState<"government" | "private" | "self" | "diaspora">("government")
  const [age, setAge] = React.useState(35)
  const [income, setIncome] = React.useState(400_000)
  const [state, setState] = React.useState<string>("lagos")
  const [nhfContributor, setNhfContributor] = React.useState(false)
  const [nhfYears, setNhfYears] = React.useState(2)

  /* Step 2 */
  const [loanPurpose, setLoanPurpose] = React.useState<"purchase" | "build" | "refinance">("purchase")
  const [propertyValue, setPropertyValue] = React.useState(50_000_000)
  const [downPayment, setDownPayment] = React.useState(10_000_000)
  const [propType, setPropType] = React.useState<string>("detached")

  /* Step 3 */
  const [otherDebt, setOtherDebt] = React.useState(0)
  const [creditScore, setCreditScore] = React.useState<"excellent" | "good" | "fair" | "poor" | "unknown">("good")
  const [pfaName, setPfaName] = React.useState<string | null>(null)
  const [rsaBalance, setRsaBalance] = React.useState(5_000_000)

  /* Derived */
  const loanAmount = propertyValue - downPayment
  const downPaymentPct = (downPayment / propertyValue) * 100
  const grossIncome = income
  const monthlyPaymentApprox = loanAmount * (0.15 / 12) / (1 - Math.pow(1 + 0.15 / 12, -240))
  const dti = (monthlyPaymentApprox / grossIncome) * 100
  const isNHF = nhfContributor && (empType === "government" || empType === "private")
  const isRSA = pfaName !== null
  const isDiaspora = empType === "diaspora"

  const decisionConfig = { label: "READY TO ASSESS", color: "text-secondary", bg: "bg-secondary/10 border-secondary/30", icon: CheckCircle2, badge: "badge-approved" }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold mb-4">
            <BadgeCheck className="w-3.5 h-3.5" /> Get assessed
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Candidate <span className="gradient-text">assessment</span>
          </h1>
          <p className="text-muted-foreground text-sm">Submit your profile. We assess your fit for UK, Canada, US, UAE and guide you from start to finish.</p>
        </div>

        <StepBar step={step} />

        <AnimatePresence mode="wait">

          {/* ── STEP 1 ─────────────────────────── */}
          {step === 0 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">

              <div className="fintech-card p-6 space-y-5">
                <h2 className="font-bold">Your Profile</h2>

                <div>
                  <label className="text-sm font-bold mb-2 block">Employment Type</label>
                  <PillGroup
                    options={[
                      { label: "Government", value: "government" },
                      { label: "Private Sector", value: "private" },
                      { label: "Self-Employed", value: "self" },
                      { label: "Diaspora", value: "diaspora" },
                    ]}
                    value={empType}
                    onChange={(v) => setEmpType(v as "government" | "private" | "self" | "diaspora")}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-bold">Age</label>
                    <span className="text-sm font-bold text-primary">{age} years</span>
                  </div>
                  <input type="range" min={21} max={60} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between text-[10px] text-muted-foreground"><span>21</span><span>60</span></div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-bold">Monthly Gross Income</label>
                    <span className="text-sm font-bold text-primary">{fmtN(income)}</span>
                  </div>
                  <input type="range" min={50_000} max={5_000_000} step={50_000} value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between text-[10px] text-muted-foreground"><span>₦50K</span><span>₦5M</span></div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">State</label>
                  <PillGroup
                    options={[
                      { label: "Lagos", value: "lagos" },
                      { label: "Abuja", value: "abuja" },
                      { label: "Port Harcourt", value: "ph" },
                      { label: "Other", value: "other" },
                    ]}
                    value={state}
                    onChange={setState}
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-bold">NHF Contributor?</span>
                      <p className="text-xs text-muted-foreground">National Housing Fund via FMBN</p>
                    </div>
                    <button
                      onClick={() => setNhfContributor((v) => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${nhfContributor ? "bg-primary" : "bg-muted-foreground/30"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${nhfContributor ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                  {nhfContributor && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold">Years Contributing</label>
                        <span className="text-sm font-bold text-primary">{nhfYears} yr{nhfYears !== 1 ? "s" : ""}</span>
                      </div>
                      <input type="range" min={0} max={30} value={nhfYears} onChange={(e) => setNhfYears(Number(e.target.value))} className="w-full accent-primary" />
                    </div>
                  )}
                </div>
              </div>

              <Button className="w-full gap-1.5" onClick={() => setStep(1)}>
                Relocation Goals <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* ── STEP 2 ─────────────────────────── */}
          {step === 1 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">

              <div className="fintech-card p-6 space-y-5">
                <h2 className="font-bold">Relocation Goals</h2>

                <div>
                  <label className="text-sm font-bold mb-2 block">Loan Purpose</label>
                  <PillGroup
                    options={[
                      { label: "Purchase", value: "purchase" },
                      { label: "Build", value: "build" },
                      { label: "Refinance", value: "refinance" },
                    ]}
                    value={loanPurpose}
                    onChange={(v) => setLoanPurpose(v as typeof loanPurpose)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-bold">Property Value</label>
                    <span className="text-sm font-bold text-primary">{fmtN(propertyValue)}</span>
                  </div>
                  <input type="range" min={5_000_000} max={500_000_000} step={1_000_000} value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between text-[10px] text-muted-foreground"><span>₦5M</span><span>₦500M</span></div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-bold">Down Payment</label>
                    <span className="text-sm font-bold text-primary">{fmtN(downPayment)} ({downPaymentPct.toFixed(0)}%)</span>
                  </div>
                  <input type="range" min={0} max={propertyValue * 0.5} step={500_000} value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between text-[10px] text-muted-foreground"><span>₦0</span><span>{fmtN(propertyValue * 0.5)}</span></div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Property Type</label>
                  <PillGroup
                    options={[
                      { label: "Detached", value: "detached" },
                      { label: "Semi-Detached", value: "semi" },
                      { label: "Flat / Apartment", value: "flat" },
                      { label: "Bungalow", value: "bungalow" },
                    ]}
                    value={propType}
                    onChange={setPropType}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(2)} className="flex-1 gap-1.5">Financial Picture <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3 ─────────────────────────── */}
          {step === 2 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">

              <div className="fintech-card p-6 space-y-5">
                <h2 className="font-bold">Financial Picture</h2>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-bold">Other Monthly Debt</label>
                    <span className="text-sm font-bold text-muted-foreground">{fmtN(otherDebt)}</span>
                  </div>
                  <input type="range" min={0} max={1_000_000} step={10_000} value={otherDebt} onChange={(e) => setOtherDebt(Number(e.target.value))} className="w-full accent-primary" />
                  <div className="flex justify-between text-[10px] text-muted-foreground"><span>₦0</span><span>₦1M</span></div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Credit Score Range</label>
                  <PillGroup
                    options={[
                      { label: "Excellent (750+)", value: "excellent" },
                      { label: "Good (650–749)", value: "good" },
                      { label: "Fair (550–649)", value: "fair" },
                      { label: "Poor (<550)", value: "poor" },
                      { label: "Unknown", value: "unknown" },
                    ]}
                    value={creditScore}
                    onChange={(v) => setCreditScore(v as typeof creditScore)}
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <label className="text-sm font-bold mb-2 block">Pension Fund Administrator (PFA)</label>
                  <p className="text-xs text-muted-foreground mb-3">Select if you have an RSA pension to use for down payment</p>
                  <div className="flex flex-wrap gap-2">
                    {[null, "Stanbic IBTC", "ARM Pensions", "AXA Mansard", "Leadway Pensure", "Crusader Sterling"].map((pfa) => (
                      <button
                        key={pfa ?? "none"}
                        onClick={() => setPfaName(pfa)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          pfaName === pfa ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {pfa ?? "None"}
                      </button>
                    ))}
                  </div>

                  {pfaName && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold">RSA Balance</label>
                        <span className="text-sm font-bold text-primary">{fmtN(rsaBalance)}</span>
                      </div>
                      <input type="range" min={500_000} max={50_000_000} step={500_000} value={rsaBalance} onChange={(e) => setRsaBalance(Number(e.target.value))} className="w-full accent-primary" />
                      <div className="p-3 rounded-xl bg-secondary/10 text-xs">
                        <span className="font-bold text-secondary">RSA Unlockable: {fmtN(Math.round(rsaBalance * 0.25))}</span>
                        <span className="text-muted-foreground ml-1">(25% of balance)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 gap-1.5">See My Results <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Results ─────────────────── */}
          {step === 3 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">

              <div className={`flex items-center gap-4 p-5 rounded-2xl border ${decisionConfig.bg}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${decisionConfig.badge}`} style={{ background: "transparent" }}>
                  <decisionConfig.icon className={`w-6 h-6 ${decisionConfig.color}`} />
                </div>
                <div>
                  <div className={`text-lg font-bold ${decisionConfig.color}`}>{decisionConfig.label}</div>
                  <div className="text-sm text-muted-foreground">
                    Submit to complete your assessment. We&apos;ll review and contact you with next steps.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-bold text-lg">Destinations we can guide you to</h2>
                <p className="text-sm text-muted-foreground">After assessment we recommend the best route and support you from start to finish.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {DESTINATION_FIT.map((dest) => (
                    <motion.div key={dest.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      <DestinationCard dest={dest} />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="fintech-card p-6">
                <h3 className="font-bold text-sm mb-4">What happens next</h3>
                <div className="space-y-3">
                  {[
                    { step: "1", label: "Submit your assessment", desc: "Click below — we'll review your profile." },
                    { step: "2", label: "We contact you", desc: "We'll share your fit and recommended route(s)." },
                    { step: "3", label: "Strategy call & guidance", desc: "We guide you from start to finish. See our process & fees." },
                  ].map(({ step: s, label, desc }) => (
                    <div key={s} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s}</div>
                      <div>
                        <div className="text-sm font-bold">{label}</div>
                        <div className="text-xs text-muted-foreground">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground py-4 flex flex-wrap justify-center gap-4">
                {["Transparent fees", "Start to finish", "We assess you", "We guide you"].map((t) => (
                  <span key={t} className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent" /> {t}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Edit profile</Button>
                <Link href="/fees" className="flex-1">
                  <Button className="w-full gap-1.5">See fees & submit <ArrowRight className="w-4 h-4" /></Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
