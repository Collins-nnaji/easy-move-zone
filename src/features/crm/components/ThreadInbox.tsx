import type { ThreadSummary } from "../types";

interface ThreadInboxProps {
  threads: ThreadSummary[];
  onOpenThread?: (threadId: string) => void;
}

export function ThreadInbox({ threads, onOpenThread }: ThreadInboxProps) {
  return (
    <section>
      <h3>Inbox</h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
        {threads.map((thread) => (
          <li
            key={thread.id}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, cursor: onOpenThread ? "pointer" : "default" }}
            onClick={() => onOpenThread?.(thread.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>{thread.subject}</strong>
              <span>{thread.channel}</span>
            </div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
              Status: {thread.status} | Unread: {thread.unreadCount}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
