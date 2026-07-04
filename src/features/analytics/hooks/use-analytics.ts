import { useMemo } from 'react'
import { useHabitsQuery } from '@/features/habits/hooks/use-habits'
import { useUserCompletions } from '@/features/tracking/hooks/use-tracking'
import { analyticsService } from '../services/analytics-service'
import { AnalyticsTimeRange } from '../types'

interface UseAnalyticsOptions {
  categories?: string[]
  difficulties?: string[]
  showArchived?: boolean
}

export function useAnalytics(
  userId: string | undefined,
  timeRange: AnalyticsTimeRange,
  options: UseAnalyticsOptions = {}
) {
  const { categories, difficulties, showArchived = false } = options

  const { data: habits = [], isLoading: habitsLoading, refetch: refetchHabits } = useHabitsQuery(userId)
  const { data: completions = [], isLoading: completionsLoading, refetch: refetchCompletions } = useUserCompletions(userId)

  const isLoading = habitsLoading || completionsLoading

  const refetch = async () => {
    await Promise.all([refetchHabits(), refetchCompletions()])
  }

  // 1. Memoized overall summary statistics
  const summary = useMemo(() => {
    if (isLoading || habits.length === 0) return null
    return analyticsService.getAnalyticsSummary(
      habits,
      completions,
      timeRange,
      categories,
      difficulties,
      showArchived
    )
  }, [habits, completions, timeRange, categories, difficulties, showArchived, isLoading])

  // 2. Memoized performance metrics for individual habits
  const habitPerformance = useMemo(() => {
    if (isLoading || habits.length === 0) return []
    return analyticsService.getHabitPerformance(
      habits,
      completions,
      categories,
      difficulties,
      showArchived
    )
  }, [habits, completions, categories, difficulties, showArchived, isLoading])

  // 3. Memoized category analytics
  const categoryAnalytics = useMemo(() => {
    if (isLoading || habits.length === 0) return []
    return analyticsService.getCategoryStatistics(habits, completions, showArchived)
  }, [habits, completions, showArchived, isLoading])

  // 4. Memoized rule-based natural language insights
  const progressInsights = useMemo(() => {
    if (isLoading || habits.length === 0 || completions.length === 0) return []
    return analyticsService.getInsights(
      habits,
      completions,
      categories,
      difficulties,
      showArchived
    )
  }, [habits, completions, categories, difficulties, showArchived, isLoading])

  // 5. Memoized period comparisons
  const comparisons = useMemo(() => {
    if (isLoading || habits.length === 0) return []
    return analyticsService.getProgressComparison(
      habits,
      completions,
      categories,
      difficulties,
      showArchived
    )
  }, [habits, completions, categories, difficulties, showArchived, isLoading])

  // 6. Memoized chart data formatting
  const chartData = useMemo(() => {
    if (isLoading || habits.length === 0) {
      return {
        weeklyTrend: [],
        categoryDistribution: [],
        weekdayStats: [],
      }
    }
    return analyticsService.getChartData(
      habits,
      completions,
      timeRange,
      categories,
      difficulties,
      showArchived
    )
  }, [habits, completions, timeRange, categories, difficulties, showArchived, isLoading])

  const hasData = useMemo(() => {
    return habits.some((h) => !h.isDeleted) && completions.length > 0
  }, [habits, completions])

  return {
    summary,
    habitPerformance,
    categoryAnalytics,
    progressInsights,
    comparisons,
    chartData,
    isLoading,
    hasData,
    refetch,
  }
}

// 7. Singular hooks for backwards compatibility or clean separations
export function useCompletionStats(userId: string | undefined, timeRange: AnalyticsTimeRange) {
  const { summary, isLoading } = useAnalytics(userId, timeRange)
  return { summary, isLoading }
}

export function useHabitPerformanceSelector(userId: string | undefined) {
  const { habitPerformance, isLoading } = useAnalytics(userId, '30d')
  return { habitPerformance, isLoading }
}

export function useCategoryAnalyticsSelector(userId: string | undefined) {
  const { categoryAnalytics, isLoading } = useAnalytics(userId, '30d')
  return { categoryAnalytics, isLoading }
}

export function useProgressInsightsSelector(userId: string | undefined) {
  const { progressInsights, isLoading } = useAnalytics(userId, '30d')
  return { progressInsights, isLoading }
}
