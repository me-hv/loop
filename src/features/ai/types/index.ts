export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

export interface AIConversation {
  id: string
  userId: string
  title: string
  messages: AIChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface AISummary {
  id: string
  userId: string
  type: 'daily' | 'weekly' | 'monthly'
  date: string // YYYY-MM-DD or YYYY-[Week] or YYYY-MM
  content: string // raw text or JSON summary
  createdAt: string
}

export interface HabitHealthResult {
  score: number
  status: 'Excellent' | 'Good' | 'Needs Attention'
  consistency: number
  streak: number
}
