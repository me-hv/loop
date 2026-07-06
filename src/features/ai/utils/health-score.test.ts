import { describe, it, expect } from 'vitest'
import { subDays, format } from 'date-fns'
import { calculateHabitHealth } from './health-score'
import { Habit } from '@/features/habits/types'
import { HabitCompletion } from '@/features/tracking/types'

describe('calculateHabitHealth', () => {
  const dummyHabit: Habit = {
    id: 'habit_123',
    userId: 'user_999',
    title: 'Morning Yoga',
    description: '15 mins yoga',
    category: 'Health',
    frequency: 'Daily',
    difficulty: 'easy',
    color: '#000000',
    icon: 'activity',
    goal: 1,
    unit: 'Times',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    isDeleted: false,
    isArchived: false,
  }

  it('should return Needs Attention status for new habits with zero completions', () => {
    const completions: HabitCompletion[] = []
    const health = calculateHabitHealth(dummyHabit, completions, 0)
    expect(health.score).toBeLessThan(50)
    expect(health.status).toBe('Needs Attention')
  })

  it('should return Excellent status for habits with 100% completion rates and active streaks', () => {
    // Generate 30 completions relative to today
    const completions: HabitCompletion[] = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const targetDate = subDays(today, i)
      const dateStr = format(targetDate, 'yyyy-MM-dd')
      completions.push({
        id: `c_${i}`,
        userId: 'user_999',
        habitId: 'habit_123',
        date: dateStr,
        completed: true,
        completedAt: targetDate.toISOString(),
        goalValue: 1,
        createdAt: targetDate.toISOString(),
      })
    }

    const health = calculateHabitHealth(dummyHabit, completions, 30)
    // Expect high score due to consistency and active streak
    expect(health.score).toBeGreaterThanOrEqual(80)
    expect(health.status).toBe('Excellent')
  })
})
