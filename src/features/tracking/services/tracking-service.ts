import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase/client'
import { HabitCompletion } from '../types'

// Date helper: YYYY-MM-DD
export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getYesterdayDateString(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() - 1)
  return getLocalDateString(date)
}

// Streak engine math utility
export function calculateStreakFromDates(
  dates: string[],
  todayStr: string
): { currentStreak: number; longestStreak: number } {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 }

  // Deduplicate and sort dates ascending
  const sortedUniqueDates = Array.from(new Set(dates)).sort()

  // Calculate longest streak
  let maxStreak = 0
  let currentRun = 0
  let prevTime: number | null = null

  for (const dateStr of sortedUniqueDates) {
    const currentTime = new Date(dateStr + 'T00:00:00').getTime()
    if (prevTime === null) {
      currentRun = 1
    } else {
      const diffDays = Math.round((currentTime - prevTime) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        currentRun += 1
      } else if (diffDays > 1) {
        currentRun = 1
      }
    }
    if (currentRun > maxStreak) {
      maxStreak = currentRun
    }
    prevTime = currentTime
  }

  // Calculate current streak (backwards from today or yesterday)
  let currentStreak = 0
  const hasToday = sortedUniqueDates.includes(todayStr)
  const yesterdayStr = getYesterdayDateString(todayStr)
  const hasYesterday = sortedUniqueDates.includes(yesterdayStr)

  if (hasToday || hasYesterday) {
    let checkStr = hasToday ? todayStr : yesterdayStr
    while (sortedUniqueDates.includes(checkStr)) {
      currentStreak++
      checkStr = getYesterdayDateString(checkStr)
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(maxStreak, currentStreak),
  }
}

export const trackingService = {
  isInitialized(): boolean {
    return !!firebaseDb
  },

  // 1. Create a completion record
  async createCompletion(
    userId: string,
    habitId: string,
    date: string,
    goalValue: number,
    notes = ''
  ): Promise<HabitCompletion> {
    if (!this.isInitialized()) {
      throw new Error('Firebase Firestore is not initialized.')
    }

    // Gating future dates
    const todayStr = getLocalDateString()
    if (date > todayStr) {
      throw new Error('Cannot log completions for future dates.')
    }

    // Check duplicate completions
    const q = query(
      collection(firebaseDb!, 'habitCompletions'),
      where('habitId', '==', habitId),
      where('date', '==', date)
    )
    const existing = await getDocs(q)
    if (!existing.empty) {
      throw new Error('Habit already completed for this date.')
    }

    const newCompletion = {
      habitId,
      userId,
      date,
      completed: true,
      completedAt: new Date().toISOString(),
      goalValue,
      notes,
      createdAt: new Date().toISOString(),
    }

    const docRef = await addDoc(collection(firebaseDb!, 'habitCompletions'), newCompletion)

    // Update aggregate stats on habit
    await this.updateHabitStats(userId, habitId, todayStr)

    return {
      id: docRef.id,
      ...newCompletion,
    }
  },

  // 2. Remove a completion record (Undo)
  async removeCompletion(userId: string, habitId: string, date: string): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase Firestore is not initialized.')
    }

    const q = query(
      collection(firebaseDb!, 'habitCompletions'),
      where('userId', '==', userId),
      where('habitId', '==', habitId),
      where('date', '==', date)
    )
    const snapshot = await getDocs(q)

    const deletePromises: Promise<void>[] = []
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(docSnap.ref))
    })

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises)
      const todayStr = getLocalDateString()
      await this.updateHabitStats(userId, habitId, todayStr)
    }
  },

  // 3. Get completions list for a specific habit
  async getHabitCompletions(userId: string, habitId: string): Promise<HabitCompletion[]> {
    if (!this.isInitialized()) return []

    const q = query(
      collection(firebaseDb!, 'habitCompletions'),
      where('userId', '==', userId),
      where('habitId', '==', habitId)
    )
    const snapshot = await getDocs(q)
    const list: HabitCompletion[] = []

    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as HabitCompletion)
    })

    return list
  },

  // 4. Get completions list for a user today
  async getTodayCompletions(userId: string): Promise<HabitCompletion[]> {
    if (!this.isInitialized()) return []

    const todayStr = getLocalDateString()
    const q = query(
      collection(firebaseDb!, 'habitCompletions'),
      where('userId', '==', userId),
      where('date', '==', todayStr)
    )
    const snapshot = await getDocs(q)
    const list: HabitCompletion[] = []

    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as HabitCompletion)
    })

    return list
  },

  // 5. Get all completions for a user
  async getUserCompletions(userId: string): Promise<HabitCompletion[]> {
    if (!this.isInitialized()) return []

    const q = query(collection(firebaseDb!, 'habitCompletions'), where('userId', '==', userId))
    const snapshot = await getDocs(q)
    const list: HabitCompletion[] = []

    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as HabitCompletion)
    })

    return list
  },

  // 6. Recalculate streak values and update parent habit document
  async updateHabitStats(userId: string, habitId: string, todayStr: string): Promise<void> {
    const completions = await this.getHabitCompletions(userId, habitId)
    const dates = completions.map((c) => c.date)
    const { currentStreak, longestStreak } = calculateStreakFromDates(dates, todayStr)

    const sortedDates = Array.from(new Set(dates)).sort()
    const lastCompletedDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null

    const habitDocRef = doc(firebaseDb!, 'habits', habitId)
    const habitDoc = await getDoc(habitDocRef)

    if (habitDoc.exists()) {
      const habitData = habitDoc.data()
      const createdAt = habitData.createdAt || new Date().toISOString()
      const createdDateStr = createdAt.split('T')[0]

      const createdTime = new Date(createdDateStr + 'T00:00:00').getTime()
      const todayTime = new Date(todayStr + 'T00:00:00').getTime()

      // Calculate total scheduled/elapsed days
      const totalDays = Math.max(
        1,
        Math.round((todayTime - createdTime) / (1000 * 60 * 60 * 24)) + 1
      )
      const totalCompletions = sortedDates.length
      const completionPercentage = Math.min(100, Math.round((totalCompletions / totalDays) * 100))

      await updateDoc(habitDocRef, {
        currentStreak,
        longestStreak,
        totalCompletions,
        lastCompletedDate,
        completionPercentage,
        updatedAt: new Date().toISOString(),
      })
    }
  },
}
