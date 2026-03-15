"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { Menu, X, Zap, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { authClient } from "@/lib/auth/client"

const TICKER_ITEMS = [
  "EasyMoveZone · AI-powered document support + tools platform · ",
  "Travel and relocation workflow for work, study, business, and global movement · ",
  "Start on landing page · Continue in EMZ Suite workspace · ",
]

function AnnouncementTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="w-full bg-white text-black py-1.5 overflow-hidden shrink-0 border-b border-black/10">
      <div className="flex gap-10 animate-ticker whitespace-nowrap" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} className="text-[11px] font-medium flex items-center gap-2 shrink-0 opacity-90">
            <span className="w-1.5 h-1.5 rounded-full bg-black/45 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

const NAV_LINKS = [
  { name: "Our Services", href: "/individual#services" },
]

export function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const pathname = usePathname()
  const { data: sessionData, isPending: sessionPending, refetch: refetchSession } = authClient.useSession()

  // Refetch session when route changes (e.g. after sign-in or OAuth redirect) so UI shows signed-in state
  React.useEffect(() => {
    const t = setTimeout(() => {
      refetchSession().then(() => router.refresh())
    }, 100)
    return () => clearTimeout(t)
  }, [pathname, refetchSession, router])

  // Refetch session on mount (after a short delay so cookies are set post-OAuth redirect)
  React.useEffect(() => {
    const t = setTimeout(() => refetchSession(), 200)
    return () => clearTimeout(t)
  }, [refetchSession])

  // Refetch when user returns to tab (e.g. after OAuth popup) so header shows logged-in state
  React.useEffect(() => {
    const onFocus = () => refetchSession()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refetchSession])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  async function handleSignOut() {
    setUserMenuOpen(false)
    setIsMenuOpen(false)
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  const user = sessionData?.user ?? null

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 z-50 w-full flex flex-col"
    >
      {/* Announcement ticker strip — always visible, solid primary */}
      <AnnouncementTicker />

      {/* Main nav bar */}
      <div className={cn(
        "w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-background/80 backdrop-blur-md border-b border-border/40"
      )}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-16">

            {/* Logo + tagline */}
            <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setIsMenuOpen(false)}>
              <Image
                src="/emz.svg"
                alt="EasyMoveZone"
                width={160}
                height={56}
                className="h-10 w-auto mix-blend-multiply dark:mix-blend-normal dark:brightness-110"
                priority
              />
              <span className="hidden sm:inline text-xs font-medium text-muted-foreground border-l border-border pl-2 ml-1">
                Migration Intelligence · Nigeria
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ease-out",
                    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"))
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA / User menu */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {sessionPending ? (
                <div className="h-9 w-20 bg-muted rounded-lg animate-pulse" aria-hidden />
              ) : user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm font-medium hover:bg-muted transition-all duration-200 ease-out"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", userMenuOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" aria-hidden onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border border-border bg-card shadow-lg py-1"
                        >
                          <Link
                            href="/app/dashboard"
                            className="block px-4 py-2 text-sm hover:bg-muted rounded-t-xl transition-colors duration-150"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            My Dashboard
                          </Link>
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-muted text-muted-foreground rounded-b-xl transition-colors duration-150"
                          >
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/auth">
                    <Button size="sm" variant="outline">Log in</Button>
                  </Link>
                  <Link href="/individual#services">
                    <Button size="sm" className="gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Explore Services
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 pb-5 pt-3 space-y-1">

              {NAV_LINKS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block rounded-xl px-3 py-2.5 text-base font-medium transition-all duration-200",
                    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"))
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 flex flex-col gap-2 border-t border-border mt-2">
                {user ? (
                  <>
                    <p className="text-xs text-muted-foreground px-1 truncate">{user.name || user.email}</p>
                    <Link href="/app/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">My Dashboard</Button>
                    </Link>
                    <button type="button" onClick={() => { setIsMenuOpen(false); handleSignOut(); }} className="w-full">
                      <Button variant="outline" className="w-full gap-2">
                        <LogOut className="w-4 h-4" /> Sign out
                      </Button>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Log in</Button>
                    </Link>
                    <Link href="/individual#services" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Explore Services
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
