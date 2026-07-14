"use client"

import type { CommunityCategory, CommunityReply, CommunityTopic, NewTopicInput } from "@/lib/community/types"

/** Pull a human-readable error out of a failed JSON response, with a fallback. */
async function errorFrom(res: Response, fallback: string): Promise<Error> {
  if (res.status === 401) return new Error("unauthorized")
  try {
    const data = (await res.json()) as { error?: string }
    if (data.error) return new Error(data.error)
  } catch {
    // no JSON body — fall through
  }
  return new Error(fallback)
}

/** List community topics, newest first, optionally filtered by category. */
export async function fetchTopics(category?: CommunityCategory | "all"): Promise<CommunityTopic[]> {
  const qs = category && category !== "all" ? `?category=${category}` : ""
  const res = await fetch(`/api/community/topics${qs}`, { cache: "no-store" })
  if (!res.ok) return []
  return ((await res.json()) as { topics: CommunityTopic[] }).topics
}

/** Post a new discussion topic. */
export async function createTopic(input: NewTopicInput): Promise<CommunityTopic> {
  const res = await fetch("/api/community/topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw await errorFrom(res, "Couldn't post — try again.")
  return ((await res.json()) as { topic: CommunityTopic }).topic
}

/** Load a topic with its replies. */
export async function fetchTopic(id: string): Promise<{ topic: CommunityTopic; replies: CommunityReply[] } | null> {
  const res = await fetch(`/api/community/topics/${id}`, { cache: "no-store" })
  if (!res.ok) return null
  return (await res.json()) as { topic: CommunityTopic; replies: CommunityReply[] }
}

/** Post a reply to a topic. */
export async function createReply(topicId: string, body: string): Promise<CommunityReply> {
  const res = await fetch(`/api/community/topics/${topicId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  })
  if (!res.ok) throw await errorFrom(res, "Couldn't post your reply — try again.")
  return ((await res.json()) as { reply: CommunityReply }).reply
}

/** Ask the AI relocation assistant to post a grounded starting answer on a topic. */
export async function requestAiReply(topicId: string): Promise<CommunityReply> {
  const res = await fetch(`/api/community/topics/${topicId}/ai-reply`, { method: "POST" })
  if (!res.ok) throw await errorFrom(res, "Couldn't get an AI answer — try again in a moment.")
  return ((await res.json()) as { reply: CommunityReply }).reply
}

/** Flag a topic or reply for moderator review. */
export async function reportContent(targetType: "topic" | "reply", targetId: string, reason: string): Promise<void> {
  const res = await fetch("/api/community/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetType, targetId, reason }),
  })
  if (!res.ok) throw await errorFrom(res, "Couldn't submit the report — try again.")
}
