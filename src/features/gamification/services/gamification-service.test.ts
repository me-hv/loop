import { describe, it, expect } from 'vitest'
import { calculateLevelFromXp, getXpForLevel } from './gamification-service'

describe('Gamification Levels & XP Progression', () => {
  it('should return level 1 for 0 XP', () => {
    const progress = calculateLevelFromXp(0)
    expect(progress.level).toBe(1)
    expect(progress.currentXp).toBe(0)
    expect(progress.xpToNextLevel).toBe(250)
  })

  it('should scale XP boundaries per level correctly', () => {
    // Level 1 boundary starts at 0 XP
    expect(getXpForLevel(1)).toBe(0)
    // Level 2 requires 250 XP
    expect(getXpForLevel(2)).toBe(250)
    // Level 3 requires 250 + 400 = 650 XP
    expect(getXpForLevel(3)).toBe(650)
  })

  it('should calculate level progress percentages correctly', () => {
    // 125 XP is exactly halfway between Level 1 (0) and Level 2 (250)
    const progress = calculateLevelFromXp(125)
    expect(progress.level).toBe(1)
    expect(progress.progressPercent).toBe(50)
    expect(progress.xpToNextLevel).toBe(125)
  })

  it('should handle higher level calculations successfully', () => {
    // 800 XP should place the user at Level 3 (starts at 650 XP)
    const progress = calculateLevelFromXp(800)
    expect(progress.level).toBe(3)
  })
})
