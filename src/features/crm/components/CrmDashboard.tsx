import type { DashboardMetrics } from "../types";

interface CrmDashboardProps {
  metrics: DashboardMetrics;
}

export function CrmDashboard({ metrics }: CrmDashboardProps) {
  const cards: Array<{ label: string; value: string }> = [
    { label: "Open Prospects", value: String(metrics.openProspects) },
    { label: "Proposals Out", value: String(metrics.proposalsOut) },
    { label: "Active Clients", value: String(metrics.activeClients) },
    { label: "Open Tasks", value: String(metrics.openTasks) },
    { label: "Unread Messages", value: String(metrics.unreadMessages) },
    { label: "Total ARR", value: `$${metrics.totalArrUsd.toLocaleString()}` },
  ];

  return (
    <section>
      <h2>CRM Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {cards.map((card) => (
          <article key={card.label} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, color: "#666" }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{card.value}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
