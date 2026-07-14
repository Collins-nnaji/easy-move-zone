"use client"

import type { CommunityCategory, CommunityReply, CommunityTopic, NewTopicInput } from "@/lib/community/types"

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
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
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
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { reply: CommunityReply }).reply
}

/** Ask the AI relocation assistant to post a grounded starting answer on a topic. */
export async function requestAiReply(topicId: string): Promise<CommunityReply> {
  const res = await fetch(`/api/community/topics/${topicId}/ai-reply`, { method: "POST" })
  if (res.status === 401) throw new Error("unauthorized")
  if (!res.ok) throw new Error("failed")
  return ((await res.json()) as { reply: CommunityReply }).reply
}
