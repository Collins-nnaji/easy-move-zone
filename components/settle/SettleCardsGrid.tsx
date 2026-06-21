import type { SettleCard } from "@/lib/relocate/types"

interface SettleCardsGridProps {
  cards: SettleCard[]
  variant?: "settle" | "move"
}

export function SettleCardsGrid({ cards, variant = "settle" }: SettleCardsGridProps) {
  if (cards.length === 0) {
    return (
      <p className={variant === "move" ? "text-sm text-[#6e746b]" : "text-sm text-[#64748b]"}>
        Settle essentials aren&apos;t available for this destination yet.
      </p>
    )
  }

  if (variant === "move") {
    return (
      <div className="move-settle-grid" style={{ marginTop: 22 }}>
        {cards.map((g) => (
          <div
            key={g.title}
            style={{
              background: "#fff",
              border: "1px solid #e4dfd5",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,.04)",
            }}
          >
            <div style={{ fontFamily: "var(--font-plex-mono), ui-monospace, monospace", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "#e0511f" }}>
              {g.tag}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.01em", margin: "10px 0 0" }}>{g.title}</h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "#5f655c", margin: "8px 0 0" }}>{g.body}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((g) => (
        <div key={g.title} className="rounded-2xl border border-[#e4dfd5] bg-white p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#e0511f]">{g.tag}</div>
          <h3 className="mt-2 text-base font-bold text-[#1b231e]">{g.title}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#5f655c]">{g.body}</p>
        </div>
      ))}
    </div>
  )
}
