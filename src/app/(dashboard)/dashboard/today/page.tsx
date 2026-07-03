'use client'

import React from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useHabitProgress } from '@/features/tracking/hooks/use-tracking'
import { TodayHabitsList } from '@/features/tracking/components/TodayHabitsList'
import { DailyProgressRing } from '@/features/tracking/components/DailyProgressRing'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, Trophy, CheckSquare, ListTodo, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TodayHabitsPage() {
  const user = useAuthStore((state) => state.user)
  const {
    completedCount,
    totalCount,
    remainingCount,
    progressPercentage,
    currentActiveStreak,
    longestActiveStreak,
    isLoading,
  } = useHabitProgress(user?.uid)

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 select-none">
      {/* Page Header */}
      <PageHeader
        title="Today's Habits"
        description="Close your consistency loops and build daily streaks."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-accent" />
            <span>Today&apos;s Checklist</span>
            {!isLoading && totalCount > 0 && (
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                {completedCount}/{totalCount} completed
              </span>
            )}
          </h2>

          <TodayHabitsList />
        </div>

        {/* Right Column: Progress Ring & Streaks Summaries */}
        <div className="space-y-6">
          {/* Progress Ring Card */}
          <Card className="border-border/55 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-accent" />
                <span>Today&apos;s Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-5">
              <DailyProgressRing percentage={progressPercentage} size={130} />
              
              {/* Stats Counters Grid */}
              <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-border/40 text-center text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                    Completed
                  </span>
                  <span className="text-lg font-extrabold text-success mt-0.5 block">
                    {completedCount}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                    Remaining
                  </span>
                  <span className="text-lg font-extrabold text-muted-foreground mt-0.5 block">
                    {remainingCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Streaks Card */}
          <Card className="border-border/55 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>Consistency Streaks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {/* Current active streak */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                  <Flame className={cn('h-4.5 w-4.5', currentActiveStreak > 0 ? 'text-orange-500 fill-orange-500/20' : 'text-muted-foreground/40')} />
                  <span>Current Active Streak</span>
                </div>
                <span className="text-sm font-extrabold text-foreground">{currentActiveStreak} days</span>
              </div>

              {/* Longest active streak */}
              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                  <Trophy className={cn('h-4.5 w-4.5', longestActiveStreak > 0 ? 'text-yellow-500' : 'text-muted-foreground/30')} />
                  <span>Longest Active Streak</span>
                </div>
                <span className="text-sm font-extrabold text-foreground">{longestActiveStreak} days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
