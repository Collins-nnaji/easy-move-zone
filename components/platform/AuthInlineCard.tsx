"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { Shield, Sparkles, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react"
import { clsx } from "clsx"

type Mode = "sign-in" | "sign-up"

export function AuthInlineCard({
  redirectIfAuthenticated = false,
  hideWhenAuthenticated = false,
}: { redirectIfAuthenticated?: boolean; hideWhenAuthenticated?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirect") ?? "/visa/applications"
  const urlMode = searchParams.get("mode")
  const [mode, setMode] = useState<Mode>(urlMode === "signup" ? "sign-up" : "sign-in")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState<"email" | "google" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: sessionData, refetch: refetchSession } = authClient.useSession()

  useEffect(() => {
    if (redirectIfAuthenticated && sessionData?.user) {
      window.location.assign(redirectTarget)
    }
  }, [sessionData?.user, redirectTarget, redirectIfAuthenticated])

  if (hideWhenAuthenticated && sessionData?.user) return null

  async function handleEmail(event: FormEvent) {
    event.preventDefault()
    setLoading("email")
    setError(null)
    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
          callbackURL: redirectTarget,
        })
        if (result.error) throw new Error(result.error.message || "Sign up failed.")
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL: redirectTarget,
        })
        if (result.error) throw new Error(result.error.message || "Sign in failed.")
      }
      await refetchSession()
      router.refresh()
      const nextSession = await authClient.getSession()
      if (!nextSession.data?.user) {
        setError("Sign-in did not complete. Check your email and password.")
        return
      }
      window.location.assign(redirectTarget)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.")
    } finally {
      setLoading(null)
    }
  }

  async function handleGoogle() {
    setLoading("google")
    setError(null)
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: redirectTarget })
    } catch {
      setError("Google sign-in failed. Please try again.")
      setLoading(null)
    }
  }

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#090d16]/80 p-6 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5 sm:p-8 max-w-md mx-auto" id="account">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(21,94,239,0.15),transparent_60%)] rounded-3xl" />

      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {mode === "sign-up" ? "Create Account" : "Welcome Back"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {mode === "sign-up" ? "Join EasyMoveZone" : "Continue managing your move"}
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          <button
            type="button"
            className={clsx(
              "rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all",
              mode === "sign-up" ? "bg-white text-[#0f172a] shadow" : "text-slate-400 hover:text-white",
            )}
            onClick={() => setMode("sign-up")}
          >
            Register
          </button>
          <button
            type="button"
            className={clsx(
              "rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all",
              mode === "sign-in" ? "bg-white text-[#0f172a] shadow" : "text-slate-400 hover:text-white",
            )}
            onClick={() => setMode("sign-in")}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Google SSO */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.07] hover:border-white/20 disabled:opacity-50 shadow-sm"
      >
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span className="text-sm font-bold">Continue with Google</span>
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">OR EMAIL</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleEmail} className="space-y-4">
        {mode === "sign-up" && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-[#e0511f] focus:outline-none focus:ring-1 focus:ring-[#e0511f]"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-[#e0511f] focus:outline-none focus:ring-1 focus:ring-[#e0511f]"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Secure Password"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-[#e0511f] focus:outline-none focus:ring-1 focus:ring-[#e0511f]"
          />
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#e0511f] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e0511f]/25 transition hover:bg-[#c8451a] disabled:opacity-50"
        >
          {loading === "email" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
            </>
          ) : (
            <>
              {mode === "sign-up" ? "Create Account" : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
