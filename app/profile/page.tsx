import { redirect } from "next/navigation"
import { authServer } from "@/lib/auth/server"
import { neon } from "@neondatabase/serverless"
import { PublicShell } from "@/components/platform/PublicShell"
import Link from "next/link"
import { User, Building2, LogOut } from "lucide-react"
import { authClient } from "@/lib/auth/client" // We'll need a client component for logout in reality, so we'll use a Client wrapper or just regular form

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

export default async function ProfilePage() {
  const session = await authServer.getSession()
  if (!session?.data?.user) redirect("/auth?redirect=/profile")
  const { user } = session.data

  let userType = "individual"
  let profileData = null

  if (sql) {
    const userRows = await sql`SELECT user_type FROM users WHERE id = ${user.id}`
    if (userRows.length > 0 && userRows[0].user_type) {
      userType = userRows[0].user_type
    }

    if (userType === "corporate") {
      const corpRows = await sql`SELECT * FROM corporate_profiles WHERE user_id = ${user.id}`
      if (corpRows.length > 0) profileData = corpRows[0]
    } else {
      const indRows = await sql`SELECT * FROM individual_profiles WHERE user_id = ${user.id}`
      if (indRows.length > 0) profileData = indRows[0]
    }
  }

  const isCorporate = userType === "corporate"
  const displayName = user.name || user.email

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#0A0F1E] text-white py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${isCorporate ? "bg-[#D4A843]/10 text-[#D4A843]" : "bg-[#00D4FF]/10 text-[#00D4FF]"}`}>
              {isCorporate ? <Building2 size={32} /> : <User size={32} />}
            </div>
            <div>
              <h1 className="text-4xl font-[var(--font-playfair)] font-bold">{displayName}</h1>
              <p className="text-slate-400 font-medium tracking-widest text-xs uppercase mt-1">
                {isCorporate ? "Corporate Account" : "Individual Account"}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className={`md:col-span-2 bg-slate-900/50 border border-white/10 rounded-3xl p-8`}>
              <h2 className="text-2xl font-[var(--font-playfair)] font-bold mb-6">Account Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-slate-400">Email</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
                {isCorporate && profileData ? (
                  <>
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-slate-400">Company Name</span>
                      <span className="font-semibold">{profileData.company_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-slate-400">Employees</span>
                      <span className="font-semibold">{profileData.employee_count}</span>
                    </div>
                  </>
                ) : profileData ? (
                  <>
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-slate-400">Citizenship</span>
                      <span className="font-semibold">{profileData.citizenship}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-slate-400">Risk Appetite</span>
                      <span className="font-semibold">{profileData.risk_appetite}</span>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm">
                    Profile intake incomplete. Please <Link href={`/onboarding/${userType}`} className="underline">complete onboarding</Link>.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Link 
                href={isCorporate ? "/corp/dashboard" : "/app/dashboard"} 
                className={`block w-full py-4 px-6 rounded-xl font-bold text-[#0A0F1E] text-center transition-colors ${
                  isCorporate ? "bg-[#D4A843] hover:bg-[#D4A843]/90" : "bg-[#00D4FF] hover:bg-[#00D4FF]/90"
                }`}
              >
                Go to Dashboard
              </Link>
              <Link 
                href="/auth" 
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                 Manage Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  )
}
