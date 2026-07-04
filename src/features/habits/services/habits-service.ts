import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase/client'
import { runWithFirestoreLogger } from '@/lib/firebase/logger'
import { Habit } from '../types'

export const habitsService = {
  isInitialized(): boolean {
    return !!firebaseDb
  },

  async createHabit(
    userId: string,
    data: Omit<Habit, 'id' | 'userId' | 'isDeleted' | 'createdAt' | 'updatedAt'>
  ): Promise<Habit> {
    if (!this.isInitialized()) {
      throw new Error('Firebase Firestore is not initialized.')
    }

    const newHabitData = {
      userId,
      title: data.title,
      description: data.description || '',
      category: data.category,
      color: data.color,
      icon: data.icon,
      frequency: data.frequency,
      goal: data.goal,
      unit: data.unit,
      difficulty: data.difficulty,
      isArchived: data.isArchived ?? false,
      isDeleted: false,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await runWithFirestoreLogger(
      {
        operation: 'addDoc',
        collection: 'habits',
        payload: newHabitData,
      },
      () => addDoc(collection(firebaseDb!, 'habits'), newHabitData)
    )

    return {
      id: docRef.id,
      ...newHabitData,
    }
  },

  async getHabits(userId: string): Promise<Habit[]> {
    if (!this.isInitialized()) return []

    const q = query(
      collection(firebaseDb!, 'habits'),
      where('userId', '==', userId),
      where('isDeleted', '==', false)
    )

    const querySnapshot = await runWithFirestoreLogger(
      {
        operation: 'getDocs',
        collection: 'habits',
        queryConstraints: `userId == ${userId}, isDeleted == false`,
      },
      () => getDocs(q)
    )

    const habits: Habit[] = []
    querySnapshot.forEach((docSnap) => {
      habits.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Habit, 'id'>),
      })
    })

    return habits
  },

  async getHabit(habitId: string): Promise<Habit | null> {
    if (!this.isInitialized()) return null

    const docRef = doc(firebaseDb!, 'habits', habitId)
    const docSnap = await runWithFirestoreLogger(
      {
        operation: 'getDoc',
        collection: 'habits',
        path: docRef.path,
      },
      () => getDoc(docRef)
    )

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<Habit, 'id'>
      if (data.isDeleted) return null

      return {
        id: docSnap.id,
        ...data,
      }
    }

    return null
  },

  async updateHabit(habitId: string, data: Partial<Omit<Habit, 'id' | 'userId'>>): Promise<void> {
    if (!this.isInitialized()) return

    const docRef = doc(firebaseDb!, 'habits', habitId)
    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
    }

    await runWithFirestoreLogger(
      {
        operation: 'updateDoc',
        collection: 'habits',
        path: docRef.path,
        payload: updatePayload,
      },
      () => updateDoc(docRef, updatePayload)
    )
  },

  async deleteHabit(habitId: string): Promise<void> {
    if (!this.isInitialized()) return

    const docRef = doc(firebaseDb!, 'habits', habitId)
    const updatePayload = {
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    }

    await runWithFirestoreLogger(
      {
        operation: 'updateDoc',
        collection: 'habits',
        path: docRef.path,
        payload: updatePayload,
      },
      () => updateDoc(docRef, updatePayload)
    )
  },

  async duplicateHabit(habitId: string): Promise<Habit> {
    if (!this.isInitialized()) {
      throw new Error('Firebase Firestore is not initialized.')
    }

    const original = await this.getHabit(habitId)
    if (!original) {
      throw new Error('Original habit not found or deleted.')
    }

    const duplicatedData = {
      userId: original.userId,
      title: `${original.title} (Copy)`,
      description: original.description || '',
      category: original.category,
      color: original.color,
      icon: original.icon,
      frequency: original.frequency,
      goal: original.goal,
      unit: original.unit,
      difficulty: original.difficulty,
      isArchived: original.isArchived,
      isDeleted: false,
      notes: original.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await runWithFirestoreLogger(
      {
        operation: 'addDoc',
        collection: 'habits',
        payload: duplicatedData,
      },
      () => addDoc(collection(firebaseDb!, 'habits'), duplicatedData)
    )

    return {
      id: docRef.id,
      ...duplicatedData,
    }
  },
}
