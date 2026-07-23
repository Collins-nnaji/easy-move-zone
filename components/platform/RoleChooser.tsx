"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Briefcase, Truck } from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";

const PRIMARY = "#e0511f";
const INK = "#1b231e";
const MUTE = "#8a8f86";
const LINE = "#e4dfd5";
const HANKEN = "var(--font-jakarta), system-ui, sans-serif";

type RoleKey = "company" | "driver";

const ROLES: Array<{
  key: RoleKey;
  title: string;
  tagline: string;
  points: string[];
  href: string;
  Icon: typeof Briefcase;
}> = [
  {
    key: "company",
    title: "Company",
    tagline: "Post jobs & hire drivers",
    points: ["Post funded jobs", "Hire rated drivers", "Track deliveries live"],
    href: "/company",
    Icon: Briefcase,
  },
  {
    key: "driver",
    title: "Driver",
    tagline: "Find jobs & get paid",
    points: ["Claim funded jobs", "Run routes with GPS", "Cash out in naira"],
    href: "/driver",
    Icon: Truck,
  },
];

/**
 * App entry point. Lets a person choose which experience to open — Company or
 * Driver — so each side feels like its own app. The choice is remembered so the
 * sign-up that follows lands them back on the same path; one account works for
 * both, and either app can switch to the other from its footer.
 */
export function RoleChooser() {
  const reduceMotion = useReducedMotion();

  function remember(role: RoleKey) {
    try {
      window.localStorage.setItem("emz.role", role);
    } catch {
      /* ignore storage errors */
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#f6f3ec",
        color: INK,
        display: "flex",
        flexDirection: "column",
        padding: "28px 20px calc(28px + env(safe-area-inset-bottom))",
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "env(safe-area-inset-top)" }}>
        <SiteLogo href={null} height={30} priority />
      </div>

      <div style={{ marginTop: 40 }}>
        <h1 style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif", fontSize: 30, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-.02em", margin: 0, textAlign: "center", textWrap: "balance" } as React.CSSProperties}>
          How will you use EasyMoveZone?
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: "#5f655c", margin: "12px auto 0", maxWidth: 360, textAlign: "center" }}>
          Pick your side to open the app. You can switch anytime — one login works for both.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 32 }}>
        {ROLES.map((r, i) => (
          <motion.div
            key={r.key}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={r.href}
              onClick={() => remember(r.key)}
              aria-label={`Continue as ${r.title}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "20px 18px",
                borderRadius: 22,
                border: `1px solid ${LINE}`,
                background: "#fff",
                textDecoration: "none",
                color: INK,
                boxShadow: "0 6px 20px rgba(27,35,30,.05)",
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background: "#fbeae0",
                  color: PRIMARY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <r.Icon size={26} strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 19, fontWeight: 800 }}>{r.title}</div>
                <div style={{ fontSize: 13.5, color: "#5f655c", marginTop: 2 }}>{r.tagline}</div>
                <div style={{ fontSize: 12, color: MUTE, marginTop: 8, lineHeight: 1.5 }}>
                  {r.points.join(" · ")}
                </div>
              </div>
              <ArrowRight size={20} color={PRIMARY} style={{ flexShrink: 0 }} />
            </Link>
          </motion.div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <p style={{ textAlign: "center", fontSize: 14, color: "#5f655c", margin: "28px 0 0" }}>
        Already have an account?{" "}
        <Link href="/auth" style={{ color: PRIMARY, fontWeight: 700, textDecoration: "none" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
