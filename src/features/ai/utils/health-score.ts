import { Habit } from '@/features/habits/types'
import { HabitCompletion } from '@/features/tracking/types'
import { differenceInDays, subDays } from 'date-fns'
import { HabitHealthResult } from '../types'

export function calculateHabitHealth(
  habit: Habit,
  completions: HabitCompletion[],
  currentStreak: number
): HabitHealthResult {
  const today = new Date()
  const thirtyDaysAgo = subDays(today, 30)

  // Filter completions for this habit in the last 30 days
  const habitCompletions = completions.filter(
    (c) => c.habitId === habit.id && new Date(c.date) >= thirtyDaysAgo && c.completed
  )

  const createdDate = new Date(habit.createdAt.split('T')[0] + 'T00:00:00')
  const activeDays = Math.min(30, Math.max(1, differenceInDays(today, createdDate) + 1))
  const completionRate = habitCompletions.length / activeDays
  
  // Consistency: max 50 points
  const consistencyScore = Math.min(50, Math.round(completionRate * 50))

  // Streak contribution: 3 points per streak day, max 30 points
  const streakScore = Math.min(30, currentStreak * 3)

  // Recent activity recency: max 20 points
  const lastCompleted = habitCompletions.reduce((latest, c) => {
    const d = new Date(c.date + 'T00:00:00')
    return d > latest ? d : latest
  }, new Date(0))

  const daysSinceLastCompleted = lastCompleted.getTime() === 0 ? 99 : differenceInDays(today, lastCompleted)
  let recencyScore = 0
  if (daysSinceLastCompleted === 0) recencyScore = 20
  else if (daysSinceLastCompleted === 1) recencyScore = 15
  else if (daysSinceLastCompleted <= 3) recencyScore = 10
  else if (daysSinceLastCompleted <= 7) recencyScore = 5

  const totalScore = consistencyScore + streakScore + recencyScore
  const score = Math.max(0, Math.min(100, totalScore))

  let status: 'Excellent' | 'Good' | 'Needs Attention' = 'Needs Attention'
  if (score >= 80) status = 'Excellent'
  else if (score >= 50) status = 'Good'

  return {
    score,
    status,
    consistency: Math.round(completionRate * 100),
    streak: currentStreak,
  }
}
export function getHealthColor(status: 'Excellent' | 'Good' | 'Needs Attention'): string {
  switch (status) {
    case 'Excellent':
      return 'text-success'
    case 'Good':
      return 'text-accent'
    default:
      return 'text-destructive'
  }
}
export function getHealthBg(status: 'Excellent' | 'Good' | 'Needs Attention'): string {
  switch (status) {
    case 'Excellent':
      return 'bg-success/10 border-success/20 text-success'
    case 'Good':
      return 'bg-accent/10 border-accent/20 text-accent'
    default:
      return 'bg-destructive/10 border-destructive/20 text-destructive'
  }
}
