'use client'

import React from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/use-auth-store'
import { useUIStore } from '@/store/use-ui-store'
import {
  useTodayHabits,
  useTodayCompletions,
  useHabitCompletionMutation,
  useHabitProgress,
} from '@/features/tracking/hooks/use-tracking'
import { DailyProgressRing } from '@/features/tracking/components/DailyProgressRing'
import { RecentActivityList } from '@/features/tracking/components/RecentActivityList'
import { TodayHabitCard } from '@/features/tracking/components/TodayHabitCard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Plus,
  Flame,
  Zap,
  Target,
  TrendingUp,
  Inbox,
  Calendar,
  Trophy,
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function DashboardOverview() {
  const user = useAuthStore((state) => state.user)
  const addToast = useUIStore((state) => state.addToast)

  // 1. Fetch Today's Checklist habits and completions
  const { data: habits = [], isLoading: habitsLoading } = useTodayHabits(user?.uid)
  const { data: completions = [], isLoading: completionsLoading } = useTodayCompletions(user?.uid)

  // 2. Fetch Progress statistics and streaks
  const {
    completedCount,
    totalCount,
    remainingCount,
    progressPercentage,
    currentActiveStreak,
    longestActiveStreak,
    isLoading: progressLoading,
  } = useHabitProgress(user?.uid)

  // 3. Completion Mutation
  const toggleMutation = useHabitCompletionMutation(user?.uid)

  const isLoading = habitsLoading || completionsLoading || progressLoading

  // Dynamic greetings
  const greeting = React.useMemo(() => {
    const hours = new Date().getHours()
    if (hours < 12) return 'Good morning'
    if (hours < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const todayFormatted = React.useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }, [])

  const handleToggleComplete = async (habitId: string, isCurrentlyCompleted: boolean, goalValue: number, title: string) => {
    try {
      await toggleMutation.mutateAsync({
        habitId,
        isCompleted: !isCurrentlyCompleted,
        goalValue,
      })
      addToast({
        message: !isCurrentlyCompleted
          ? `Habit "${title}" completed! 🎉`
          : `Habit "${title}" completion undone.`,
        type: 'success',
      })
    } catch (error) {
      console.error('Error toggling completion:', error)
      addToast({
        message: 'Failed to update habit completion. Please try again.',
        type: 'error',
      })
    }
  }

  // 4. Loading Skeleton View
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto select-none">
        <div className="space-y-2">
          <div className="h-8 bg-muted/40 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-muted/40 rounded w-1/4 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted/10 border border-border/40 rounded-xl animate-pulse p-4 space-y-2">
              <div className="h-4 bg-muted/30 rounded w-1/2" />
              <div className="h-7 bg-muted/30 rounded w-1/3" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 bg-muted/40 rounded w-1/4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[74px] bg-muted/10 border border-border/40 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="h-48 bg-muted/10 border border-border/40 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none">
      {/* Greetings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl font-extrabold tracking-tight text-foreground">
            {greeting}, {user?.firstName || 'User'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Today is <span className="font-semibold text-foreground">{todayFormatted}</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/dashboard/today" className={cn(buttonVariants(), 'cursor-pointer gap-2 bg-accent hover:bg-accent/90 text-white font-medium h-9 text-xs')}>
            <Calendar className="h-4 w-4" />
            Today&apos;s Checklist
          </Link>
          <Link href="/dashboard/habits/new" className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer gap-2 h-9 text-xs border-border/60 hover:bg-muted')}>
            <Plus className="h-4 w-4" />
            New Habit
          </Link>
        </div>
      </div>

      {/* Progress & Streak Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Progress Percentage Card */}
        <Card className="border-border/55 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today&apos;s Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{progressPercentage}%</span>
              <span className="text-xs text-muted-foreground">
                ({completedCount}/{totalCount})
              </span>
            </div>
            <Progress value={progressPercentage} className="h-1.5 bg-muted [&>div]:bg-accent" />
          </CardContent>
        </Card>

        {/* Current Active Streak Card */}
        <Card className="border-border/55 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Current Active Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{currentActiveStreak} days</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Consecutive days completed</p>
          </CardContent>
        </Card>

        {/* Longest Active Streak Card */}
        <Card className="border-border/55 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1.5">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Longest Active Streak
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{longestActiveStreak} days</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">All-time record consistency</p>
          </CardContent>
        </Card>
      </div>

      {/* Main split grid */}
      {totalCount === 0 ? (
        <Card className="border-border/55 bg-card/60 backdrop-blur-md p-10 text-center py-16 space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="mx-auto p-4 w-fit rounded-full bg-accent/10 text-accent mb-2 animate-pulse">
            <Inbox className="h-10 w-10 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">No habits scheduled today</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              No habits are scheduled for today. Add routines or adjust weekdays to begin tracking consistency.
            </p>
          </div>
          <Link href="/dashboard/habits/new" className={cn(buttonVariants({ size: 'sm' }), 'cursor-pointer inline-flex bg-accent hover:bg-accent/90 text-white font-medium')}>
            Create a habit
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Checklist Checklist */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Today&apos;s Routines</span>
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground select-none">
                {completedCount}/{totalCount} completed
              </span>
            </h2>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {habits.map((habit, index) => {
                  const isCompleted = completions.some((c) => c.habitId === habit.id)
                  const isPending = toggleMutation.isPending && toggleMutation.variables?.habitId === habit.id

                  return (
                    <TodayHabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={isCompleted}
                      isPending={isPending}
                      onToggle={() => handleToggleComplete(habit.id, isCompleted, habit.goal, habit.title)}
                      index={index}
                    />
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Progress Ring & Recent Activity timeline */}
          <div className="space-y-6">
            {/* Progress Circular Visual */}
            <Card className="border-border/50 bg-card overflow-hidden">
              <CardHeader className="px-4.5 py-3 border-b border-border/40 bg-muted/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2 select-none">
                  <Target className="h-4 w-4 text-accent" />
                  Visual Daily Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4.5 py-4 flex flex-col items-center justify-center space-y-3">
                <DailyProgressRing percentage={progressPercentage} size={96} />
                <div className="grid grid-cols-2 gap-4 w-full pt-2.5 border-t border-border/30 text-center text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">Completed</span>
                    <span className="text-base font-extrabold text-success mt-0.5 block">{completedCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">Remaining</span>
                    <span className="text-base font-extrabold text-muted-foreground mt-0.5 block">{remainingCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity timeline */}
            <Card className="border-border/50 bg-card overflow-hidden">
              <CardHeader className="px-4.5 py-3 border-b border-border/40 bg-muted/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2 select-none">
                  <Zap className="h-4 w-4 text-accent animate-pulse" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4.5 py-3">
                <RecentActivityList />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
