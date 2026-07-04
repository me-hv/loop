import { describe, it, expect } from 'vitest'
import { calculateStreakFromDates } from './tracking-service'

describe('calculateStreakFromDates', () => {
  it('should calculate zero streak for empty completions list', () => {
    const { currentStreak, longestStreak } = calculateStreakFromDates([], '2026-07-04')
    expect(currentStreak).toBe(0)
    expect(longestStreak).toBe(0)
  })

  it('should calculate active streaks correctly', () => {
    // 3 days consecutive completions including today
    const dates = ['2026-07-02', '2026-07-03', '2026-07-04']
    const { currentStreak, longestStreak } = calculateStreakFromDates(dates, '2026-07-04')
    expect(currentStreak).toBe(3)
    expect(longestStreak).toBe(3)
  })

  it('should calculate streak as active if completed yesterday but not today yet', () => {
    const dates = ['2026-07-02', '2026-07-03']
    const { currentStreak, longestStreak } = calculateStreakFromDates(dates, '2026-07-04')
    expect(currentStreak).toBe(2)
    expect(longestStreak).toBe(2)
  })

  it('should break the active streak if gap is larger than 1 day', () => {
    // completed on 2nd, skipped 3rd, today is 4th
    const dates = ['2026-07-02']
    const { currentStreak, longestStreak } = calculateStreakFromDates(dates, '2026-07-04')
    expect(currentStreak).toBe(0)
    expect(longestStreak).toBe(1)
  })
})
