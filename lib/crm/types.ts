export type CrmLifecycle = "new" | "qualified" | "proposal" | "won" | "lost" | "churned";
export type CrmChannel = "in_app" | "email" | "sms";

export interface CrmDashboardMetrics {
  openProspects: number;
  proposalsOut: number;
  activeClients: number;
  totalArrUsd: number;
  openTasks: number;
  unreadMessages: number;
}

export interface CrmProspect {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  source: string | null;
  lifecycle: CrmLifecycle;
  score: number;
  notes: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrmClient {
  id: string;
  companyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string | null;
  lifecycle: CrmLifecycle;
  arrUsd: number;
  renewalDate: string | null;
  notes: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrmThread {
  id: string;
  subject: string;
  channel: CrmChannel;
  status: "open" | "closed" | "archived";
  prospectId: string | null;
  clientId: string | null;
  relatedName: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface CrmParticipant {
  id: string;
  role: "internal" | "prospect" | "client";
  userId: string | null;
  displayName: string;
  email: string | null;
  phone: string | null;
}

export interface CrmMessage {
  id: string;
  threadId: string;
  direction: "inbound" | "outbound" | "internal_note";
  body: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  senderDisplayName: string;
}

export interface CrmThreadDetail {
  thread: CrmThread;
  participants: CrmParticipant[];
  messages: CrmMessage[];
}
