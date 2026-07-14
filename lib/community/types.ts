export type CommunityCategory = "work" | "study" | "visa" | "travel" | "settling" | "general"

export interface CommunityTopic {
  id: string
  authUserId: string
  authorName: string
  category: CommunityCategory
  title: string
  body: string
  replyCount: number
  createdAt: string
  updatedAt: string
}

export interface CommunityReply {
  id: string
  topicId: string
  authUserId: string
  authorName: string
  body: string
  isAi: boolean
  createdAt: string
}

export interface NewTopicInput {
  category: CommunityCategory
  title: string
  body: string
}
