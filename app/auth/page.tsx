"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight, BadgeCheck, UserRound } from "lucide-react"
import { authClient } from "@/lib/auth/client"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

/* ── Social provider icons as inline SVG ────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

/* ── Auth page ───────────────────────────────────────────── */
type Mode = "sign-in" | "sign-up"

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/qualify"

  const [mode, setMode] = React.useState<Mode>("sign-in")
  const [email, setEmail] = React.useState("")
  const [name, setName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const { data: sessionData, refetch: refetchSession } = authClient.useSession()

  // If already signed in, redirect to intended destination
  React.useEffect(() => {
    if (sessionData?.user) router.replace(redirect)
  }, [sessionData?.user, redirect, router])

  const clearError = () => setError(null)

  /* ── Social sign-in ── */
  async function handleSocial(provider: "google") {
    setLoading(provider)
    setError(null)
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: redirect,
      })
      await refetchSession()
      router.refresh()
    } catch {
      setError(`Could not connect to ${provider}. Please try again.`)
      setLoading(null)
    }
  }

  /* ── Email/password ── */
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading("email")
    setError(null)
    try {
      if (mode === "sign-up") {
        await authClient.signUp.email({ email, password, name: name || email.split("@")[0], callbackURL: redirect })
      } else {
        await authClient.signIn.email({ email, password, callbackURL: redirect })
      }
      // Refetch session so Header and rest of app see signed-in state immediately
      await refetchSession()
      router.refresh()
      router.push(redirect)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Check your credentials."
      setError(msg)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden transition-shadow duration-300 hover:shadow-2xl">

          {/* Header strip */}
          <div className="bg-white border-b border-black/10 p-6 text-black text-center">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/emz.svg"
                alt="EasyMoveZone"
                width={140}
                height={50}
                className="h-10 w-auto mx-auto"
                priority
              />
            </Link>
            <h1 className="text-xl font-bold">
              {mode === "sign-in" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-black/70 text-xs mt-1">
              {mode === "sign-in"
                ? "Sign in to access your assessment and journey"
                : "Sign up to access your assessment and journey"}
            </p>
          </div>

          <div className="p-6 space-y-5">

            {/* Mode toggle */}
            <div className="flex bg-muted rounded-xl p-1 gap-1">
              {(["sign-in", "sign-up"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); clearError() }}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ease-out",
                    mode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "sign-in" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* Social providers */}
            <div className="space-y-2">
              <button
                onClick={() => handleSocial("google")}
                disabled={!!loading}
                className="w-full flex items-center justify-center gap-3 border-2 border-border rounded-xl py-2.5 px-4 text-sm font-medium hover:bg-muted hover:border-primary/30 transition-all duration-200 disabled:opacity-50"
              >
                <GoogleIcon />
                {loading === "google" ? "Connecting…" : "Continue with Google"}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] font-medium">or continue with email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {mode === "sign-up" && (
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-border bg-background text-sm focus:outline-none focus:border-primary input-focus-ring"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-border bg-background text-sm focus:outline-none focus:border-primary input-focus-ring"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-border bg-background text-sm focus:outline-none focus:border-primary input-focus-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={!!loading}
              >
                {loading === "email"
                  ? "Please wait…"
                  : mode === "sign-in" ? "Sign In" : "Create Account"}
                {loading !== "email" && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-1">
              {["FMBN Licensed", "PENCOM Registered", "Zero Upfront Fee"].map((t) => (
                <span key={t} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <BadgeCheck className="w-3 h-3 text-secondary" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center text-xs text-muted-foreground mt-5">
          <Link href="/" className="hover:text-primary transition-colors duration-200 underline underline-offset-2">
            ← Back to EasyMoveZone
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen pt-28 flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading…</div></div>}>
      <AuthPageContent />
    </React.Suspense>
  )
}
