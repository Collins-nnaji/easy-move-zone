"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth/client"

type Mode = "sign-in" | "sign-up"

export function AuthInlineCard({
  redirectIfAuthenticated = false,
  hideWhenAuthenticated = false,
}: { redirectIfAuthenticated?: boolean; hideWhenAuthenticated?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get("type") ?? "individual"
  const defaultRedirect = userType === "corporate" ? "/onboarding/corporate" : "/onboarding/individual"
  const redirectTarget = searchParams.get("redirect") ?? defaultRedirect
  const [mode, setMode] = useState<Mode>("sign-up")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState<"email" | "google" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: sessionData, refetch: refetchSession } = authClient.useSession()

  useEffect(() => {
    if (redirectIfAuthenticated && sessionData?.user) {
      router.push(redirectTarget)
    }
  }, [sessionData?.user, router, redirectTarget, redirectIfAuthenticated])

  if (hideWhenAuthenticated && sessionData?.user) {
    return null
  }

  async function handleEmail(event: FormEvent) {
    event.preventDefault()
    setLoading("email")
    setError(null)
    try {
      if (mode === "sign-up") {
        await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
          callbackURL: redirectTarget,
        })
      } else {
        await authClient.signIn.email({
          email,
          password,
          callbackURL: redirectTarget,
        })
      }
      await refetchSession()
      router.refresh()
      router.push(redirectTarget)
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
      await refetchSession()
      router.refresh()
    } catch {
      setError("Google sign-in failed. Please try again.")
      setLoading(null)
    }
  }

  return (
    <div className="emz-gloss-card rounded-2xl p-5 border border-white/10 bg-[#0A0F1E] text-white" id="account">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h3 className="font-[var(--font-playfair)] text-3xl font-bold">Account access</h3>
        <div className="inline-flex rounded-full border border-white/20 bg-white/5 p-1">
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-sm ${mode === "sign-up" ? (userType === "corporate" ? "bg-[#D4A843] text-[#0A0F1E] font-bold" : "bg-[#00D4FF] text-[#0A0F1E] font-bold") : "text-slate-400"}`}
            onClick={() => setMode("sign-up")}
          >
            Sign up
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-sm ${mode === "sign-in" ? (userType === "corporate" ? "bg-[#D4A843] text-[#0A0F1E] font-bold" : "bg-[#00D4FF] text-[#0A0F1E] font-bold") : "text-slate-400"}`}
            onClick={() => setMode("sign-in")}
          >
            Sign in
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-400 mb-4">
        {mode === "sign-up" 
          ? `Create a ${userType} account to get started with EasyMoveZone.` 
          : "Sign in to access your dashboard and tools."}
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="mt-4 w-full rounded-xl border border-[#c8d8f0] bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] transition hover:bg-[#f8fbff]"
      >
        {loading === "google" ? "Connecting..." : "Continue with Google"}
      </button>

      <form onSubmit={handleEmail} className="mt-3 space-y-3">
        {mode === "sign-up" ? (
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-[#c8d8f0] bg-white px-4 py-2.5 text-sm"
          />
        ) : null}
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="w-full rounded-xl border border-[#c8d8f0] bg-white px-4 py-2.5 text-sm"
        />
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-[#c8d8f0] bg-white px-4 py-2.5 text-sm"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading !== null}
          className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-[#0A0F1E] transition-colors ${
            userType === "corporate" ? "bg-[#D4A843] hover:bg-[#D4A843]/90" : "bg-[#00D4FF] hover:bg-[#00D4FF]/90"
          }`}
        >
          {loading === "email" ? "Please wait..." : mode === "sign-up" ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  )
}
