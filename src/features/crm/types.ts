export type Lifecycle = "new" | "qualified" | "proposal" | "won" | "lost" | "churned";
export type Channel = "in_app" | "email" | "sms";
export type MessageDirection = "inbound" | "outbound" | "internal_note";
export type RoleKey = "admin" | "sales_manager" | "sales_rep" | "client";

export interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  source: string | null;
  lifecycle: Lifecycle;
  score: number;
  ownerUserId: string | null;
  notes: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  prospectId: string | null;
  companyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string | null;
  lifecycle: Lifecycle;
  ownerUserId: string | null;
  arrUsd: number;
  renewalDate: string | null;
  notes: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadSummary {
  id: string;
  subject: string;
  channel: Channel;
  status: "open" | "closed" | "archived";
  prospectId: string | null;
  clientId: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ThreadMessage {
  id: string;
  threadId: string;
  senderParticipantId: string | null;
  direction: MessageDirection;
  body: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  openProspects: number;
  proposalsOut: number;
  activeClients: number;
  totalArrUsd: number;
  openTasks: number;
  unreadMessages: number;
}
