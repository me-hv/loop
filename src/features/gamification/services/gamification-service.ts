import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase/client'
import { Habit } from '@/features/habits/types'
import { HabitCompletion } from '@/features/tracking/types'
import { JournalEntry } from '@/features/journal/types'
import {
  UserLevelProgress,
  AchievementItem,
  ChallengeItem,
  UserProgressDoc,
  AchievementCategory,
} from '../types'
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  getDay,
} from 'date-fns'
import { calculateStreakFromDates, getLocalDateString } from '@/features/tracking/services/tracking-service'

// XP Config coefficients
export const XP_VALUES = {
  HABIT_COMPLETE: 10,
  JOURNAL_WRITE: 15,
  PERFECT_DAY: 30,
  PERFECT_WEEK: 100,
  PERFECT_MONTH: 500,
  STREAK_7D: 50,
  STREAK_30D: 200,
  STREAK_100D: 1000,
  HABIT_CREATE: 20,
}

// ─── level bounds helpers ──────────────────────────────────────────────────
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0
  let xp = 0
  let increment = 250
  for (let i = 2; i <= level; i++) {
    xp += increment
    increment += 150 // progression adds +150 XP requirements per level
  }
  return xp
}

export function calculateLevelFromXp(xp: number): UserLevelProgress {
  let level = 1
  while (true) {
    const nextXp = getXpForLevel(level + 1)
    if (xp < nextXp) break
    level++
  }

  const currentLevelXp = getXpForLevel(level)
  const nextLevelXp = getXpForLevel(level + 1)
  const xpInCurrentLevel = xp - currentLevelXp
  const xpToNextLevel = nextLevelXp - currentLevelXp
  const progressPercent = xpToNextLevel > 0 ? Math.round((xpInCurrentLevel / xpToNextLevel) * 100) : 100

  return {
    level,
    currentXp: xpInCurrentLevel,
    xpToNextLevel: xpToNextLevel - xpInCurrentLevel,
    progressPercent,
    totalXp: xp,
  }
}

// Checks if a habit is scheduled on a given day-of-week (0=Sun, 6=Sat)
function isHabitScheduledOnDate(habit: Habit, date: Date): boolean {
  const createdDate = new Date(habit.createdAt.split('T')[0] + 'T00:00:00')
  const checkDate = new Date(format(date, 'yyyy-MM-dd') + 'T00:00:00')
  
  if (checkDate < createdDate) return false
  
  const dayOfWeek = getDay(date)
  if (habit.frequency === 'Daily') return true
  if (habit.frequency === 'Weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
  if (habit.frequency === 'Weekends') return dayOfWeek === 0 || dayOfWeek === 6
  return true
}

export const gamificationService = {
  // 1. Core XP Calculator
  calculateTotalXP(
    habits: Habit[],
    completions: HabitCompletion[],
    journals: JournalEntry[]
  ): { totalXp: number; perfectDaysCount: number } {
    if (habits.length === 0) return { totalXp: 0, perfectDaysCount: 0 }

    let xp = XP_VALUES.HABIT_CREATE // first habit created
    
    // completions
    const activeHabitIds = new Set(habits.filter(h => !h.isDeleted).map(h => h.id))
    const validCompletions = completions.filter(c => activeHabitIds.has(c.habitId))
    xp += validCompletions.length * XP_VALUES.HABIT_COMPLETE

    // journals
    xp += journals.length * XP_VALUES.JOURNAL_WRITE

    // Perfect Days & Weeks calculation
    const completionsMap = new Map<string, Set<string>>() // date -> Set of habitIds
    validCompletions.forEach((c) => {
      if (!completionsMap.has(c.date)) {
        completionsMap.set(c.date, new Set())
      }
      completionsMap.get(c.date)!.add(c.habitId)
    })

    const activeHabits = habits.filter((h) => !h.isDeleted && !h.isArchived)
    
    // Collect all dates from first completion/habit creation until today
    const earliestDateStr = habits.reduce((acc, h) => {
      const dStr = h.createdAt.split('T')[0]
      return dStr < acc ? dStr : acc
    }, getLocalDateString())
    
    const today = new Date()
    const rangeDays = eachDayOfInterval({ start: new Date(earliestDateStr + 'T00:00:00'), end: today })
    
    const perfectDates = new Set<string>()
    
    rangeDays.forEach((dateObj) => {
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const scheduledOnDay = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateObj))
      const dayCompletions = completionsMap.get(dateStr) || new Set()
      
      const dayScheduled = scheduledOnDay.length
      const dayCompleted = scheduledOnDay.filter((h) => dayCompletions.has(h.id)).length
      
      if (dayScheduled > 0 && dayCompleted === dayScheduled) {
        perfectDates.add(dateStr)
      }
    })

    xp += perfectDates.size * XP_VALUES.PERFECT_DAY

    // Perfect Weeks (if we have 7 perfect days in a calendar week)
    const weeksMap = new Map<string, number>() // weekStartStr -> perfect days count
    perfectDates.forEach((dateStr) => {
      const dObj = new Date(dateStr + 'T00:00:00')
      const weekStartStr = format(startOfWeek(dObj, { weekStartsOn: 0 }), 'yyyy-MM-dd')
      weeksMap.set(weekStartStr, (weeksMap.get(weekStartStr) || 0) + 1)
    })

    weeksMap.forEach((perfectCount) => {
      if (perfectCount >= 7) {
        xp += XP_VALUES.PERFECT_WEEK
      }
    })

    // Streak Milestones
    const completionDates = Array.from(new Set(validCompletions.map((c) => c.date))).sort()
    const todayStr = getLocalDateString()
    const { longestStreak } = calculateStreakFromDates(completionDates, todayStr)

    if (longestStreak >= 7) xp += XP_VALUES.STREAK_7D
    if (longestStreak >= 30) xp += XP_VALUES.STREAK_30D
    if (longestStreak >= 100) xp += XP_VALUES.STREAK_100D

    return {
      totalXp: xp,
      perfectDaysCount: perfectDates.size,
    }
  },

  // 2. Achievements Trigger list
  getAchievementsList(
    habits: Habit[],
    completions: HabitCompletion[],
    journals: JournalEntry[]
  ): AchievementItem[] {
    const activeHabitIds = new Set(habits.filter(h => !h.isDeleted).map(h => h.id))
    const validCompletions = completions.filter(c => activeHabitIds.has(c.habitId))
    const totalCompleted = validCompletions.length
    const totalJournals = journals.length
    
    // Streaks
    const completionDates = Array.from(new Set(validCompletions.map((c) => c.date))).sort()
    const todayStr = getLocalDateString()
    const { longestStreak } = calculateStreakFromDates(completionDates, todayStr)

    // Perfect Days
    let perfectDays = 0
    const completionsMap = new Map<string, Set<string>>()
    validCompletions.forEach((c) => {
      if (!completionsMap.has(c.date)) completionsMap.set(c.date, new Set())
      completionsMap.get(c.date)!.add(c.habitId)
    })
    
    const activeHabits = habits.filter(h => !h.isDeleted && !h.isArchived)
    if (habits.length > 0) {
      const earliestDateStr = habits.reduce((acc, h) => {
        const dStr = h.createdAt.split('T')[0]
        return dStr < acc ? dStr : acc
      }, getLocalDateString())
      const rangeDays = eachDayOfInterval({ start: new Date(earliestDateStr + 'T00:00:00'), end: new Date() })
      rangeDays.forEach((dateObj) => {
        const dateStr = format(dateObj, 'yyyy-MM-dd')
        const scheduled = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateObj))
        const dayCompletions = completionsMap.get(dateStr) || new Set()
        
        const schedCount = scheduled.length
        const compCount = scheduled.filter((h) => dayCompletions.has(h.id)).length
        if (schedCount > 0 && compCount === schedCount) {
          perfectDays++
        }
      })
    }

    // Time of day triggers
    let hasEarlyBird = false
    let hasNightOwl = false
    validCompletions.forEach((comp) => {
      if (comp.completedAt) {
        const hour = new Date(comp.completedAt).getHours()
        if (hour < 9) hasEarlyBird = true
        if (hour >= 20) hasNightOwl = true
      }
    })

    const definitions = [
      {
        id: 'first_step',
        category: 'Consistency' as AchievementCategory,
        title: 'First Step',
        description: 'Complete your first habit to begin your journey.',
        progress: totalCompleted >= 1 ? 1 : 0,
        target: 1,
        xpReward: 50,
      },
      {
        id: 'habit_apprentice',
        category: 'Habits' as AchievementCategory,
        title: 'Habit Apprentice',
        description: 'Log a total of 50 habit completions.',
        progress: Math.min(totalCompleted, 50),
        target: 50,
        xpReward: 100,
      },
      {
        id: 'habit_master',
        category: 'Habits' as AchievementCategory,
        title: 'Habit Master',
        description: 'Log a total of 500 habit completions.',
        progress: Math.min(totalCompleted, 500),
        target: 500,
        xpReward: 500,
      },
      {
        id: 'streak_7d',
        category: 'Streaks' as AchievementCategory,
        title: '7 Day Streak',
        description: 'Maintain a habit streak of 7 consecutive days.',
        progress: Math.min(longestStreak, 7),
        target: 7,
        xpReward: 150,
      },
      {
        id: 'streak_30d',
        category: 'Streaks' as AchievementCategory,
        title: '30 Day Streak',
        description: 'Maintain a habit streak of 30 consecutive days.',
        progress: Math.min(longestStreak, 30),
        target: 30,
        xpReward: 300,
      },
      {
        id: 'streak_100d',
        category: 'Streaks' as AchievementCategory,
        title: '100 Day Streak',
        description: 'Maintain a habit streak of 100 consecutive days.',
        progress: Math.min(longestStreak, 100),
        target: 100,
        xpReward: 1000,
      },
      {
        id: 'perfect_day',
        category: 'Consistency' as AchievementCategory,
        title: 'Perfect Day',
        description: 'Complete every scheduled habit on any single day.',
        progress: perfectDays >= 1 ? 1 : 0,
        target: 1,
        xpReward: 100,
      },
      {
        id: 'consistency_champion',
        category: 'Consistency' as AchievementCategory,
        title: 'Consistency Champion',
        description: 'Log 10 perfect days.',
        progress: Math.min(perfectDays, 10),
        target: 10,
        xpReward: 250,
      },
      {
        id: 'reflector',
        category: 'Journal' as AchievementCategory,
        title: 'Reflector',
        description: 'Write 5 journal reflection entries.',
        progress: Math.min(totalJournals, 5),
        target: 5,
        xpReward: 100,
      },
      {
        id: 'reflection_master',
        category: 'Journal' as AchievementCategory,
        title: 'Reflection Master',
        description: 'Write 30 journal reflection entries.',
        progress: Math.min(totalJournals, 30),
        target: 30,
        xpReward: 400,
      },
      {
        id: 'early_bird',
        category: 'Milestones' as AchievementCategory,
        title: 'Early Bird',
        description: 'Complete a routine before 9:00 AM local time.',
        progress: hasEarlyBird ? 1 : 0,
        target: 1,
        xpReward: 50,
      },
      {
        id: 'night_owl',
        category: 'Milestones' as AchievementCategory,
        title: 'Night Owl',
        description: 'Complete a routine after 8:00 PM local time.',
        progress: hasNightOwl ? 1 : 0,
        target: 1,
        xpReward: 50,
      },
    ]

    return definitions.map((d) => ({
      ...d,
      unlocked: d.progress >= d.target,
    }))
  },

  // 3. Dynamic seeded Daily & Weekly challenges evaluator
  getChallenges(
    habits: Habit[],
    completions: HabitCompletion[],
    journals: JournalEntry[]
  ): ChallengeItem[] {
    const todayStr = getLocalDateString()
    const today = new Date()
    
    // A. Daily parameters
    const todayCompletions = completions.filter((c) => c.date === todayStr)
    const todayJournal = journals.find((j) => j.date === todayStr)
    
    // Early morning completions today
    const earlyCompletionsCount = todayCompletions.filter((comp) => {
      if (!comp.completedAt) return false
      const hour = new Date(comp.completedAt).getHours()
      return hour < 9
    }).length

    // B. Weekly parameters
    const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 })
    const weekDays = eachDayOfInterval({ start: startOfWeekDate, end: today })
    const weekDaysStrList = weekDays.map((d) => format(d, 'yyyy-MM-dd'))
    
    const weekCompletions = completions.filter((c) => weekDaysStrList.includes(c.date))
    const weekJournals = journals.filter((j) => weekDaysStrList.includes(j.date))

    // Weekly completion rate calculation
    let weekScheduledSlots = 0
    let weekCompletedSlots = 0
    const completionsMap = new Set(weekCompletions.map((c) => `${c.date}_${c.habitId}`))
    const activeHabits = habits.filter((h) => !h.isDeleted && !h.isArchived)

    weekDays.forEach((dateObj) => {
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const scheduledOnDay = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateObj))
      
      weekScheduledSlots += scheduledOnDay.length
      weekCompletedSlots += scheduledOnDay.filter((h) => completionsMap.has(`${dateStr}_${h.id}`)).length
    })

    const weeklyRate = weekScheduledSlots > 0 ? Math.round((weekCompletedSlots / weekScheduledSlots) * 100) : 0

    return [
      // 1. Daily challenges
      {
        id: 'daily_reflection',
        title: 'Daily Reflection',
        description: "Write today's journal reflection entry.",
        progress: todayJournal ? 1 : 0,
        target: 1,
        completed: !!todayJournal,
        xpReward: 15,
        type: 'daily',
      },
      {
        id: 'daily_tri_habit',
        title: 'Tri-Habit Sprint',
        description: 'Complete 3 habits today.',
        progress: Math.min(todayCompletions.length, 3),
        target: 3,
        completed: todayCompletions.length >= 3,
        xpReward: 20,
        type: 'daily',
      },
      {
        id: 'daily_early_bird',
        title: 'Morning Momentum',
        description: 'Complete a habit before 9:00 AM today.',
        progress: earlyCompletionsCount >= 1 ? 1 : 0,
        target: 1,
        completed: earlyCompletionsCount >= 1,
        xpReward: 15,
        type: 'daily',
      },
      // 2. Weekly challenges
      {
        id: 'weekly_routine',
        title: 'Weekly Routine',
        description: 'Complete 20 habits this calendar week.',
        progress: Math.min(weekCompletions.length, 20),
        target: 20,
        completed: weekCompletions.length >= 20,
        xpReward: 100,
        type: 'weekly',
      },
      {
        id: 'weekly_reflection',
        title: 'Consistent Reflection',
        description: 'Write 5 journal entries this week.',
        progress: Math.min(weekJournals.length, 5),
        target: 5,
        completed: weekJournals.length >= 5,
        xpReward: 75,
        type: 'weekly',
      },
      {
        id: 'weekly_loop_master',
        title: 'Loop Master',
        description: 'Reach a 90% completion rate this calendar week.',
        progress: Math.min(weeklyRate, 90),
        target: 90,
        completed: weeklyRate >= 90,
        xpReward: 150,
        type: 'weekly',
      },
    ]
  },

  // 4. Firestore userProgress seen-state helpers
  async getUserProgress(userId: string): Promise<UserProgressDoc | null> {
    if (!firebaseDb) return null
    const docRef = doc(firebaseDb, 'userProgress', userId)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      return snap.data() as UserProgressDoc
    }
    return null
  },

  async createUserProgress(userId: string): Promise<UserProgressDoc> {
    const docRef = doc(firebaseDb!, 'userProgress', userId)
    const initialDoc: UserProgressDoc = {
      userId,
      lastSeenLevel: 1,
      seenAchievementIds: [],
      updatedAt: new Date().toISOString(),
    }
    await setDoc(docRef, initialDoc)
    return initialDoc
  },

  async acknowledgeLevel(userId: string, level: number): Promise<void> {
    if (!firebaseDb) return
    const docRef = doc(firebaseDb, 'userProgress', userId)
    await updateDoc(docRef, {
      lastSeenLevel: level,
      updatedAt: new Date().toISOString(),
    })
  },

  async acknowledgeAchievement(userId: string, achievementId: string): Promise<void> {
    if (!firebaseDb) return
    const docRef = doc(firebaseDb, 'userProgress', userId)
    await updateDoc(docRef, {
      seenAchievementIds: arrayUnion(achievementId),
      updatedAt: new Date().toISOString(),
    })
  },
}
