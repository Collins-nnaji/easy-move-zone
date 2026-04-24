"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { Sprout, Truck, Package, Eye, EyeOff, Loader2 } from "lucide-react"

type Mode = "sign-in" | "sign-up"
type AgroRole = "farmer" | "transporter" | "buyer"

const ROLE_OPTIONS: { value: AgroRole; label: string; description: string; icon: typeof Sprout }[] = [
  { value: "farmer", label: "Farmer", description: "I grow and sell produce", icon: Sprout },
  { value: "transporter", label: "Transporter", description: "I move cargo", icon: Truck },
  { value: "buyer", label: "Buyer", description: "I source produce", icon: Package },
]

export function AuthInlineCard({
  redirectIfAuthenticated = false,
  hideWhenAuthenticated = false,
}: {
  redirectIfAuthenticated?: boolean
  hideWhenAuthenticated?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirect") ?? "/dashboard"
  const urlMode = searchParams.get("mode")
  const urlRole = searchParams.get("role") as AgroRole | null

  const [mode, setMode] = useState<Mode>(urlMode === "signup" ? "sign-up" : "sign-in")
  const [agroRole, setAgroRole] = useState<AgroRole>(
    urlRole && ["farmer", "transporter", "buyer"].includes(urlRole) ? urlRole : "buyer"
  )
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState<"email" | "google" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: sessionData, refetch: refetchSession } = authClient.useSession()

  useEffect(() => {
    if (redirectIfAuthenticated && sessionData?.user) {
      router.push(redirectTarget)
    }
  }, [sessionData?.user, router, redirectTarget, redirectIfAuthenticated])

  if (hideWhenAuthenticated && sessionData?.user) return null

  async function createProfileRecord(userId: string) {
    try {
      await fetch("/api/auth/profile-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, agroRole }),
      })
    } catch {
      // Non-fatal — trigger will also handle this
    }
  }

  async function handleEmail(event: FormEvent) {
    event.preventDefault()
    setLoading("email")
    setError(null)
    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0],
          callbackURL: redirectTarget,
        })
        if (result?.data?.user?.id) {
          await createProfileRecord(result.data.user.id)
        }
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
      const msg = err instanceof Error ? err.message : "Authentication failed."
      setError(
        msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("credentials")
          ? "Incorrect email or password. Please try again."
          : msg.toLowerCase().includes("already")
          ? "An account with this email already exists. Sign in instead."
          : msg
      )
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      {/* Tab header */}
      <div className="flex border-b border-slate-100">
        {(["sign-up", "sign-in"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null) }}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
              mode === m
                ? "border-b-2 border-emerald-500 text-emerald-700 bg-emerald-50/50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {m === "sign-up" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {/* Role selector — sign-up only */}
        {mode === "sign-up" && (
          <div className="mb-5">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">I am a…</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAgroRole(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition ${
                    agroRole === value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 text-slate-600 hover:border-emerald-300"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${agroRole === value ? "text-emerald-600" : "text-slate-400"}`} strokeWidth={1.75} />
                  <span className="text-xs font-bold">{label}</span>
                  <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">{description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading !== null}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading === "google" ? "Connecting…" : "Continue with Google"}
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-xs font-medium text-slate-400">or with email</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          {mode === "sign-up" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or farm name"
                autoComplete="name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Email address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete={mode === "sign-up" ? "email" : "username"}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
            <div className="relative">
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "sign-up" ? "At least 8 characters" : "Your password"}
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-200 transition hover:from-emerald-500 hover:to-green-400 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading === "email" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Please wait…
              </>
            ) : mode === "sign-up" ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {mode === "sign-in" && (
          <p className="mt-4 text-center text-xs text-slate-400">
            No account yet?{" "}
            <button
              type="button"
              onClick={() => { setMode("sign-up"); setError(null) }}
              className="font-semibold text-emerald-600 hover:underline"
            >
              Create one free
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
