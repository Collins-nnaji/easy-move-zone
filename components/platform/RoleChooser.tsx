"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Briefcase, Loader2, ShieldCheck, Truck } from "lucide-react";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { authClient } from "@/lib/auth/client";
import { easeOutExpo, softSpring } from "@/lib/motion/presets";

const PRIMARY = "#e0511f";
const INK = "#1b231e";
const MUTE = "#8a8f86";
const LINE = "#e4dfd5";
const DISPLAY = "var(--font-bricolage), system-ui, sans-serif";

type RoleKey = "company" | "driver";

const ROLES: Array<{
  key: RoleKey;
  title: string;
  tagline: string;
  points: string[];
  /** Marketing page, for visitors who aren't signed in yet. */
  href: string;
  /** App home, for a signed-in account that holds (or is adding) this role. */
  home: string;
  Icon: typeof Briefcase;
  /** Slide-in direction — cards enter from opposite edges toward centre. */
  from: -1 | 1;
}> = [
  {
    key: "company",
    title: "Company",
    tagline: "Post jobs & hire drivers",
    points: ["Post funded jobs", "Hire rated drivers", "Track deliveries live"],
    href: "/company",
    home: "/fleet/dashboard",
    Icon: Briefcase,
    from: -1,
  },
  {
    key: "driver",
    title: "Driver",
    tagline: "Find jobs & get paid",
    points: ["Claim funded jobs", "Run routes with GPS", "Cash out in naira"],
    href: "/driver",
    home: "/move/shifts",
    Icon: Truck,
    from: 1,
  },
];

/* --- Choreography -----------------------------------------------------------
 * Each element declares its own initial/animate pair with a staggered delay,
 * matching the fadeUp pattern the landing pages use. Deliberately NOT a
 * parent-variant container: variant propagation depends on the parent staying
 * in an animating state, which left children stuck at opacity:0 here.
 * Under prefers-reduced-motion these helpers return {} so nothing moves and
 * nothing is ever left hidden.
 * ------------------------------------------------------------------------- */

/** Fade + rise, for the header, trust line and footer. */
function riseIn(reduceMotion: boolean, delay = 0) {
  if (reduceMotion) return {};
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: easeOutExpo },
  } as const;
}

/** Slide in from an edge, for the role cards. */
function slideIn(reduceMotion: boolean, from: -1 | 1, delay = 0) {
  if (reduceMotion) return {};
  return {
    initial: { opacity: 0, x: 40 * from, scale: 0.97 },
    animate: { opacity: 1, x: 0, scale: 1 },
    transition: { ...softSpring, delay },
  } as const;
}

/**
 * App entry point. Lets a person choose which experience to open — Company or
 * Driver — so each side feels like its own app. The choice is remembered so the
 * sign-up that follows lands them back on the same path; one account works for
 * both, and switching between them happens in the account section (/profile).
 */
export function RoleChooser() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const signedIn = Boolean(sessionData?.user);

  const [pendingRole, setPendingRole] = useState<RoleKey | null>(null);
  const [hoveredRole, setHoveredRole] = useState<RoleKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  // requireRole() sends users here as /start?add=company&redirect=/fleet/post
  // when they open an app whose role they don't hold yet.
  const addRole = searchParams.get("add");
  const redirectTo = searchParams.get("redirect");

  function remember(role: RoleKey) {
    try {
      window.localStorage.setItem("emz.role", role);
    } catch {
      /* ignore storage errors */
    }
  }

  /**
   * Signed in: create the profile for this role, then enter the app.
   * Signed out: fall through to the marketing page (plain <Link> navigation),
   * where the CTA carries ?role= into /auth.
   */
  async function choose(role: RoleKey, home: string, event: React.MouseEvent) {
    remember(role);
    if (!signedIn) return; // let the Link navigate to /company or /driver

    event.preventDefault();
    setPendingRole(role);
    setError(null);
    try {
      const res = await fetch("/api/auth/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const payload = (await res.json().catch(() => ({}))) as { home?: string; error?: string };
      if (!res.ok) throw new Error(payload.error || "Could not open that app.");

      // Honour ?redirect= so an interrupted deep link resumes where it left off.
      const target = redirectTo && redirectTo.startsWith("/") ? redirectTo : payload.home ?? home;
      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open that app.");
      setPendingRole(null);
    }
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "#f6f3ec",
        color: INK,
        overflow: "hidden",
      }}
    >
      {/* Ambient warmth behind the content. Drifts slowly so the page feels
          alive without competing with the cards for attention. */}
      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: [0, 18, 0], y: [0, -14, 0] }}
            transition={{
              opacity: { duration: 1.1, ease: easeOutExpo },
              x: { duration: 17, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 21, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              position: "absolute",
              top: "-16%",
              left: "-24%",
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(224,81,31,.13), transparent 68%)",
              filter: "blur(26px)",
              pointerEvents: "none",
            }}
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: [0, -20, 0], y: [0, 16, 0] }}
            transition={{
              opacity: { duration: 1.1, ease: easeOutExpo },
              x: { duration: 23, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 19, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              position: "absolute",
              bottom: "-20%",
              right: "-22%",
              width: 460,
              height: 460,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(47,125,79,.10), transparent 68%)",
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />
        </>
      )}

      <div
        style={{
          position: "relative",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          padding: "28px 20px calc(28px + env(safe-area-inset-bottom))",
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduceMotion ? undefined : { duration: 0.6, ease: easeOutExpo }}
          style={{ display: "flex", justifyContent: "center", paddingTop: "env(safe-area-inset-top)" }}
        >
          <SiteLogo href={null} height={64} priority />
        </motion.div>

        <motion.div {...riseIn(!!reduceMotion, 0.07)} style={{ marginTop: 40 }}>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: 32,
              lineHeight: 1.08,
              fontWeight: 800,
              letterSpacing: "-.025em",
              margin: 0,
              textAlign: "center",
              textWrap: "balance",
            } as React.CSSProperties}
          >
            {addRole === "company"
              ? "Set up your company profile"
              : addRole === "driver"
                ? "Set up your driver profile"
                : "How will you use EasyMoveZone?"}
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              color: "#5f655c",
              margin: "12px auto 0",
              maxWidth: 380,
              textAlign: "center",
              textWrap: "pretty",
            } as React.CSSProperties}
          >
            {addRole
              ? "Your account doesn't have this profile yet. Adding it keeps the same login — you can switch between both anytime."
              : "Pick your side to open the app. You can switch anytime — one login works for both."}
          </p>
        </motion.div>

        {error && (
          <motion.p
            role="alert"
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={softSpring}
            style={{
              margin: "18px auto 0",
              maxWidth: 380,
              fontSize: 13,
              fontWeight: 600,
              color: "#b42318",
              background: "#fef3f2",
              border: "1px solid #fecdca",
              borderRadius: 12,
              padding: "10px 14px",
              textAlign: "center",
            }}
          >
            {error}
          </motion.p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 32 }}>
          {ROLES.map((r, i) => {
            const isPending = pendingRole === r.key;
            const isDimmed = pendingRole !== null && !isPending;
            return (
              <motion.div
                key={r.key}
                {...slideIn(!!reduceMotion, r.from, 0.14 + i * 0.08)}
                whileHover={reduceMotion || pendingRole ? undefined : { y: -3, scale: 1.012 }}
                whileTap={reduceMotion || pendingRole ? undefined : { scale: 0.985 }}
                onHoverStart={() => setHoveredRole(r.key)}
                onHoverEnd={() => setHoveredRole(null)}
                // Dimming lives on the inner Link, not here — an inline opacity
                // on this element would override the slide-in variant's own
                // opacity animation and the card would never become visible.
                style={{ borderRadius: 22 }}
              >
                <Link
                  href={signedIn ? r.home : r.href}
                  onClick={(e) => void choose(r.key, r.home, e)}
                  aria-label={`Continue as ${r.title}`}
                  aria-busy={isPending}
                  aria-disabled={pendingRole !== null}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "20px 18px",
                    borderRadius: 22,
                    border: `1px solid ${isPending ? PRIMARY : LINE}`,
                    background: "#fff",
                    textDecoration: "none",
                    color: INK,
                    overflow: "hidden",
                    boxShadow: isPending
                      ? "0 10px 30px rgba(224,81,31,.14)"
                      : "0 6px 20px rgba(27,35,30,.05)",
                    opacity: isDimmed ? 0.5 : 1,
                    pointerEvents: pendingRole !== null || sessionPending ? "none" : undefined,
                    transition: "border-color .2s ease, box-shadow .25s ease, opacity .2s ease",
                  }}
                >
                  {/* Indeterminate progress sweep while the profile is created. */}
                  {isPending && !reduceMotion && (
                    <motion.span
                      aria-hidden
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(90deg, transparent, ${PRIMARY}14, transparent)`,
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  <motion.div
                    animate={
                      hoveredRole === r.key && !reduceMotion && !pendingRole
                        ? { rotate: -6, scale: 1.06 }
                        : { rotate: 0, scale: 1 }
                    }
                    transition={softSpring}
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
                  </motion.div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, letterSpacing: "-.01em" }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 13.5, color: "#5f655c", marginTop: 2 }}>{r.tagline}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {r.points.map((p) => (
                        <span
                          key={p}
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: MUTE,
                            background: "#f7f5ef",
                            border: `1px solid ${LINE}`,
                            borderRadius: 999,
                            padding: "3px 9px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isPending ? (
                    <motion.span
                      animate={reduceMotion ? undefined : { rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ flexShrink: 0, display: "flex" }}
                    >
                      <Loader2 size={20} color={PRIMARY} />
                    </motion.span>
                  ) : (
                    <motion.span
                      aria-hidden
                      animate={hoveredRole === r.key && !reduceMotion ? { x: 4 } : { x: 0 }}
                      transition={softSpring}
                      style={{ flexShrink: 0, display: "flex" }}
                    >
                      <ArrowRight size={20} color={PRIMARY} />
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          {...riseIn(!!reduceMotion, 0.3)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            margin: "22px auto 0",
            fontSize: 12.5,
            color: MUTE,
          }}
        >
          <ShieldCheck size={14} color="#2f7d4f" />
          Every job is funded upfront before anyone drives
        </motion.div>

        <div style={{ flex: 1, minHeight: 24 }} />

        <motion.p
          {...riseIn(!!reduceMotion, 0.36)}
          style={{ textAlign: "center", fontSize: 14, color: "#5f655c", margin: "28px 0 0" }}
        >
          {signedIn ? (
            <>Signed in as {sessionData?.user?.email ?? "your account"}</>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/auth" style={{ color: PRIMARY, fontWeight: 700, textDecoration: "none" }}>
                Sign in
              </Link>
            </>
          )}
        </motion.p>
      </div>
    </div>
  );
}
