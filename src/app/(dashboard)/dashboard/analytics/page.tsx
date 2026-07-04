'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useAnalytics } from '@/features/analytics/hooks/use-analytics'
import { SummaryCards } from '@/features/analytics/components/SummaryCards'
import { Charts } from '@/features/analytics/components/Charts'
import { HabitPerformanceTable } from '@/features/analytics/components/HabitPerformanceTable'
import { InsightCards } from '@/features/analytics/components/InsightCards'
import { ExportDialog } from '@/features/analytics/components/ExportDialog'
import { EmptyAnalyticsState } from '@/features/analytics/components/EmptyAnalyticsState'
import { Card } from '@/components/ui/card'
import { AnalyticsTimeRange } from '@/features/analytics/types'
import { cn } from '@/lib/utils'

export default function AnalyticsPage() {
  const user = useAuthStore((s) => s.user)
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30d')

  // Setup options if filters are needed in the future
  const {
    summary,
    habitPerformance,
    progressInsights,
    chartData,
    isLoading,
    hasData,
  } = useAnalytics(user?.uid, timeRange)

  const rangeTabs: { label: string; value: AnalyticsTimeRange }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: 'This Year', value: 'year' },
    { label: 'All Time', value: 'all' },
  ]

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!hasData) {
    return <EmptyAnalyticsState />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Print-only layout header */}
      <div className="hidden print:block pb-6 border-b border-border select-none">
        <h1 className="text-3xl font-extrabold tracking-tight">Loop Analytics Summary</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generated on {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Main Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden select-none">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visualize your habit consistency patterns and progress trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border/40 shrink-0">
            {rangeTabs.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer select-none',
                  timeRange === value
                    ? 'bg-card text-foreground shadow-sm border border-border/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Export widget */}
          <ExportDialog performance={habitPerformance} />
        </div>
      </div>

      {/* Overall Summary Stats Grid */}
      {summary && <SummaryCards summary={summary} />}

      {/* Progress Insights Feed */}
      {progressInsights.length > 0 && (
        <div className="print:hidden">
          <InsightCards insights={progressInsights} />
        </div>
      )}

      {/* Recharts Graphs */}
      <div className="print:break-inside-avoid">
        <Charts
          trendData={chartData.weeklyTrend}
          categoryDistribution={chartData.categoryDistribution}
          weekdayStats={chartData.weekdayStats}
        />
      </div>

      {/* Individual Habits Performance Leaderboard */}
      <div className="print:break-inside-avoid pt-2">
        <HabitPerformanceTable performance={habitPerformance} />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 w-1/3">
          <div className="h-6 bg-muted/40 rounded w-3/4" />
          <div className="h-4 bg-muted/30 rounded w-1/2" />
        </div>
        <div className="h-8 bg-muted/40 rounded w-48 shrink-0" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="border-border/30 bg-muted/10 h-24" />
        ))}
      </div>

      <div className="h-32 bg-muted/15 border border-border/30 rounded-xl" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/30 bg-muted/10 h-[300px]" />
        <Card className="border-border/30 bg-muted/10 h-[300px]" />
      </div>

      <Card className="border-border/30 bg-muted/10 h-64" />
    </div>
  )
}
