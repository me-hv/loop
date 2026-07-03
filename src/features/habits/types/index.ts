export type HabitCategory =
  | 'Health'
  | 'Fitness'
  | 'Reading'
  | 'Coding'
  | 'Learning'
  | 'Meditation'
  | 'Finance'
  | 'Business'
  | 'Personal'
  | 'Custom'

export type HabitDifficulty = 'easy' | 'medium' | 'hard'

export type HabitFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Weekdays' | 'Weekends' | 'Custom'

export type GoalUnit = 'Times' | 'Minutes' | 'Hours' | 'Pages' | 'Kilometers' | 'Liters' | 'Custom'

export interface Habit {
  id: string
  userId: string
  title: string
  description?: string
  category: HabitCategory
  color: string // Presets (e.g. indigo, emerald, rose, etc.)
  icon: string // Lucide icon names
  frequency: HabitFrequency
  goal: number
  unit: GoalUnit
  difficulty: HabitDifficulty
  isArchived: boolean
  isDeleted: boolean
  notes?: string
  createdAt: string
  updatedAt: string
  currentStreak?: number
  longestStreak?: number
  totalCompletions?: number
  lastCompletedDate?: string | null
  completionPercentage?: number
}
