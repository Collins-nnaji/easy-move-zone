"use client"

import Link from "next/link"
import { BrandLogoLink } from "@/components/platform/BrandLogoLink"
import { useReloMobileNav } from "@/hooks/useReloMobileNav"
import { useState } from "react"
import { Home, MapPin, Users, Bot, User, Send, Heart, MessageCircle, UserPlus } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home",      icon: Home,   active: false },
  { href: "/explore",   label: "Explore",   icon: MapPin, active: false },
  { href: "/community", label: "Community", icon: Users,  active: true  },
  { href: "/ai",        label: "AI",        icon: Bot,    active: false },
  { href: "/profile",   label: "Profile",   icon: User,   active: false },
]

const groups = [
  { id: 1, name: "London → Manchester · May '26", members: 47, active: true, new: 3, desc: "Moving from London to Manchester this month. Housing tips, area recommendations, and meetups." },
  { id: 2, name: "Berlin Expats 2026",             members: 128, active: false, new: 0, desc: "Relocating to Berlin? Share visa tips, flat hunting and German bureaucracy survival guides." },
  { id: 3, name: "Chorlton Newcomers",             members: 34, active: false, new: 1, desc: "Already in Chorlton or heading there. Best cafés, local tips, and neighbour connections." },
]

const members = [
  { initial: "S", name: "Sara M.",   move: "LDN → MAN",  status: "moving in 3 weeks", joined: "2 days ago",   connected: false },
  { initial: "J", name: "Jamie L.",  move: "LDN → MAN",  status: "just arrived",       joined: "1 week ago",   connected: true  },
  { initial: "P", name: "Priya R.",  move: "BLR → MAN",  status: "veteran (2 yrs)",    joined: "2 years ago",  connected: true  },
  { initial: "T", name: "Tom K.",    move: "NYC → MAN",  status: "moving in 6 weeks",  joined: "5 days ago",   connected: false },
  { initial: "A", name: "Aisha O.",  move: "LGS → MAN",  status: "researching",        joined: "3 days ago",   connected: false },
  { initial: "M", name: "Mei W.",    move: "SHG → MAN",  status: "moved 1 month ago",  joined: "1 month ago",  connected: false },
]

const feed = [
  { author: "Jamie L.", time: "2h ago", text: "Just signed a flat in Chorlton! £980/mo for a 1 bed. Took 3 weeks of looking but so worth it. Happy to share landlord contacts.", likes: 8, replies: 4 },
  { author: "Sara M.",  time: "5h ago", text: "Anyone know which GP surgeries are taking new patients near the Northern Quarter? Need to register asap after move.", likes: 3, replies: 7 },
  { author: "Priya R.", time: "1d ago", text: "Tip: open your Monzo account before you move — it's the easiest UK bank to get as a newcomer with no credit history.", likes: 24, replies: 2 },
  { author: "Tom K.",   time: "2d ago", text: "The tram network is actually brilliant here. Chorlton to city centre = 18 mins door to door. Way better than I expected.", likes: 11, replies: 5 },
]

export function CommunityPage() {
  const { close: closeMobileNav, asideClassName, backdrop, menuButton } = useReloMobileNav()
  const [post, setPost] = useState("")
  const [activeGroup, setActiveGroup] = useState(0)
  const [likedPosts, setLikedPosts] = useState<number[]>([])

  return (
    <div className="relo-app-shell">
      {backdrop}
      {/* Sidebar */}
      <aside id="relo-app-sidebar" className={asideClassName}>
        <BrandLogoLink className="px-2 mb-6 sm:mb-8" />
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} onClick={closeMobileNav} className={`relo-sidebar-nav-item ${item.active ? "active" : ""}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Groups list */}
        <div className="mt-6 pt-6 border-t border-[#E4DFDA] sm:mt-8">
          <div className="text-[9px] font-bold tracking-widest text-[#A8A4A0] uppercase mb-3">Your groups</div>
          <div className="flex flex-col gap-1">
            {groups.map((g, i) => (
              <button
                type="button"
                key={g.id}
                onClick={() => {
                  setActiveGroup(i)
                  closeMobileNav()
                }}
                className={`text-left px-2 py-2 rounded-lg text-xs font-medium transition-colors ${activeGroup === i ? "bg-[rgba(232,92,45,0.1)] text-[#E85C2D]" : "text-[#6B6460] hover:bg-[#F0EDE8]"}`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 shrink-0" />
                  <span className="truncate">{g.name}</span>
                  {g.new > 0 && (
                    <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-[#E85C2D] text-white text-[9px] font-bold flex items-center justify-center">
                      {g.new}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="relo-main">
        <div className="relo-topbar shrink-0 min-h-[56px] h-auto flex-wrap gap-y-2 py-2 sm:min-h-[60px] sm:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {menuButton}
            <div className="min-w-0">
            <div className="text-sm font-bold text-[#1A1612] sm:text-base truncate">{groups[activeGroup].name}</div>
            <div className="text-[11px] text-[#6B6460] sm:text-xs">{groups[activeGroup].members} members</div>
            </div>
          </div>
          <button type="button" className="relo-btn-primary shrink-0 px-3 py-2 rounded-lg text-xs flex items-center gap-2 sm:px-4">
            <UserPlus className="h-3.5 w-3.5" /> Invite
          </button>
        </div>

        <div className="flex flex-1 min-h-0 flex-col xl:flex-row">
          {/* Feed */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Post composer */}
            <div className="p-4 border-b border-[#E4DFDA] bg-white">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E85C2D] text-white flex items-center justify-center text-sm font-bold shrink-0">A</div>
                <div className="flex-1 bg-[#F7F5F0] rounded-xl px-4 py-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={post}
                    onChange={(e) => setPost(e.target.value)}
                    placeholder="Share a tip, ask a question, or say hi..."
                    className="flex-1 bg-transparent text-sm text-[#1A1612] placeholder:text-[#A8A4A0] outline-none"
                  />
                  <button className="w-8 h-8 rounded-lg bg-[#E85C2D] flex items-center justify-center hover:bg-[#D44E22] transition-colors">
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="flex-1 overflow-y-auto">
              {feed.map((item, i) => (
                <div key={i} className="p-5 border-b border-[#E4DFDA] hover:bg-[#FAFAF8] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EDE9E4] flex items-center justify-center text-sm font-bold text-[#6B6460] shrink-0">
                      {item.author[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-semibold text-[#1A1612] text-sm">{item.author}</span>
                        <span className="text-xs text-[#A8A4A0]">{item.time}</span>
                      </div>
                      <p className="text-sm text-[#1A1612] leading-relaxed mb-3">{item.text}</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setLikedPosts((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i])}
                          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${likedPosts.includes(i) ? "text-[#E85C2D]" : "text-[#A8A4A0] hover:text-[#E85C2D]"}`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${likedPosts.includes(i) ? "fill-[#E85C2D]" : ""}`} />
                          {item.likes + (likedPosts.includes(i) ? 1 : 0)}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-[#A8A4A0] hover:text-[#1A1612] transition-colors">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {item.replies} replies
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members sidebar */}
          <div className="w-full shrink-0 overflow-y-auto border-t border-[#E4DFDA] bg-white xl:w-72 xl:border-l xl:border-t-0">
            <div className="p-4 border-b border-[#E4DFDA]">
              <div className="text-xs font-bold text-[#6B6460] uppercase tracking-wide mb-3">Members · {groups[activeGroup].members}</div>
              <div className="flex flex-col gap-3">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EDE9E4] flex items-center justify-center text-sm font-bold text-[#6B6460] shrink-0">
                      {m.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1A1612] truncate">{m.name}</div>
                      <div className="text-[10px] text-[#6B6460]">{m.move} · {m.status}</div>
                    </div>
                    {!m.connected && (
                      <button className="shrink-0 text-[10px] font-semibold text-[#E85C2D] hover:underline">
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4">
              <div className="text-xs font-bold text-[#6B6460] uppercase tracking-wide mb-3">Other groups</div>
              {[
                { name: "Manchester Newcomers", members: 312 },
                { name: "UK Housing Tips", members: 840 },
                { name: "Expat Money & Tax", members: 521 },
              ].map((g) => (
                <button key={g.name} className="w-full flex items-center justify-between py-2.5 text-left hover:bg-[#F7F5F0] rounded-lg px-2 transition-colors">
                  <span className="text-sm text-[#1A1612]">{g.name}</span>
                  <span className="text-[10px] text-[#A8A4A0]">{g.members}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
