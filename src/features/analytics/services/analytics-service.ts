import {
  format,
  getDay,
  startOfYear,
  subDays,
  eachDayOfInterval,
  parseISO,
  startOfMonth,
} from 'date-fns'
import { Habit, HabitCategory } from '@/features/habits/types'
import { HabitCompletion } from '@/features/tracking/types'
import { calculateStreakFromDates, getLocalDateString } from '@/features/tracking/services/tracking-service'
import {
  AnalyticsTimeRange,
  AnalyticsSummary,
  HabitPerformanceItem,
  CategoryAnalyticsItem,
  ProgressInsight,
  WeekdayDataPoint,
  TrendDataPoint,
  ComparisonPeriodStats,
} from '../types'

// Checks if a habit is scheduled on a given day-of-week (0=Sun, 6=Sat)
export function isHabitScheduledOnDate(habit: Habit, date: Date): boolean {
  const createdDate = new Date(habit.createdAt.split('T')[0] + 'T00:00:00')
  const checkDate = new Date(format(date, 'yyyy-MM-dd') + 'T00:00:00')
  
  if (checkDate < createdDate) return false
  
  const dayOfWeek = getDay(date)
  if (habit.frequency === 'Daily') return true
  if (habit.frequency === 'Weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
  if (habit.frequency === 'Weekends') return dayOfWeek === 0 || dayOfWeek === 6
  return true
}

// Retrieves all Date objects in the chosen time range
export function getDaysForRange(timeRange: AnalyticsTimeRange, earliestHabitDateStr?: string): Date[] {
  const today = new Date()
  let start: Date
  
  switch (timeRange) {
    case '7d':
      start = subDays(today, 6)
      break
    case '30d':
      start = subDays(today, 29)
      break
    case '90d':
      start = subDays(today, 89)
      break
    case 'year':
      start = startOfYear(today)
      break
    case 'all':
      start = earliestHabitDateStr ? new Date(earliestHabitDateStr + 'T00:00:00') : subDays(today, 365)
      break
  }
  
  return eachDayOfInterval({ start, end: today })
}

// Utility to filter habits based on category, difficulty, archived status
function getFilteredHabits(
  habits: Habit[],
  categories?: string[],
  difficulties?: string[],
  showArchived?: boolean
): Habit[] {
  return habits.filter((h) => {
    if (h.isDeleted) return false
    if (!showArchived && h.isArchived) return false
    if (categories && categories.length > 0 && !categories.includes(h.category)) return false
    if (difficulties && difficulties.length > 0 && !difficulties.includes(h.difficulty.toLowerCase())) return false
    return true
  })
}

export const analyticsService = {
  // 1. Calculate overall summary statistics
  getAnalyticsSummary(
    habits: Habit[],
    completions: HabitCompletion[],
    timeRange: AnalyticsTimeRange,
    categories?: string[],
    difficulties?: string[],
    showArchived?: boolean
  ): AnalyticsSummary {
    const activeHabits = getFilteredHabits(habits, categories, difficulties, showArchived)
    
    // Earliest habit creation date
    const earliestHabitDate = habits.reduce((acc, h) => {
      const dateStr = h.createdAt.split('T')[0]
      return dateStr < acc ? dateStr : acc
    }, getLocalDateString())
    
    const rangeDays = getDaysForRange(timeRange, earliestHabitDate)
    const activeHabitIds = new Set(activeHabits.map((h) => h.id))
    
    let totalScheduledSlots = 0
    let totalCompletions = 0
    let perfectDaysCount = 0
    
    const completionsMap = new Map<string, Set<string>>() // date -> Set of completed habitIds
    completions.forEach((c) => {
      if (activeHabitIds.has(c.habitId)) {
        if (!completionsMap.has(c.date)) {
          completionsMap.set(c.date, new Set())
        }
        completionsMap.get(c.date)!.add(c.habitId)
      }
    })
    
    rangeDays.forEach((dateObj) => {
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const scheduledOnDay = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateObj))
      const dayCompletions = completionsMap.get(dateStr) || new Set()
      
      const dayScheduledCount = scheduledOnDay.length
      const dayCompletedCount = scheduledOnDay.filter((h) => dayCompletions.has(h.id)).length
      
      totalScheduledSlots += dayScheduledCount
      totalCompletions += dayCompletedCount
      
      if (dayScheduledCount > 0 && dayCompletedCount === dayScheduledCount) {
        perfectDaysCount++
      }
    })
    
    // Streak calculations on completions
    const allUniqueDates = Array.from(new Set(completions.filter(c => activeHabitIds.has(c.habitId)).map((c) => c.date))).sort()
    const todayStr = getLocalDateString()
    const { currentStreak, longestStreak } = calculateStreakFromDates(allUniqueDates, todayStr)
    
    const overallCompletionRate = totalScheduledSlots > 0 ? Math.round((totalCompletions / totalScheduledSlots) * 100) : 0
    const averageDailyCompletion = rangeDays.length > 0 ? parseFloat((totalCompletions / rangeDays.length).toFixed(1)) : 0
    
    // Current month progress
    const currentMonthStart = startOfMonth(new Date())
    const currentMonthDays = eachDayOfInterval({ start: currentMonthStart, end: new Date() })
    let currentMonthScheduled = 0
    let currentMonthCompleted = 0
    
    currentMonthDays.forEach((dateObj) => {
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const scheduledOnDay = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateObj))
      const dayCompletions = completionsMap.get(dateStr) || new Set()
      
      currentMonthScheduled += scheduledOnDay.length
      currentMonthCompleted += scheduledOnDay.filter((h) => dayCompletions.has(h.id)).length
    })
    
    const currentMonthProgress = currentMonthScheduled > 0 ? Math.round((currentMonthCompleted / currentMonthScheduled) * 100) : 0
    
    return {
      currentStreak,
      longestStreak,
      overallCompletionRate,
      totalCompletions,
      activeHabitsCount: activeHabits.length,
      perfectDaysCount,
      averageDailyCompletion,
      currentMonthProgress,
    }
  },

  // 2. Performance metrics for individual habits
  getHabitPerformance(
    habits: Habit[],
    completions: HabitCompletion[],
    categories?: string[],
    difficulties?: string[],
    showArchived?: boolean
  ): HabitPerformanceItem[] {
    const activeHabits = getFilteredHabits(habits, categories, difficulties, showArchived)
    const today = new Date()
    const todayStr = getLocalDateString()
    
    return activeHabits.map((habit) => {
      const habitCompletions = completions.filter((c) => c.habitId === habit.id)
      const completionDates = habitCompletions.map((c) => c.date)
      
      const createdDate = new Date(habit.createdAt.split('T')[0] + 'T00:00:00')
      const activeDays = eachDayOfInterval({ start: createdDate, end: today })
      const scheduledDays = activeDays.filter((d) => isHabitScheduledOnDate(habit, d))
      
      const totalScheduled = scheduledDays.length
      const totalCompleted = habitCompletions.length
      const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0
      
      const { currentStreak, longestStreak } = calculateStreakFromDates(completionDates, todayStr)
      const missedDays = Math.max(0, totalScheduled - totalCompleted)
      
      // Weekly and Monthly rates (past 7 days, past 30 days)
      const past7Days = eachDayOfInterval({ start: subDays(today, 6), end: today })
      const past7Scheduled = past7Days.filter((d) => isHabitScheduledOnDate(habit, d)).length
      const past7Completed = habitCompletions.filter((c) => parseISO(c.date) >= subDays(today, 6)).length
      const weeklyRate = past7Scheduled > 0 ? Math.round((past7Completed / past7Scheduled) * 100) : 0
      
      const past30Days = eachDayOfInterval({ start: subDays(today, 29), end: today })
      const past30Scheduled = past30Days.filter((d) => isHabitScheduledOnDate(habit, d)).length
      const past30Completed = habitCompletions.filter((c) => parseISO(c.date) >= subDays(today, 29)).length
      const monthlyRate = past30Scheduled > 0 ? Math.round((past30Completed / past30Scheduled) * 100) : 0
      
      // Trend calculation (weekly rate vs monthly rate)
      let trend: 'up' | 'down' | 'neutral' = 'neutral'
      if (weeklyRate > monthlyRate + 5) trend = 'up'
      else if (weeklyRate < monthlyRate - 5) trend = 'down'
      
      return {
        habitId: habit.id,
        habitTitle: habit.title,
        category: habit.category,
        color: habit.color,
        icon: habit.icon,
        difficulty: habit.difficulty,
        completionRate,
        currentStreak,
        longestStreak,
        totalCompletions: totalCompleted,
        missedDays,
        weeklyRate,
        monthlyRate,
        trend,
      }
    })
  },

  // 3. Category distribution analytics
  getCategoryStatistics(
    habits: Habit[],
    completions: HabitCompletion[],
    showArchived?: boolean
  ): CategoryAnalyticsItem[] {
    const activeHabits = getFilteredHabits(habits, undefined, undefined, showArchived)
    const categoryGroups = new Map<HabitCategory, { count: number; completions: number; scheduledSlots: number }>()
    const today = new Date()
    
    activeHabits.forEach((habit) => {
      const cat = habit.category
      if (!categoryGroups.has(cat)) {
        categoryGroups.set(cat, { count: 0, completions: 0, scheduledSlots: 0 })
      }
      
      const group = categoryGroups.get(cat)!
      group.count++
      
      const habitCompletions = completions.filter((c) => c.habitId === habit.id)
      group.completions += habitCompletions.length
      
      const createdDate = new Date(habit.createdAt.split('T')[0] + 'T00:00:00')
      const activeDays = eachDayOfInterval({ start: createdDate, end: today })
      group.scheduledSlots += activeDays.filter((d) => isHabitScheduledOnDate(habit, d)).length
    })
    
    const stats: CategoryAnalyticsItem[] = []
    categoryGroups.forEach((group, category) => {
      const completionRate = group.scheduledSlots > 0 ? Math.round((group.completions / group.scheduledSlots) * 100) : 0
      stats.push({
        category,
        completionRate,
        habitCount: group.count,
        totalCompletions: group.completions,
      })
    })
    
    return stats
  },

  // 4. Time period comparison logic (This Week vs Last Week etc.)
  getProgressComparison(
    habits: Habit[],
    completions: HabitCompletion[],
    categories?: string[],
    difficulties?: string[],
    showArchived?: boolean
  ): ComparisonPeriodStats[] {
    const activeHabits = getFilteredHabits(habits, categories, difficulties, showArchived)
    const activeHabitIds = new Set(activeHabits.map((h) => h.id))
    const today = new Date()
    
    const calculateRateForDates = (days: Date[]): number => {
      let scheduled = 0
      let completed = 0
      
      const completionsMap = new Set(
        completions
          .filter((c) => activeHabitIds.has(c.habitId))
          .map((c) => `${c.date}_${c.habitId}`)
      )
      
      days.forEach((dateObj) => {
        const dateStr = format(dateObj, 'yyyy-MM-dd')
        const scheduledOnDay = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateObj))
        
        scheduled += scheduledOnDay.length
        completed += scheduledOnDay.filter((h) => completionsMap.has(`${dateStr}_${h.id}`)).length
      })
      
      return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0
    }
    
    // A. Weekly Comparison
    const thisWeekDays = eachDayOfInterval({ start: subDays(today, 6), end: today })
    const lastWeekDays = eachDayOfInterval({ start: subDays(today, 13), end: subDays(today, 7) })
    const thisWeekRate = calculateRateForDates(thisWeekDays)
    const lastWeekRate = calculateRateForDates(lastWeekDays)
    const weeklyChange = thisWeekRate - lastWeekRate
    
    // B. Monthly Comparison
    const thisMonthDays = eachDayOfInterval({ start: subDays(today, 29), end: today })
    const lastMonthDays = eachDayOfInterval({ start: subDays(today, 59), end: subDays(today, 30) })
    const thisMonthRate = calculateRateForDates(thisMonthDays)
    const lastMonthRate = calculateRateForDates(lastMonthDays)
    const monthlyChange = thisMonthRate - lastMonthRate
    
    return [
      {
        label: 'This Week vs Last Week',
        currentVal: thisWeekRate,
        previousVal: lastWeekRate,
        changePercent: weeklyChange,
        isPositive: weeklyChange >= 0,
      },
      {
        label: 'This Month vs Last Month',
        currentVal: thisMonthRate,
        previousVal: lastMonthRate,
        changePercent: monthlyChange,
        isPositive: monthlyChange >= 0,
      },
    ]
  },

  // 5. Generate rule-based natural language insights
  getInsights(
    habits: Habit[],
    completions: HabitCompletion[],
    categories?: string[],
    difficulties?: string[],
    showArchived?: boolean
  ): ProgressInsight[] {
    const activeHabits = getFilteredHabits(habits, categories, difficulties, showArchived)
    const insights: ProgressInsight[] = []
    
    if (activeHabits.length === 0 || completions.length === 0) return []
    
    // Helper: Completion rates by habit
    const performance = this.getHabitPerformance(habits, completions, categories, difficulties, showArchived)
    
    // Insight 1: Strongest Habit
    const topHabit = [...performance].sort((a, b) => b.completionRate - a.completionRate)[0]
    if (topHabit && topHabit.completionRate >= 80 && topHabit.totalCompletions >= 3) {
      insights.push({
        id: 'strongest_habit',
        type: 'success',
        title: 'Outstanding Consistency',
        description: `You complete "${topHabit.habitTitle}" ${topHabit.completionRate}% of the time. You are maintaining an excellent routine!`,
        icon: 'Trophy',
      })
    }
    
    // Insight 2: Weekday activity patterns
    const weekdayCompletions = Array.from({ length: 7 }, () => 0)
    const weekdayScheduled = Array.from({ length: 7 }, () => 0)
    const dateCompletions = new Set(completions.map(c => `${c.date}_${c.habitId}`))
    
    // Calculate stats over the last 90 days
    const rangeDays = getDaysForRange('90d')
    rangeDays.forEach((dateObj) => {
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const dayOfWeek = getDay(dateObj) // 0-6
      
      activeHabits.forEach((h) => {
        if (isHabitScheduledOnDate(h, dateObj)) {
          weekdayScheduled[dayOfWeek]++
          if (dateCompletions.has(`${dateStr}_${h.id}`)) {
            weekdayCompletions[dayOfWeek]++
          }
        }
      })
    })
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    let bestDayIdx = -1
    let bestDayRate = 0
    let worstDayIdx = -1
    let worstDayRate = 100
    
    for (let i = 0; i < 7; i++) {
      if (weekdayScheduled[i] > 0) {
        const rate = (weekdayCompletions[i] / weekdayScheduled[i]) * 100
        if (rate > bestDayRate) {
          bestDayRate = rate
          bestDayIdx = i
        }
        if (rate < worstDayRate) {
          worstDayRate = rate
          worstDayIdx = i
        }
      }
    }
    
    if (bestDayIdx !== -1 && bestDayRate > 60) {
      insights.push({
        id: 'best_day',
        type: 'success',
        title: 'Weekly Power Day',
        description: `${dayNames[bestDayIdx]}s are your most productive days, with a ${Math.round(bestDayRate)}% completion rate.`,
        icon: 'Zap',
      })
    }

    if (worstDayIdx !== -1 && worstDayRate < 45 && weekdayScheduled[worstDayIdx] >= 3) {
      insights.push({
        id: 'worst_day',
        type: 'info',
        title: 'Weekly Slump Day',
        description: `${dayNames[worstDayIdx]}s are typically your slowest days, with a ${Math.round(worstDayRate)}% completion rate. Try setting a reminder for these days!`,
        icon: 'TrendingDown',
      })
    }
    
    // Insight 3: Weekend skip patterns
    // Check if there are habits completed on weekdays but skipped on weekends
    performance.forEach((hItem) => {
      const h = habits.find((hab) => hab.id === hItem.habitId)
      if (!h || h.frequency !== 'Daily') return
      
      let weekdayCount = 0
      let weekdayCompleted = 0
      let weekendCount = 0
      let weekendCompleted = 0
      
      rangeDays.forEach((dateObj) => {
        const dateStr = format(dateObj, 'yyyy-MM-dd')
        const dayOfWeek = getDay(dateObj)
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        
        if (isHabitScheduledOnDate(h, dateObj)) {
          if (isWeekend) {
            weekendCount++
            if (dateCompletions.has(`${dateStr}_${h.id}`)) {
              weekendCompleted++
            }
          } else {
            weekdayCount++
            if (dateCompletions.has(`${dateStr}_${h.id}`)) {
              weekdayCompleted++
            }
          }
        }
      })
      
      const wRate = weekdayCount > 0 ? (weekdayCompleted / weekdayCount) * 100 : 0
      const weRate = weekendCount > 0 ? (weekendCompleted / weekendCount) * 100 : 0
      
      if (wRate > 65 && weRate < 35 && weekendCount >= 3) {
        insights.push({
          id: `weekend_skip_${h.id}`,
          type: 'warning',
          title: 'Weekend Habit Drop',
          description: `You tend to skip "${h.title}" on weekends. Weekend rate is ${Math.round(weRate)}% compared to ${Math.round(wRate)}% during weekdays.`,
          icon: 'TrendingDown',
        })
      }
    })
    
    // Insight 4: Monthly progress comparisons
    const comparisons = this.getProgressComparison(habits, completions, categories, difficulties, showArchived)
    const monthComparison = comparisons[1]
    if (monthComparison && Math.abs(monthComparison.changePercent) >= 5) {
      const improved = monthComparison.changePercent > 0
      insights.push({
        id: 'monthly_trend',
        type: improved ? 'success' : 'info',
        title: improved ? 'Consistency Improving' : 'Consistency Warning',
        description: improved
          ? `Your consistency improved by ${Math.abs(monthComparison.changePercent)}% this month compared to the previous month. Great job!`
          : `Your consistency is down by ${Math.abs(monthComparison.changePercent)}% this month compared to last month. Try to close your loop today!`,
        icon: improved ? 'TrendingUp' : 'TrendingDown',
      })
    }
    
    // Default insight if none of the above are generated
    if (insights.length === 0) {
      insights.push({
        id: 'default_insight',
        type: 'info',
        title: 'Building Momentum',
        description: 'Consistent tracking is the key to creating permanent habits. Try completing your routines at the same time each day.',
        icon: 'Info',
      })
    }
    
    return insights.slice(0, 4) // cap at 4 insights
  },

  // 6. Format data for Recharts graphing
  getChartData(
    habits: Habit[],
    completions: HabitCompletion[],
    timeRange: AnalyticsTimeRange,
    categories?: string[],
    difficulties?: string[],
    showArchived?: boolean
  ): {
    weeklyTrend: TrendDataPoint[]
    categoryDistribution: { name: string; value: number }[]
    weekdayStats: WeekdayDataPoint[]
  } {
    const activeHabits = getFilteredHabits(habits, categories, difficulties, showArchived)
    const activeHabitIds = new Set(activeHabits.map((h) => h.id))
    
    const earliestHabitDate = habits.reduce((acc, h) => {
      const dateStr = h.createdAt.split('T')[0]
      return dateStr < acc ? dateStr : acc
    }, getLocalDateString())
    
    const rangeDays = getDaysForRange(timeRange, earliestHabitDate)
    
    // A. Weekly / Daily Completion Trend
    // If range is 7d or 30d, we plot day-by-day. If 90d, year, or all, we aggregate by week or month.
    const weeklyTrend: TrendDataPoint[] = []
    
    const completionsMap = new Set(
      completions
        .filter((c) => activeHabitIds.has(c.habitId))
        .map((c) => `${c.date}_${c.habitId}`)
    )
    
    rangeDays.forEach((dateObj) => {
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const scheduledOnDay = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateObj))
      
      const dayScheduled = scheduledOnDay.length
      const dayCompleted = scheduledOnDay.filter((h) => completionsMap.has(`${dateStr}_${h.id}`)).length
      const rate = dayScheduled > 0 ? Math.round((dayCompleted / dayScheduled) * 100) : 0
      
      weeklyTrend.push({
        date: dateStr,
        label: format(dateObj, timeRange === '7d' ? 'EEE' : 'MMM d'),
        completedCount: dayCompleted,
        rate,
      })
    })
    
    // B. Category distribution
    const categoryStats = this.getCategoryStatistics(habits, completions, showArchived)
    const categoryDistribution = categoryStats.map((item) => ({
      name: item.category,
      value: item.totalCompletions,
    }))
    
    // C. Weekday statistics
    const weekdayCompletions = Array.from({ length: 7 }, () => 0)
    const weekdayScheduled = Array.from({ length: 7 }, () => 0)
    
    rangeDays.forEach((dateObj) => {
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const dayOfWeek = getDay(dateObj)
      
      activeHabits.forEach((h) => {
        if (isHabitScheduledOnDate(h, dateObj)) {
          weekdayScheduled[dayOfWeek]++
          if (completionsMap.has(`${dateStr}_${h.id}`)) {
            weekdayCompletions[dayOfWeek]++
          }
        }
      })
    })
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekdayStats: WeekdayDataPoint[] = dayNames.map((name, i) => {
      const scheduled = weekdayScheduled[i]
      const completed = weekdayCompletions[i]
      return {
        dayName: name,
        completedCount: completed,
        totalCount: scheduled,
        rate: scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0,
      }
    })
    
    return {
      weeklyTrend,
      categoryDistribution,
      weekdayStats,
    }
  },
}
