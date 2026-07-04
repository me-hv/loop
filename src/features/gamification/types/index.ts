export interface UserLevelProgress {
  level: number
  currentXp: number
  xpToNextLevel: number
  progressPercent: number
  totalXp: number
}

export type AchievementCategory = 'Consistency' | 'Streaks' | 'Habits' | 'Journal' | 'Milestones'

export interface AchievementItem {
  id: string
  category: AchievementCategory
  title: string
  description: string
  progress: number
  target: number
  unlocked: boolean
  unlockedDate?: string // YYYY-MM-DD
  xpReward: number
}

export interface ChallengeItem {
  id: string
  title: string
  description: string
  progress: number
  target: number
  completed: boolean
  xpReward: number
  type: 'daily' | 'weekly'
}

export interface UserProgressDoc {
  userId: string
  lastSeenLevel: number
  seenAchievementIds: string[]
  updatedAt: string
}
