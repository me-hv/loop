import { HabitCategory } from '@/features/habits/types'

// Intensity levels for the heatmap (0 = no activity, 4 = 100% completion)
export type HeatmapIntensity = 0 | 1 | 2 | 3 | 4

// Per-day summary used to render calendar cells
export interface CalendarDayData {
  date: string // YYYY-MM-DD
  completedCount: number
  totalCount: number
  percentage: number // 0-100
  completionIds: string[]
  hasActivity: boolean
}

// One cell in the 365-day heatmap
export interface HeatmapCell {
  date: string // YYYY-MM-DD
  percentage: number // 0-100
  completedCount: number
  totalCount: number
  intensity: HeatmapIntensity
}

// Completed habit entry for day detail panel
export interface CompletedHabitEntry {
  habitId: string
  habitTitle: string
  category: HabitCategory
  color: string
  icon: string
  completedAt: string // ISO timestamp
  goalValue: number
  notes?: string
}

// Missed habit entry (scheduled but not completed)
export interface MissedHabitEntry {
  habitId: string
  habitTitle: string
  category: HabitCategory
  color: string
  icon: string
}

// Full day detail data used in the side panel
export interface DayDetailData {
  date: string // YYYY-MM-DD
  completed: CompletedHabitEntry[]
  missed: MissedHabitEntry[]
  completionPercentage: number
  totalScheduled: number
  totalCompleted: number
  // Placeholders for future phases
  journalEntry?: string | null
  mood?: string | null
  notes?: string | null
}

// Aggregate stats displayed above the calendar
export interface CalendarSummaryStats {
  totalCompletions: number
  currentStreak: number
  longestStreak: number
  overallPercentage: number
  bestMonth: string | null // "January 2025"
  mostActiveDay: string | null // "Monday"
}

// Calendar view mode
export type CalendarView = 'month' | 'week' | 'day'

// Active filter state
export interface CalendarFilters {
  categories: string[]
  difficulties: string[]
  showCompleted: boolean
  showMissed: boolean
  showArchived: boolean
  searchQuery: string
}

// Month history data returned by service
export interface MonthHistoryData {
  days: Record<string, CalendarDayData> // keyed by YYYY-MM-DD
  year: number
  month: number // 0-indexed
}

// Week history data
export interface WeekHistoryData {
  days: Record<string, CalendarDayData>
  startDate: string
  endDate: string
}
