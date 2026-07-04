import { HabitCategory, HabitDifficulty } from '@/features/habits/types'

export type AnalyticsTimeRange = '7d' | '30d' | '90d' | 'year' | 'all'

export interface AnalyticsSummary {
  currentStreak: number
  longestStreak: number
  overallCompletionRate: number
  totalCompletions: number
  activeHabitsCount: number
  perfectDaysCount: number
  averageDailyCompletion: number // average completed per day
  currentMonthProgress: number // % completion rate for current month
}

export interface HabitPerformanceItem {
  habitId: string
  habitTitle: string
  category: HabitCategory
  color: string
  icon: string
  difficulty: HabitDifficulty
  completionRate: number // 0 to 100
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  missedDays: number
  weeklyRate: number
  monthlyRate: number
  trend: 'up' | 'down' | 'neutral'
}

export interface CategoryAnalyticsItem {
  category: HabitCategory
  completionRate: number // 0 to 100
  habitCount: number
  totalCompletions: number
}

export interface ProgressInsight {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  description: string
  icon?: string
}

export interface WeekdayDataPoint {
  dayName: string // e.g. "Mon"
  completedCount: number
  totalCount: number
  rate: number // 0 to 100
}

export interface MonthlyDataPoint {
  monthName: string // e.g. "Jan"
  completedCount: number
  rate: number
}

export interface TrendDataPoint {
  date: string // e.g. "2026-07-01" or week start
  label: string // display label
  completedCount: number
  rate: number
}

export interface ComparisonPeriodStats {
  label: string // e.g. "This Week vs Last Week"
  currentVal: number
  previousVal: number
  changePercent: number // percentage difference
  isPositive: boolean
}
