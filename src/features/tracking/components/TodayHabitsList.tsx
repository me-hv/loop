'use client'

import React from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useUIStore } from '@/store/use-ui-store'
import {
  useTodayHabits,
  useTodayCompletions,
  useHabitCompletionMutation,
} from '../hooks/use-tracking'
import { TodayHabitCard } from './TodayHabitCard'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

export function TodayHabitsList() {
  const user = useAuthStore((state) => state.user)
  const addToast = useUIStore((state) => state.addToast)

  // 1. Fetch habits and completions for today
  const { data: habits = [], isLoading: habitsLoading, isError: habitsError } = useTodayHabits(user?.uid)
  const { data: completions = [], isLoading: completionsLoading, isError: completionsError } = useTodayCompletions(user?.uid)

  // 2. Toggle completion mutation hook
  const toggleMutation = useHabitCompletionMutation(user?.uid)

  const isLoading = habitsLoading || completionsLoading
  const isError = habitsError || completionsError

  const handleToggleHabit = async (habitId: string, isCurrentlyCompleted: boolean, goalValue: number, title: string) => {
    try {
      await toggleMutation.mutateAsync({
        habitId,
        isCompleted: !isCurrentlyCompleted,
        goalValue,
      })
      addToast({
        message: !isCurrentlyCompleted
          ? `Habit "${title}" completed today! 🎉`
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

  // 3. Render loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[74px] w-full rounded-xl border border-border/40 bg-muted/10 animate-pulse p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 w-2/3">
              <div className="h-9 w-9 bg-muted/30 rounded-full" />
              <div className="space-y-2 w-full">
                <div className="h-4 bg-muted/30 rounded w-1/3" />
                <div className="h-3 bg-muted/30 rounded w-1/4" />
              </div>
            </div>
            <div className="h-7 w-7 bg-muted/30 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  // 4. Render error card
  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 text-center p-6 max-w-md mx-auto">
        <CardContent className="space-y-3 pt-0">
          <div className="mx-auto p-3 w-fit rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-base">Connection error</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Failed to sync today&apos;s habit tracking completions with Firestore. Please check your network.
          </p>
        </CardContent>
      </Card>
    )
  }

  // 5. Render empty state if no habits scheduled today
  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border border-border/50 bg-card/50 backdrop-blur-md rounded-xl p-10 text-center py-16 space-y-4 shadow-sm"
      >
        <span className="text-4xl block animate-bounce" role="img" aria-label="party popper">
          🎉
        </span>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">No habits scheduled today</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Enjoy your free day or configure daily frequencies inside your habits tab.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3.5">
      <AnimatePresence mode="popLayout">
        {habits.map((habit, idx) => {
          const isCompleted = completions.some((c) => c.habitId === habit.id)
          const isPending = toggleMutation.isPending && toggleMutation.variables?.habitId === habit.id

          return (
            <TodayHabitCard
              key={habit.id}
              habit={habit}
              isCompleted={isCompleted}
              isPending={isPending}
              onToggle={() => handleToggleHabit(habit.id, isCompleted, habit.goal, habit.title)}
              index={idx}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}
