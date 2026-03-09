import { CrmDashboard } from "./CrmDashboard";
import { RelationshipTables } from "./RelationshipTables";
import { ThreadInbox } from "./ThreadInbox";
import type { Client, DashboardMetrics, Prospect, ThreadSummary } from "../types";

interface CrmWorkspaceProps {
  metrics: DashboardMetrics;
  prospects: Prospect[];
  clients: Client[];
  threads: ThreadSummary[];
  onOpenThread?: (threadId: string) => void;
}

export function CrmWorkspace({ metrics, prospects, clients, threads, onOpenThread }: CrmWorkspaceProps) {
  return (
    <main style={{ display: "grid", gap: 20 }}>
      <CrmDashboard metrics={metrics} />
      <RelationshipTables prospects={prospects} clients={clients} />
      <ThreadInbox threads={threads} onOpenThread={onOpenThread} />
    </main>
  );
}
