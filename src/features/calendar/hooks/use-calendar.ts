import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, addMonths, subMonths, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { calendarService } from '../services/calendar-service'
import {
  CalendarView,
  CalendarFilters,
  MonthHistoryData,
  WeekHistoryData,
  DayDetailData,
  HeatmapCell,
  CalendarSummaryStats,
  CalendarDayData,
} from '../types'

const DEFAULT_FILTERS: CalendarFilters = {
  categories: [],
  difficulties: [],
  showCompleted: true,
  showMissed: true,
  showArchived: false,
  searchQuery: '',
}

// ─── 1. Calendar State Controller ────────────────────────────────────────────
export function useCalendar() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)
  const [view, setView] = useState<CalendarView>('month')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filters, setFilters] = useState<CalendarFilters>(DEFAULT_FILTERS)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const goToPrevMonth = useCallback(() => setCurrentDate((d) => subMonths(d, 1)), [])
  const goToNextMonth = useCallback(() => setCurrentDate((d) => addMonths(d, 1)), [])
  const goToPrevWeek = useCallback(() => setCurrentDate((d) => subWeeks(d, 1)), [])
  const goToNextWeek = useCallback(() => setCurrentDate((d) => addWeeks(d, 1)), [])
  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
  }, [])

  const selectDate = useCallback((date: string) => {
    setSelectedDate((prev) => (prev === date ? null : date))
  }, [])

  const clearSelection = useCallback(() => setSelectedDate(null), [])

  const updateFilters = useCallback((updates: Partial<CalendarFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 0 }), [currentDate])

  return {
    currentDate,
    year,
    month,
    view,
    setView,
    selectedDate,
    selectDate,
    clearSelection,
    filters,
    updateFilters,
    resetFilters,
    goToPrevMonth,
    goToNextMonth,
    goToPrevWeek,
    goToNextWeek,
    goToToday,
    weekStart,
  }
}

// ─── 2. Month History Query ───────────────────────────────────────────────────
export function useActivityHistory(
  userId: string | undefined,
  year: number,
  month: number,
  filters?: CalendarFilters
) {
  return useQuery<MonthHistoryData>({
    queryKey: ['calendar-month', userId, year, month],
    queryFn: () => calendarService.getMonthHistory(userId!, year, month),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => {
      if (!filters || isDefaultFilters(filters)) return data

      // Apply client-side filtering
      const filtered: Record<string, CalendarDayData> = {}
      for (const [date, day] of Object.entries(data.days)) {
        filtered[date] = day
      }
      return { ...data, days: filtered }
    },
  })
}

function isDefaultFilters(f: CalendarFilters): boolean {
  return (
    f.categories.length === 0 &&
    f.difficulties.length === 0 &&
    f.showCompleted &&
    f.showMissed &&
    !f.showArchived &&
    f.searchQuery === ''
  )
}

// ─── 3. Week History Query ────────────────────────────────────────────────────
export function useWeekHistory(userId: string | undefined, weekStart: Date) {
  return useQuery<WeekHistoryData>({
    queryKey: ['calendar-week', userId, format(weekStart, 'yyyy-MM-dd')],
    queryFn: () => calendarService.getWeekHistory(userId!, weekStart),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

// ─── 4. Day Detail Query ──────────────────────────────────────────────────────
export function useDayDetails(userId: string | undefined, date: string | null) {
  return useQuery<DayDetailData>({
    queryKey: ['calendar-day', userId, date],
    queryFn: () => calendarService.getDayHistory(userId!, date!),
    enabled: !!userId && !!date,
    staleTime: 60 * 1000, // 1 minute
  })
}

// ─── 5. Heatmap Query ─────────────────────────────────────────────────────────
export function useHeatmap(userId: string | undefined) {
  return useQuery<HeatmapCell[]>({
    queryKey: ['calendar-heatmap', userId],
    queryFn: () => calendarService.getHeatmapData(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// ─── 6. Calendar Summary Stats Query ─────────────────────────────────────────
export function useCalendarSummary(userId: string | undefined) {
  return useQuery<CalendarSummaryStats>({
    queryKey: ['calendar-summary', userId],
    queryFn: () => calendarService.getCalendarSummary(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
