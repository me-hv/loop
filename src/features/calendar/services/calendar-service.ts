import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  subDays,
  eachDayOfInterval,
  getDay,
} from 'date-fns'
import { firebaseDb } from '@/lib/firebase/client'
import { habitsService } from '@/features/habits/services/habits-service'
import { HabitCompletion } from '@/features/tracking/types'
import { getLocalDateString } from '@/features/tracking/services/tracking-service'
import {
  CalendarDayData,
  DayDetailData,
  HeatmapCell,
  HeatmapIntensity,
  MonthHistoryData,
  WeekHistoryData,
  CompletedHabitEntry,
  MissedHabitEntry,
  CalendarSummaryStats,
} from '../types'
import { Habit } from '@/features/habits/types'

function isInitialized(): boolean {
  return !!firebaseDb
}

// Maps a percentage (0–100) to heatmap intensity (0–4)
function toHeatmapIntensity(percentage: number): HeatmapIntensity {
  if (percentage === 0) return 0
  if (percentage <= 25) return 1
  if (percentage <= 50) return 2
  if (percentage <= 75) return 3
  return 4
}

// Checks if a habit is scheduled on a given day-of-week (0=Sun…6=Sat)
function isHabitScheduledOnDay(habit: Habit, dayOfWeek: number): boolean {
  const { frequency } = habit
  if (frequency === 'Daily') return true
  if (frequency === 'Weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
  if (frequency === 'Weekends') return dayOfWeek === 0 || dayOfWeek === 6
  // Weekly, Monthly, Custom — visible every day
  return true
}

// Fetches all user habits (non-deleted)
async function fetchUserHabits(userId: string): Promise<Habit[]> {
  return habitsService.getHabits(userId)
}

// Fetches completions for a date range (inclusive)
async function fetchCompletionsInRange(
  userId: string,
  startDateStr: string,
  endDateStr: string
): Promise<HabitCompletion[]> {
  if (!isInitialized()) return []

  const q = query(
    collection(firebaseDb!, 'habitCompletions'),
    where('userId', '==', userId),
    where('date', '>=', startDateStr),
    where('date', '<=', endDateStr)
  )

  const snapshot = await getDocs(q)
  const list: HabitCompletion[] = []
  snapshot.forEach((docSnap) => {
    list.push({ id: docSnap.id, ...docSnap.data() } as HabitCompletion)
  })
  return list
}

// Fetches journal dates for a date range
async function fetchJournalsInRange(
  userId: string,
  startDateStr: string,
  endDateStr: string
): Promise<string[]> {
  if (!isInitialized()) return []

  const q = query(
    collection(firebaseDb!, 'journals'),
    where('userId', '==', userId),
    where('date', '>=', startDateStr),
    where('date', '<=', endDateStr)
  )

  const snapshot = await getDocs(q)
  const list: string[] = []
  snapshot.forEach((docSnap) => {
    const data = docSnap.data()
    if (data.date) {
      list.push(data.date)
    }
  })
  return list
}

// Builds CalendarDayData records from habits + completions for a list of date strings
function buildDayDataMap(
  dateStrings: string[],
  habits: Habit[],
  completions: HabitCompletion[],
  journalDates?: Set<string>
): Record<string, CalendarDayData> {
  const map: Record<string, CalendarDayData> = {}

  for (const dateStr of dateStrings) {
    const dateObj = new Date(dateStr + 'T00:00:00')
    const dayOfWeek = getDay(dateObj)

    const scheduledHabits = habits.filter(
      (h) => !h.isArchived && !h.isDeleted && isHabitScheduledOnDay(h, dayOfWeek)
    )

    const dayCompletions = completions.filter((c) => c.date === dateStr)
    const completedHabitIds = new Set(dayCompletions.map((c) => c.habitId))

    const totalCount = scheduledHabits.length
    const completedCount = scheduledHabits.filter((h) => completedHabitIds.has(h.id)).length
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    map[dateStr] = {
      date: dateStr,
      completedCount,
      totalCount,
      percentage,
      completionIds: dayCompletions.map((c) => c.id),
      hasActivity: dayCompletions.length > 0,
      hasJournal: journalDates ? journalDates.has(dateStr) : false,
    }
  }

  return map
}

export const calendarService = {
  // 1. Load all completions + habits for a given month
  async getMonthHistory(userId: string, year: number, month: number): Promise<MonthHistoryData> {
    const firstDay = startOfMonth(new Date(year, month, 1))
    const lastDay = endOfMonth(firstDay)
    const startDateStr = format(firstDay, 'yyyy-MM-dd')
    const endDateStr = format(lastDay, 'yyyy-MM-dd')

    const [habits, completions, journals] = await Promise.all([
      fetchUserHabits(userId),
      fetchCompletionsInRange(userId, startDateStr, endDateStr),
      fetchJournalsInRange(userId, startDateStr, endDateStr),
    ])

    const journalDates = new Set(journals)

    const allDays = eachDayOfInterval({ start: firstDay, end: lastDay }).map((d) =>
      format(d, 'yyyy-MM-dd')
    )

    const days = buildDayDataMap(allDays, habits, completions, journalDates)
    return { days, year, month }
  },

  // 2. Load completions for a 7-day week window starting from startDate
  async getWeekHistory(userId: string, startDate: Date): Promise<WeekHistoryData> {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(startDate, { weekStartsOn: 0 })
    const startDateStr = format(weekStart, 'yyyy-MM-dd')
    const endDateStr = format(weekEnd, 'yyyy-MM-dd')

    const [habits, completions, journals] = await Promise.all([
      fetchUserHabits(userId),
      fetchCompletionsInRange(userId, startDateStr, endDateStr),
      fetchJournalsInRange(userId, startDateStr, endDateStr),
    ])

    const journalDates = new Set(journals)

    const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd }).map((d) =>
      format(d, 'yyyy-MM-dd')
    )

    const days = buildDayDataMap(allDays, habits, completions, journalDates)
    return { days, startDate: startDateStr, endDate: endDateStr }
  },

  // 3. Load completions for a single day + full habit list for context
  async getDayHistory(userId: string, date: string): Promise<DayDetailData> {
    const dateObj = new Date(date + 'T00:00:00')
    const dayOfWeek = getDay(dateObj)
    const journalDocId = `${userId}_${date}`

    const [habits, completions, journalSnap] = await Promise.all([
      fetchUserHabits(userId),
      fetchCompletionsInRange(userId, date, date),
      getDoc(doc(firebaseDb!, 'journals', journalDocId)),
    ])

    const journalData = journalSnap.exists() ? journalSnap.data() : null

    const scheduledHabits = habits.filter(
      (h) => !h.isDeleted && isHabitScheduledOnDay(h, dayOfWeek)
    )

    const completedHabitIds = new Set(completions.map((c) => c.habitId))

    const completed: CompletedHabitEntry[] = completions
      .map((comp) => {
        const habit = habits.find((h) => h.id === comp.habitId)
        if (!habit) return null
        return {
          habitId: habit.id,
          habitTitle: habit.title,
          category: habit.category,
          color: habit.color,
          icon: habit.icon,
          completedAt: comp.completedAt,
          goalValue: comp.goalValue,
          notes: comp.notes,
        } as CompletedHabitEntry
      })
      .filter(Boolean) as CompletedHabitEntry[]

    const missed: MissedHabitEntry[] = scheduledHabits
      .filter((h) => !completedHabitIds.has(h.id) && !h.isArchived)
      .map((h) => ({
        habitId: h.id,
        habitTitle: h.title,
        category: h.category,
        color: h.color,
        icon: h.icon,
      }))

    const totalScheduled = scheduledHabits.filter((h) => !h.isArchived).length
    const totalCompleted = completed.length
    const completionPercentage =
      totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0

    return {
      date,
      completed,
      missed,
      completionPercentage,
      totalScheduled,
      totalCompleted,
      journalEntry: journalData ? journalData.notes : null,
      mood: journalData ? journalData.mood : null,
      notes: journalData ? journalData.tomorrowFocus : null,
    }
  },

  // 4. Load 365 days of data for the heatmap
  async getHeatmapData(userId: string): Promise<HeatmapCell[]> {
    const today = new Date()
    const todayStr = getLocalDateString(today)
    const startDate = subDays(today, 364)
    const startDateStr = format(startDate, 'yyyy-MM-dd')

    const [habits, completions] = await Promise.all([
      fetchUserHabits(userId),
      fetchCompletionsInRange(userId, startDateStr, todayStr),
    ])

    const allDays = eachDayOfInterval({ start: startDate, end: today }).map((d) =>
      format(d, 'yyyy-MM-dd')
    )

    const dayMap = buildDayDataMap(allDays, habits, completions)

    return allDays.map((dateStr) => {
      const day = dayMap[dateStr]
      return {
        date: dateStr,
        percentage: day?.percentage ?? 0,
        completedCount: day?.completedCount ?? 0,
        totalCount: day?.totalCount ?? 0,
        intensity: toHeatmapIntensity(day?.percentage ?? 0),
      }
    })
  },

  // 5. Compute aggregate summary stats for the calendar header
  async getCalendarSummary(userId: string): Promise<CalendarSummaryStats> {
    if (!isInitialized()) {
      return {
        totalCompletions: 0,
        currentStreak: 0,
        longestStreak: 0,
        overallPercentage: 0,
        bestMonth: null,
        mostActiveDay: null,
      }
    }

    const todayStr = getLocalDateString()
    const q = query(
      collection(firebaseDb!, 'habitCompletions'),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)
    const completions: HabitCompletion[] = []
    snapshot.forEach((docSnap) => {
      completions.push({ id: docSnap.id, ...docSnap.data() } as HabitCompletion)
    })

    const totalCompletions = completions.length

    // Current & Longest streak across unique activity days
    const uniqueDates = Array.from(new Set(completions.map((c) => c.date))).sort()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let prevDate: string | null = null

    for (const d of uniqueDates) {
      if (!prevDate) {
        tempStreak = 1
      } else {
        const diff = Math.round(
          (new Date(d + 'T00:00:00').getTime() - new Date(prevDate + 'T00:00:00').getTime()) /
            86400000
        )
        tempStreak = diff === 1 ? tempStreak + 1 : 1
      }
      longestStreak = Math.max(longestStreak, tempStreak)
      prevDate = d
    }

    // Determine if today/yesterday anchors current streak
    const hasToday = uniqueDates.includes(todayStr)
    const yesterdayStr = format(subDays(new Date(todayStr + 'T00:00:00'), 1), 'yyyy-MM-dd')
    const hasYesterday = uniqueDates.includes(yesterdayStr)

    if (hasToday || hasYesterday) {
      let check = hasToday ? todayStr : yesterdayStr
      while (uniqueDates.includes(check)) {
        currentStreak++
        check = format(subDays(new Date(check + 'T00:00:00'), 1), 'yyyy-MM-dd')
      }
    }

    // Best month (most completions)
    const monthCounts: Record<string, number> = {}
    for (const c of completions) {
      const key = c.date.substring(0, 7) // YYYY-MM
      monthCounts[key] = (monthCounts[key] ?? 0) + 1
    }
    let bestMonthKey: string | null = null
    let bestMonthCount = 0
    for (const [key, count] of Object.entries(monthCounts)) {
      if (count > bestMonthCount) {
        bestMonthCount = count
        bestMonthKey = key
      }
    }
    const bestMonth = bestMonthKey
      ? format(new Date(bestMonthKey + '-01'), 'MMMM yyyy')
      : null

    // Most active day of week
    const dayCounts: Record<number, number> = {}
    for (const c of completions) {
      const dow = getDay(new Date(c.date + 'T00:00:00'))
      dayCounts[dow] = (dayCounts[dow] ?? 0) + 1
    }
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    let bestDow: number | null = null
    let bestDowCount = 0
    for (const [dow, count] of Object.entries(dayCounts)) {
      if (count > bestDowCount) {
        bestDowCount = count
        bestDow = parseInt(dow)
      }
    }
    const mostActiveDay = bestDow !== null ? dayNames[bestDow] : null

    // Overall % — completions / total scheduled days across habit lifetimes
    const habits = await fetchUserHabits(userId)
    let totalScheduledSlots = 0
    const today0 = new Date(todayStr + 'T00:00:00')
    for (const h of habits) {
      if (h.isDeleted) continue
      const createdDate = new Date(h.createdAt.split('T')[0] + 'T00:00:00')
      const days = Math.max(
        1,
        Math.round((today0.getTime() - createdDate.getTime()) / 86400000) + 1
      )
      totalScheduledSlots += days
    }
    const overallPercentage =
      totalScheduledSlots > 0
        ? Math.min(100, Math.round((totalCompletions / totalScheduledSlots) * 100))
        : 0

    return {
      totalCompletions,
      currentStreak,
      longestStreak,
      overallPercentage,
      bestMonth,
      mostActiveDay,
    }
  },
}
