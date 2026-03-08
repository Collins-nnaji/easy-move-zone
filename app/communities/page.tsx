"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/Button"

const EASE = [0.16, 1, 0.3, 1] as const

const GROUPS = [
  { id: "c1", city: "London", focus: "Students", members: 3400, channel: "WhatsApp + Discord", events: 6 },
  { id: "c2", city: "Toronto", focus: "Families", members: 2200, channel: "Telegram + Slack", events: 4 },
  { id: "c3", city: "Berlin", focus: "Digital nomads", members: 1800, channel: "Discord", events: 8 },
  { id: "c4", city: "Lisbon", focus: "Founders", members: 950, channel: "Slack", events: 5 },
  { id: "c5", city: "Manchester", focus: "Professionals", members: 1300, channel: "WhatsApp", events: 3 },
]

export default function CommunitiesPage() {
  const [focus, setFocus] = React.useState("All")
  const [city, setCity] = React.useState("All")

  const rows = React.useMemo(() => {
    return GROUPS
      .filter((g) => focus === "All" || g.focus === focus)
      .filter((g) => city === "All" || g.city === city)
      .sort((a, b) => b.members - a.members)
  }, [focus, city])

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 bg-gradient-to-b from-white via-white to-black/[0.02]">
      <div className="max-w-6xl mx-auto">
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
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-black mb-3">
            <Users className="w-3.5 h-3.5" />
            Expat communities module
          </div>
          <h1 className="display-title text-3xl md:text-5xl text-black mb-2">Join relocation communities</h1>
          <p className="text-black/70 max-w-3xl">
            Help users settle faster with trusted groups, events, and peer support channels in destination cities.
          </p>
        </motion.section>

        <section className="rounded-2xl border border-black/10 bg-white p-4 mb-5">
          <div className="grid md:grid-cols-2 gap-3">
            <select value={focus} onChange={(e) => setFocus(e.target.value)} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm">
              {["All", "Students", "Families", "Digital nomads", "Founders", "Professionals"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm">
              {["All", "London", "Toronto", "Berlin", "Lisbon", "Manchester"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          {rows.map((group, i) => (
            <motion.article
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.26 }}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_14px_30px_-24px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1 text-xs text-black/60">
                  <MapPin className="w-3.5 h-3.5" />
                  {group.city}
                </div>
                <span className="rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">{group.focus}</span>
              </div>
              <h2 className="font-bold text-black text-lg mb-2">{group.city} {group.focus} Network</h2>
              <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                <div className="rounded-lg border border-black/10 bg-black/[0.02] p-2">
                  <div className="text-black/55">Members</div>
                  <div className="font-bold text-black">{group.members.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-black/10 bg-black/[0.02] p-2">
                  <div className="text-black/55">Channel</div>
                  <div className="font-bold text-black">{group.channel}</div>
                </div>
                <div className="rounded-lg border border-black/10 bg-black/[0.02] p-2">
                  <div className="text-black/55">Events/mo</div>
                  <div className="font-bold text-black">{group.events}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="gap-2">Join group</Button>
                <Button variant="outline" className="gap-2"><CalendarDays className="w-4 h-4" /> See events</Button>
              </div>
            </motion.article>
          ))}
          {rows.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-black/20 bg-white p-8 text-center text-sm text-black/60">
              No communities match current filters.
            </div>
          )}
        </section>

        <div className="mt-8 text-center">
          <Link href="/relocation-assistant">
            <Button variant="outline" className="gap-2">Ask assistant for city onboarding plan <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
