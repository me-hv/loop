import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackingService, getLocalDateString, getYesterdayDateString, calculateStreakFromDates } from '../services/tracking-service'
import { habitsService } from '@/features/habits/services/habits-service'
import { Habit } from '@/features/habits/types'
import { HabitCompletion, UserProgressSummary, ActivityLogItem } from '../types'

// Helper to check if a habit is scheduled for today
export function isHabitScheduledToday(frequency: string): boolean {
  const day = new Date().getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  if (frequency === 'Daily') return true
  if (frequency === 'Weekdays') return day >= 1 && day <= 5
  if (frequency === 'Weekends') return day === 0 || day === 6
  // Weekly, Monthly, Custom are visible every day for them to check off
  return true
}

// 1. Hook to get habits scheduled for today
export function useTodayHabits(userId: string | undefined) {
  return useQuery<Habit[]>({
    queryKey: ['today-habits', userId],
    queryFn: async () => {
      if (!userId) return []
      const allHabits = await habitsService.getHabits(userId)
      // Filter out archived, deleted, and non-today scheduled habits
      return allHabits.filter(
        (h) => !h.isArchived && !h.isDeleted && isHabitScheduledToday(h.frequency)
      )
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// 2. Hook to fetch today's completions
export function useTodayCompletions(userId: string | undefined) {
  return useQuery<HabitCompletion[]>({
    queryKey: ['today-completions', userId],
    queryFn: () => trackingService.getTodayCompletions(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// 3. Hook to fetch all user completions
export function useUserCompletions(userId: string | undefined) {
  return useQuery<HabitCompletion[]>({
    queryKey: ['user-completions', userId],
    queryFn: () => trackingService.getUserCompletions(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// 4. Mutation to toggle habit completion (with Optimistic Updates)
export function useHabitCompletionMutation(userId: string | undefined) {
  const queryClient = useQueryClient()
  const todayStr = getLocalDateString()

  return useMutation({
    mutationFn: async ({
      habitId,
      isCompleted,
      goalValue,
      notes,
    }: {
      habitId: string
      isCompleted: boolean
      goalValue: number
      notes?: string
    }) => {
      if (!userId) throw new Error('User not authenticated')
      if (isCompleted) {
        return trackingService.createCompletion(userId, habitId, todayStr, goalValue, notes)
      } else {
        await trackingService.removeCompletion(userId, habitId, todayStr)
        return null
      }
    },
    onMutate: async ({ habitId, isCompleted, goalValue }) => {
      // Invalidate and cancel active refetches
      await queryClient.cancelQueries({ queryKey: ['today-completions', userId] })
      await queryClient.cancelQueries({ queryKey: ['habits', userId] })
      await queryClient.cancelQueries({ queryKey: ['today-habits', userId] })

      // Snapshot previous state
      const previousCompletions = queryClient.getQueryData<HabitCompletion[]>([
        'today-completions',
        userId,
      ])
      const previousHabits = queryClient.getQueryData<Habit[]>([
        'habits',
        userId,
      ])
      const previousTodayHabits = queryClient.getQueryData<Habit[]>([
        'today-habits',
        userId,
      ])

      // 1. Optimistically update completions
      if (previousCompletions) {
        const nextCompletions = isCompleted
          ? [
              ...previousCompletions,
              {
                id: `temp-${Date.now()}`,
                habitId,
                userId: userId!,
                date: todayStr,
                completed: true,
                completedAt: new Date().toISOString(),
                goalValue,
                createdAt: new Date().toISOString(),
              },
            ]
          : previousCompletions.filter((c) => c.habitId !== habitId)

        queryClient.setQueryData(['today-completions', userId], nextCompletions)
      }

      // Helper to optimistically adjust habit stats
      const updateHabitInArray = (list: Habit[] | undefined) => {
        if (!list) return list
        return list.map((habit) => {
          if (habit.id !== habitId) return habit

          const totalCompletions = isCompleted
            ? (habit.totalCompletions ?? 0) + 1
            : Math.max(0, (habit.totalCompletions ?? 0) - 1)

          // Optimistic streak calculation
          let currentStreak = habit.currentStreak ?? 0
          let longestStreak = habit.longestStreak ?? 0

          if (isCompleted) {
            if (habit.lastCompletedDate === getYesterdayDateString(todayStr)) {
              currentStreak += 1
            } else if (habit.lastCompletedDate !== todayStr) {
              currentStreak = 1
            }
            longestStreak = Math.max(longestStreak, currentStreak)
          } else {
            currentStreak = Math.max(0, currentStreak - 1)
          }

          return {
            ...habit,
            totalCompletions,
            currentStreak,
            longestStreak,
            lastCompletedDate: isCompleted ? todayStr : null,
          }
        })
      }

      // 2. Optimistically update habits list
      if (previousHabits) {
        queryClient.setQueryData(['habits', userId], updateHabitInArray(previousHabits))
      }
      if (previousTodayHabits) {
        queryClient.setQueryData(['today-habits', userId], updateHabitInArray(previousTodayHabits))
      }

      return { previousCompletions, previousHabits, previousTodayHabits }
    },
    onError: (err, variables, context) => {
      // Rollback to snapshots
      if (context?.previousCompletions) {
        queryClient.setQueryData(['today-completions', userId], context.previousCompletions)
      }
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', userId], context.previousHabits)
      }
      if (context?.previousTodayHabits) {
        queryClient.setQueryData(['today-habits', userId], context.previousTodayHabits)
      }
    },
    onSettled: () => {
      // Trigger background queries refresh
      queryClient.invalidateQueries({ queryKey: ['today-completions', userId] })
      queryClient.invalidateQueries({ queryKey: ['habits', userId] })
      queryClient.invalidateQueries({ queryKey: ['today-habits', userId] })
      queryClient.invalidateQueries({ queryKey: ['user-completions', userId] })
    },
  })
}

// 5. Hook to calculate aggregates and daily progress metrics
export function useHabitProgress(userId: string | undefined) {
  const { data: todayHabits = [], isLoading: habitsLoading } = useTodayHabits(userId)
  const { data: todayCompletions = [], isLoading: completionsLoading } = useTodayCompletions(userId)
  const { data: userCompletions = [] } = useUserCompletions(userId)

  const isLoading = habitsLoading || completionsLoading

  // Calculate overall consistency streaks
  const streakStats = React.useMemo(() => {
    const dates = userCompletions.map((c) => c.date)
    return calculateStreakFromDates(dates, getLocalDateString())
  }, [userCompletions])

  const progressSummary = React.useMemo<UserProgressSummary>(() => {
    const totalCount = todayHabits.length
    const completedCount = todayHabits.filter((habit) =>
      todayCompletions.some((c) => c.habitId === habit.id)
    ).length
    const remainingCount = Math.max(0, totalCount - completedCount)
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return {
      completedCount,
      totalCount,
      remainingCount,
      progressPercentage,
      currentActiveStreak: streakStats.currentStreak,
      longestActiveStreak: streakStats.longestStreak,
    }
  }, [todayHabits, todayCompletions, streakStats])

  return {
    ...progressSummary,
    isLoading,
  }
}

// 6. Hook to build the recent activity timeline log
export function useActivityLog(userId: string | undefined) {
  const { data: allHabits = [] } = useQuery<Habit[]>({
    queryKey: ['habits', userId],
    queryFn: () => habitsService.getHabits(userId!),
    enabled: !!userId,
  })
  const { data: completions = [], isLoading } = useUserCompletions(userId)

  const activityLog = React.useMemo<ActivityLogItem[]>(() => {
    // Sort completions by timestamp descending, limit to top 10
    const sortedCompletions = [...completions]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 10)

    return sortedCompletions
      .map((comp) => {
        const habit = allHabits.find((h) => h.id === comp.habitId)
        if (!habit) return null
        return {
          id: comp.id,
          habitId: comp.habitId,
          habitTitle: habit.title,
          completedAt: comp.completedAt,
          category: habit.category,
          color: habit.color,
          icon: habit.icon,
          action: 'completed' as const,
        }
      })
      .filter(Boolean) as ActivityLogItem[]
  }, [completions, allHabits])

  return {
    activityLog,
    isLoading,
  }
}
