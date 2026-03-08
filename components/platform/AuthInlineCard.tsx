"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth/client"

type Mode = "sign-in" | "sign-up"

export function AuthInlineCard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirect") ?? "/dashboard/client"
  const [mode, setMode] = useState<Mode>("sign-up")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState<"email" | "google" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: sessionData, refetch: refetchSession } = authClient.useSession()

  useEffect(() => {
    if (sessionData?.user) {
      router.push(redirectTarget)
    }
  }, [sessionData?.user, router, redirectTarget])

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
    <div className="rounded-2xl border border-black/10 bg-white p-5" id="account">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0d0d0d]">Account access</h3>
        <div className="inline-flex rounded-full border border-black/10 bg-[#ede8de] p-1">
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-sm ${mode === "sign-up" ? "bg-[#0d0d0d] text-[#f5f0e8]" : "text-[#6b6560]"}`}
            onClick={() => setMode("sign-up")}
          >
            Sign up
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-sm ${mode === "sign-in" ? "bg-[#0d0d0d] text-[#f5f0e8]" : "text-[#6b6560]"}`}
            onClick={() => setMode("sign-in")}
          >
            Sign in
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-[#6b6560]">
        Create your account to track deliverables and advisor updates inside the new client dashboard.
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="mt-4 w-full rounded-xl border border-black/15 bg-[#f5f0e8] px-4 py-2.5 text-sm font-medium text-[#0d0d0d]"
      >
        {loading === "google" ? "Connecting..." : "Continue with Google"}
      </button>

      <form onSubmit={handleEmail} className="mt-3 space-y-3">
        {mode === "sign-up" ? (
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm"
          />
        ) : null}
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm"
        />
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading !== null}
          className="w-full rounded-full bg-[#0d0d0d] px-4 py-2.5 text-sm font-medium text-[#f5f0e8] hover:bg-[#1a3a2a]"
        >
          {loading === "email" ? "Please wait..." : mode === "sign-up" ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  )
}
