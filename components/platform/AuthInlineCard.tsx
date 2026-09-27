"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react"
import { clsx } from "clsx"

type Mode = "sign-in" | "sign-up"

export function AuthInlineCard({
  redirectIfAuthenticated = false,
  hideWhenAuthenticated = false,
}: { redirectIfAuthenticated?: boolean; hideWhenAuthenticated?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requested = searchParams.get("redirect")
  const redirectTarget =
    requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/workspace"
  const urlMode = searchParams.get("mode")
  const [mode, setMode] = useState<Mode>(urlMode === "signup" ? "sign-up" : "sign-in")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState<"email" | "google" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const { data: sessionData, refetch: refetchSession } = authClient.useSession()

  useEffect(() => {
    if (!redirectIfAuthenticated || !sessionData?.user) return
    window.location.assign(redirectTarget)
  }, [sessionData?.user, redirectTarget, redirectIfAuthenticated])

  if (hideWhenAuthenticated && sessionData?.user) return null

  async function handleEmail(event: FormEvent) {
    event.preventDefault()
    setLoading("email")
    setError(null)
    setInfo(null)
    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
          callbackURL: redirectTarget,
        })
        if (result.error) throw new Error(result.error.message || "Sign up failed.")
        if (!result.data?.token) {
          setMode("sign-in")
          setInfo("Account created. Check your email to verify your address, then sign in.")
          return
        }
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
      const result = await authClient.signIn.social({ provider: "google", callbackURL: redirectTarget })
      if (result.error) {
        setError(result.error.message || "Google sign-in failed. Please try again.")
        setLoading(null)
      }
    } catch {
      setError("Google sign-in failed. Please try again.")
      setLoading(null)
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-[#e4dfd5] bg-white py-3.5 pl-11 pr-4 text-sm text-[#1b231e] placeholder:text-[#9aa097] outline-none focus:border-[#e0511f]"

  return (
    <div className="rounded-3xl border border-[#e4dfd5] bg-white p-6 shadow-sm sm:p-8" id="account">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold tracking-tight text-[#1b231e]">
            {mode === "sign-up" ? "Create account" : "Sign in"}
          </h3>
          <p className="mt-1 text-sm text-[#5f655c]">
            {mode === "sign-up" ? "Save your move abroad plan." : "Pick up where you left off."}
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-[#e4dfd5] bg-[#f6f3ec] p-1">
          <button
            type="button"
            className={clsx(
              "rounded-lg px-3.5 py-1.5 text-xs font-bold transition",
              mode === "sign-up" ? "bg-[#1b231e] text-white" : "text-[#5f655c] hover:text-[#1b231e]",
            )}
            onClick={() => { setMode("sign-up"); setError(null); setInfo(null) }}
          >
            Register
          </button>
          <button
            type="button"
            className={clsx(
              "rounded-lg px-3.5 py-1.5 text-xs font-bold transition",
              mode === "sign-in" ? "bg-[#1b231e] text-white" : "text-[#5f655c] hover:text-[#1b231e]",
            )}
            onClick={() => { setMode("sign-in"); setError(null); setInfo(null) }}
          >
            Sign in
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e4dfd5] bg-[#faf8f3] px-4 py-3.5 text-sm font-bold text-[#1b231e] transition hover:border-[#e0511f]/40 disabled:opacity-50"
      >
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#e4dfd5]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9aa097]">Or email</span>
        <div className="h-px flex-1 bg-[#e4dfd5]" />
      </div>

      <form onSubmit={handleEmail} className="space-y-3">
        {mode === "sign-up" && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa097]" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={fieldClass} />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa097]" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={fieldClass} />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa097]" />
          <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={fieldClass} />
        </div>

        {info && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">{info}</p>}
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">{error}</p>}

        <button
          type="submit"
          disabled={loading !== null}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e0511f] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e0511f]/25 transition hover:bg-[#c8451a] disabled:opacity-50"
        >
          {loading === "email" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Working…
            </>
          ) : (
            <>
              {mode === "sign-up" ? "Create account" : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
      <p className="mt-4 text-center text-[11px] leading-relaxed text-[#7c827a]">
        By continuing, you agree to our{" "}
        <Link href="/legal/terms" className="font-semibold text-[#4a5047] underline underline-offset-2">Terms of Service</Link> and{" "}
        <Link href="/legal/privacy" className="font-semibold text-[#4a5047] underline underline-offset-2">Privacy Policy</Link>.
      </p>
    </div>
  )
}
