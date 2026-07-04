import { describe, it, expect } from 'vitest'
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
    // Generate 30 completions
    const completions: HabitCompletion[] = []
    for (let i = 0; i < 30; i++) {
      const day = i + 5
      completions.push({
        id: `c_${i}`,
        userId: 'user_999',
        habitId: 'habit_123',
        date: `2026-06-${day < 10 ? '0' + day : day}`,
        completed: true,
        completedAt: '2026-06-01T00:00:00Z',
        goalValue: 1,
        createdAt: '2026-06-01T00:00:00Z',
      })
    }

    const health = calculateHabitHealth(dummyHabit, completions, 15)
    // Expect high score due to consistency and active streak
    expect(health.score).toBeGreaterThanOrEqual(80)
    expect(health.status).toBe('Excellent')
  })
})
