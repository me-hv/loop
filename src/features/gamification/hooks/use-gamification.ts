'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { habitsService } from '@/features/habits/services/habits-service'
import { trackingService } from '@/features/tracking/services/tracking-service'
import { journalService } from '@/features/journal/services/journal-service'
import { gamificationService, calculateLevelFromXp } from '../services/gamification-service'
import { AchievementItem } from '../types'

// 1. Hook for User XP
export function useXP(userId: string | undefined) {
  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits', userId],
    queryFn: () => habitsService.getHabits(userId!),
    enabled: !!userId,
  })

  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['completions', userId],
    queryFn: () => trackingService.getUserCompletions(userId!),
    enabled: !!userId,
  })

  const { data: journals = [], isLoading: journalsLoading } = useQuery({
    queryKey: ['journal-history', userId],
    queryFn: () => journalService.getJournalHistory(userId!),
    enabled: !!userId,
  })

  const { totalXp, perfectDaysCount } = gamificationService.calculateTotalXP(habits, completions, journals)

  return {
    totalXp,
    perfectDaysCount,
    isLoading: habitsLoading || completionsLoading || journalsLoading,
  }
}

// 2. Hook for User Level
export function useLevel(userId: string | undefined) {
  const { totalXp, isLoading } = useXP(userId)
  const levelProgress = calculateLevelFromXp(totalXp)

  return {
    levelProgress,
    isLoading,
  }
}

// 3. Hook for Achievements
export function useAchievements(userId: string | undefined) {
  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits', userId],
    queryFn: () => habitsService.getHabits(userId!),
    enabled: !!userId,
  })

  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['completions', userId],
    queryFn: () => trackingService.getUserCompletions(userId!),
    enabled: !!userId,
  })

  const { data: journals = [], isLoading: journalsLoading } = useQuery({
    queryKey: ['journal-history', userId],
    queryFn: () => journalService.getJournalHistory(userId!),
    enabled: !!userId,
  })

  const achievements = gamificationService.getAchievementsList(habits, completions, journals)

  return {
    achievements,
    isLoading: habitsLoading || completionsLoading || journalsLoading,
  }
}

// 4. Hook for Challenges
export function useChallenges(userId: string | undefined) {
  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits', userId],
    queryFn: () => habitsService.getHabits(userId!),
    enabled: !!userId,
  })

  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['completions', userId],
    queryFn: () => trackingService.getUserCompletions(userId!),
    enabled: !!userId,
  })

  const { data: journals = [], isLoading: journalsLoading } = useQuery({
    queryKey: ['journal-history', userId],
    queryFn: () => journalService.getJournalHistory(userId!),
    enabled: !!userId,
  })

  const challenges = gamificationService.getChallenges(habits, completions, journals)

  return {
    challenges,
    isLoading: habitsLoading || completionsLoading || journalsLoading,
  }
}

// 5. Hook for Milestones
export function useMilestones(userId: string | undefined) {
  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['completions', userId],
    queryFn: () => trackingService.getUserCompletions(userId!),
    enabled: !!userId,
  })

  const { data: journals = [], isLoading: journalsLoading } = useQuery({
    queryKey: ['journal-history', userId],
    queryFn: () => journalService.getJournalHistory(userId!),
    enabled: !!userId,
  })

  // Calculate milestones progress stats
  const totalCompleted = completions.length
  const totalJournals = journals.length
  
  const completionDates = Array.from(new Set(completions.map((c) => c.date))).sort()
  const activeDays = completionDates.length

  const milestonesList = [
    { id: 'm_100_habits', label: '100 Habits Completed', progress: totalCompleted, target: 100, completed: totalCompleted >= 100 },
    { id: 'm_500_habits', label: '500 Habits Completed', progress: totalCompleted, target: 500, completed: totalCompleted >= 500 },
    { id: 'm_1000_habits', label: '1000 Habits Completed', progress: totalCompleted, target: 1000, completed: totalCompleted >= 1000 },
    { id: 'm_100_journals', label: '100 Journals Reflection', progress: totalJournals, target: 100, completed: totalJournals >= 100 },
    { id: 'm_365_active', label: '365 Active Days', progress: activeDays, target: 365, completed: activeDays >= 365 },
  ]

  return {
    milestones: milestonesList,
    isLoading: completionsLoading || journalsLoading,
  }
}

// 6. Unified Orchestrator Hook for achievements seen notifications, level up alerts
export function useGamification(userId: string | undefined) {
  const queryClient = useQueryClient()

  // fetch raw assets
  const { data: habits = [] } = useQuery({
    queryKey: ['habits', userId],
    queryFn: () => habitsService.getHabits(userId!),
    enabled: !!userId,
  })

  const { data: completions = [] } = useQuery({
    queryKey: ['completions', userId],
    queryFn: () => trackingService.getUserCompletions(userId!),
    enabled: !!userId,
  })

  const { data: journals = [] } = useQuery({
    queryKey: ['journal-history', userId],
    queryFn: () => journalService.getJournalHistory(userId!),
    enabled: !!userId,
  })

  // query progress docs
  const { data: userProgressDoc, isLoading: docLoading } = useQuery({
    queryKey: ['user-progress', userId],
    queryFn: async () => {
      const doc = await gamificationService.getUserProgress(userId!)
      if (!doc) {
        return await gamificationService.createUserProgress(userId!)
      }
      return doc
    },
    enabled: !!userId,
  })

  // derive level & achievements values
  const { totalXp, perfectDaysCount } = gamificationService.calculateTotalXP(habits, completions, journals)
  const levelProgress = calculateLevelFromXp(totalXp)
  const achievements = gamificationService.getAchievementsList(habits, completions, journals)
  const challenges = gamificationService.getChallenges(habits, completions, journals)

  // queue for celebrations
  const [celebrationQueue, setCelebrationQueue] = useState<{ type: 'level' | 'achievement'; value: number | AchievementItem }[]>([])

  useEffect(() => {
    if (!userProgressDoc || !levelProgress) return

    // A. Verify Level up
    if (levelProgress.level > userProgressDoc.lastSeenLevel) {
      if (!celebrationQueue.some(c => c.type === 'level' && c.value === levelProgress.level)) {
        const timer = setTimeout(() => {
          setCelebrationQueue(prev => [...prev, { type: 'level', value: levelProgress.level }])
        }, 0)
        return () => clearTimeout(timer)
      }
    }

    // B. Verify achievements unlocks
    const unacknowledged = achievements.filter(
      a => a.unlocked && !userProgressDoc.seenAchievementIds.includes(a.id)
    )
    if (unacknowledged.length > 0) {
      const firstUnack = unacknowledged[0]
      if (!celebrationQueue.some(c => c.type === 'achievement' && (c.value as AchievementItem).id === firstUnack.id)) {
        const timer = setTimeout(() => {
          setCelebrationQueue(prev => [...prev, { type: 'achievement', value: firstUnack }])
        }, 0)
        return () => clearTimeout(timer)
      }
    }
  }, [userProgressDoc, levelProgress, achievements, celebrationQueue])

  // Ack level up mutation
  const ackLevelMutation = useMutation({
    mutationFn: (level: number) => gamificationService.acknowledgeLevel(userId!, level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress', userId] })
      setCelebrationQueue(prev => prev.slice(1))
    },
  })

  // Ack achievement mutation
  const ackAchievementMutation = useMutation({
    mutationFn: (id: string) => gamificationService.acknowledgeAchievement(userId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress', userId] })
      setCelebrationQueue(prev => prev.slice(1))
    },
  })

  const currentCelebration = celebrationQueue[0] || null

  const handleDismissCelebration = () => {
    if (!currentCelebration) return

    if (currentCelebration.type === 'level') {
      ackLevelMutation.mutate(currentCelebration.value as number)
    } else {
      ackAchievementMutation.mutate((currentCelebration.value as AchievementItem).id)
    }
  }

  return {
    totalXp,
    perfectDaysCount,
    levelProgress,
    achievements,
    challenges,
    currentCelebration,
    dismissCelebration: handleDismissCelebration,
    isDismissing: ackLevelMutation.isPending || ackAchievementMutation.isPending,
    isLoading: docLoading,
  }
}
