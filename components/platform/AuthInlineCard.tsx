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
  const redirectTarget = searchParams.get("redirect") ?? "/dashboard"
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
      router.push(redirectTarget)
    }
  }, [sessionData?.user, router, redirectTarget, redirectIfAuthenticated])

  if (hideWhenAuthenticated && sessionData?.user) return null

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
    <div className="emz-rich-card p-6 sm:p-8" id="account">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[#0f172a]">
          {mode === "sign-up" ? "Create account" : "Welcome back"}
        </h3>
        <div className="inline-flex rounded-full border border-[#e2e8f0] bg-[#f8fafc] p-1">
          <button
            type="button"
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
              mode === "sign-up" ? "bg-[#155eef] text-white shadow-sm" : "text-[#64748b]"
            }`}
            onClick={() => setMode("sign-up")}
          >
            Sign up
          </button>
          <button
            type="button"
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
              mode === "sign-in" ? "bg-[#155eef] text-white shadow-sm" : "text-[#64748b]"
            }`}
            onClick={() => setMode("sign-in")}
          >
            Sign in
          </button>
        </div>
      </div>
      <p className="text-sm text-[#64748b] mb-5">
        {mode === "sign-up"
          ? "Create your account to save properties and track transactions."
          : "Sign in to access your dashboard and saved properties."}
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm font-medium text-[#0f172a] transition hover:bg-[#f8fafc] disabled:opacity-50"
      >
        {loading === "google" ? "Connecting..." : "Continue with Google"}
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#e2e8f0]" />
        <span className="text-xs text-[#94a3b8]">or</span>
        <div className="h-px flex-1 bg-[#e2e8f0]" />
      </div>

      <form onSubmit={handleEmail} className="space-y-3">
        {mode === "sign-up" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20"
          />
        )}
        <input
          required type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20"
        />
        <input
          required minLength={8} type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#155eef] focus:outline-none focus:ring-2 focus:ring-[#155eef]/20"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit" disabled={loading !== null}
          className="w-full rounded-xl bg-gradient-to-r from-[#155eef] to-[#1249d1] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-[#155eef]/20 transition hover:brightness-105 disabled:opacity-50"
        >
          {loading === "email" ? "Please wait..." : mode === "sign-up" ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  )
}
