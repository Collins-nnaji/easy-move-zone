"use client";

import { useMemo, useState, useTransition } from "react";

type Channel = "in_app" | "email" | "sms";

interface ThreadComposerProps {
  threadId: string;
  senderParticipantId: string | null;
  defaultChannel: Channel;
  toEmail: string | null;
  toPhone: string | null;
  aiContext: {
    relationshipType: "prospect" | "client";
    relationshipName: string;
    threadSummary: string;
  };
}

export function ThreadComposer(props: ThreadComposerProps) {
  const [channel, setChannel] = useState<Channel>(props.defaultChannel);
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("Follow-up");
  const [status, setStatus] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const canSend = useMemo(() => body.trim().length > 0 && !isPending, [body, isPending]);

  const sendMessage = async () => {
    setStatus("");
    const response = await fetch("/api/crm/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId: props.threadId,
        senderParticipantId: props.senderParticipantId,
        direction: "outbound",
        body,
        channel,
        subject,
        toEmail: props.toEmail,
        toPhone: props.toPhone,
      }),
    });

    const payload = (await response.json()) as { error?: string; providerResult?: { ok: boolean; error?: string } };
    if (!response.ok) {
      setStatus(payload.error ?? "Failed to send message.");
      return;
    }

    if (payload.providerResult && !payload.providerResult.ok && channel !== "in_app") {
      setStatus(`Saved message but external delivery failed: ${payload.providerResult.error ?? "Unknown error"}`);
    } else {
      setStatus("Message sent.");
    }
    setBody("");
    window.location.reload();
  };

  const draftWithAi = async () => {
    setStatus("");
    const response = await fetch("/api/crm/ai-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        relationshipType: props.aiContext.relationshipType,
        relationshipName: props.aiContext.relationshipName,
        threadSummary: props.aiContext.threadSummary,
        goal: "Move the conversation toward a concrete next step this week.",
      }),
    });
    const payload = (await response.json()) as { draft?: string; error?: string };
    if (!response.ok) {
      setStatus(payload.error ?? "Failed to generate draft.");
      return;
    }
    setBody(payload.draft ?? "");
    setStatus("AI draft added.");
  };

  return (
    <section className="emz-gloss-card rounded-2xl p-5">
      <h2 className="font-[var(--font-playfair)] text-3xl font-bold text-[#0f172a]">Reply</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm text-[#475569]">
          Channel
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value as Channel)}
            className="mt-1 w-full rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm"
          >
            <option value="in_app">In-app</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </label>
        <label className="text-sm text-[#475569] md:col-span-2">
          Subject
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="mt-3 block text-sm text-[#475569]">
        Message
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={5}
          className="mt-1 w-full rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-sm"
          placeholder="Write your reply..."
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => startTransition(draftWithAi)}
          className="rounded-xl border border-[#dbe4f0] bg-white px-4 py-2 text-sm font-semibold text-[#334155] hover:bg-[#f8fbff]"
          disabled={isPending}
        >
          AI Draft
        </button>
        <button
          type="button"
          onClick={() => startTransition(sendMessage)}
          className="rounded-xl bg-[#155eef] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
          disabled={!canSend}
        >
          Send message
        </button>
      </div>

      {status ? <p className="mt-3 text-sm text-[#475569]">{status}</p> : null}
    </section>
  );
}
