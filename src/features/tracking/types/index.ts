import { HabitCategory } from '@/features/habits/types'

export interface HabitCompletion {
  id: string
  habitId: string
  userId: string
  date: string // Format: YYYY-MM-DD in user's local timezone
  completed: boolean
  completedAt: string // ISO timestamp string
  goalValue: number
  notes?: string
  createdAt: string // ISO timestamp string
}

export interface UserProgressSummary {
  completedCount: number
  totalCount: number
  remainingCount: number
  progressPercentage: number
  currentActiveStreak: number
  longestActiveStreak: number
}

export interface ActivityLogItem {
  id: string
  habitId: string
  habitTitle: string
  completedAt: string // ISO timestamp string
  category: HabitCategory
  color: string
  icon: string
  action: 'completed' | 'uncompleted'
}
