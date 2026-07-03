'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { SlidersHorizontal, Activity } from 'lucide-react'
import { useAuthStore } from '@/store/use-auth-store'
import {
  useCalendar,
  useActivityHistory,
  useWeekHistory,
  useHeatmap,
  useDayDetails,
  useCalendarSummary,
} from '@/features/calendar/hooks/use-calendar'
import { useActivityLog } from '@/features/tracking/hooks/use-tracking'
import { CalendarHeader } from '@/features/calendar/components/CalendarHeader'
import { CalendarGrid } from '@/features/calendar/components/CalendarGrid'
import { WeekView } from '@/features/calendar/components/WeekView'
import { DayDetailPanel } from '@/features/calendar/components/DayDetailPanel'
import { HeatmapGrid } from '@/features/calendar/components/HeatmapGrid'
import { ActivityTimeline } from '@/features/calendar/components/ActivityTimeline'
import { CalendarSummary } from '@/features/calendar/components/CalendarSummary'
import { CalendarFiltersBar } from '@/features/calendar/components/CalendarFilters'
import { CalendarSearch } from '@/features/calendar/components/CalendarSearch'
import { EmptyCalendarState } from '@/features/calendar/components/EmptyCalendarState'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function CalendarPage() {
  const user = useAuthStore((s) => s.user)
  const [showFilters, setShowFilters] = useState(false)

  const {
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
  } = useCalendar()

  // Data queries
  const { data: monthData, isLoading: monthLoading } = useActivityHistory(user?.uid, year, month, filters)
  const { data: weekData, isLoading: weekLoading } = useWeekHistory(user?.uid, weekStart)
  const { data: heatmapData = [], isLoading: heatmapLoading } = useHeatmap(user?.uid)
  const { data: summaryStats, isLoading: summaryLoading } = useCalendarSummary(user?.uid)
  const { data: dayDetail, isLoading: dayLoading } = useDayDetails(user?.uid, selectedDate)
  const { activityLog: activities = [], isLoading: activityLoading } = useActivityLog(user?.uid)

  const days = view === 'month' ? (monthData?.days ?? {}) : (weekData?.days ?? {})
  const isGridLoading = view === 'month' ? monthLoading : weekLoading

  const hasAnyActivity = heatmapData.some((c) => c.completedCount > 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your habit history at a glance — {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>

        {/* Filter toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((p) => !p)}
          className={cn(
            'h-8 text-xs font-semibold gap-2 border-border/60 cursor-pointer',
            showFilters && 'bg-accent text-white border-accent hover:bg-accent/90'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </Button>
      </div>

      {/* Summary Stats */}
      <CalendarSummary stats={summaryStats} isLoading={summaryLoading} />

      {/* Filter Bar */}
      {showFilters && (
        <CalendarFiltersBar filters={filters} onUpdate={updateFilters} onReset={resetFilters} />
      )}

      {/* Main content area */}
      <div className={cn('flex gap-6', selectedDate ? 'lg:grid lg:grid-cols-[1fr_320px]' : '')}>
        {/* Left: Calendar */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Calendar Navigation Header */}
          <CalendarHeader
            currentDate={currentDate}
            view={view}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
            onPrevWeek={goToPrevWeek}
            onNextWeek={goToNextWeek}
            onGoToToday={goToToday}
            onViewChange={setView}
          />

          {/* Calendar Grid or Week View */}
          {!hasAnyActivity && !isGridLoading ? (
            <EmptyCalendarState />
          ) : view === 'month' ? (
            <CalendarGrid
              currentDate={currentDate}
              days={days}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
              isLoading={isGridLoading}
            />
          ) : (
            <WeekView
              weekStart={weekStart}
              days={days}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
              isLoading={isGridLoading}
            />
          )}

          {/* GitHub Heatmap */}
          <div className="rounded-xl border border-border/40 bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold text-foreground">Activity Heatmap</h2>
              <span className="text-[10px] text-muted-foreground/60 font-medium">— Last 365 days</span>
            </div>
            <HeatmapGrid cells={heatmapData} isLoading={heatmapLoading} />
          </div>

          {/* Activity Timeline + Search */}
          <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-foreground">Activity Timeline</h2>
              <span className="text-[10px] text-muted-foreground/60">Recent completions</span>
            </div>
            <CalendarSearch
              value={filters.searchQuery}
              onChange={(q) => updateFilters({ searchQuery: q })}
            />
            <ActivityTimeline
              activities={activities}
              isLoading={activityLoading}
              searchQuery={filters.searchQuery}
            />
          </div>
        </div>

        {/* Right: Day Detail Panel */}
        {selectedDate && (
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-0 h-[calc(100vh-160px)] rounded-xl border border-border/40 overflow-hidden">
              <DayDetailPanel
                date={selectedDate}
                data={dayDetail}
                isLoading={dayLoading}
                onClose={clearSelection}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Day Detail as bottom sheet */}
      {selectedDate && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 h-[70vh] rounded-t-2xl shadow-2xl border-t border-border overflow-hidden">
          <DayDetailPanel
            date={selectedDate}
            data={dayDetail}
            isLoading={dayLoading}
            onClose={clearSelection}
          />
        </div>
      )}
    </div>
  )
}
