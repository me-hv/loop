import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase/client'
import { runWithFirestoreLogger } from '@/lib/firebase/logger'
import { ReminderSchedule, InAppNotification, FcmTokenDoc, NotificationSettings } from '../types'

const DEFAULT_SETTINGS = (userId: string): NotificationSettings => ({
  userId,
  enabled: true,
  soundEnabled: true,
  timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  weekendReminders: true,
  preferences: {
    habitReminders: true,
    journalReminders: true,
    achievementAlerts: true,
    challengeAlerts: true,
    weeklySummaries: true,
    dailySummaries: true,
  },
  updatedAt: new Date().toISOString(),
})

export const notificationsService = {
  isInitialized(): boolean {
    return !!firebaseDb
  },

  // 1. Get/Set global settings
  async getNotificationSettings(userId: string): Promise<NotificationSettings> {
    if (!this.isInitialized()) return { ...DEFAULT_SETTINGS(userId), updatedAt: new Date().toISOString() }

    const docRef = doc(firebaseDb!, 'notificationSettings', userId)
    const snap = await runWithFirestoreLogger(
      {
        operation: 'getDoc',
        collection: 'notificationSettings',
        path: docRef.path,
      },
      () => getDoc(docRef)
    )

    if (snap.exists()) {
      return snap.data() as NotificationSettings
    }

    const initial = { ...DEFAULT_SETTINGS(userId), updatedAt: new Date().toISOString() }
    await runWithFirestoreLogger(
      {
        operation: 'setDoc',
        collection: 'notificationSettings',
        path: docRef.path,
        payload: initial,
      },
      () => setDoc(docRef, initial)
    )
    return initial
  },

  async updateNotificationSettings(userId: string, data: Partial<NotificationSettings>): Promise<void> {
    if (!this.isInitialized()) return
    const docRef = doc(firebaseDb!, 'notificationSettings', userId)
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    }

    await runWithFirestoreLogger(
      {
        operation: 'setDoc',
        collection: 'notificationSettings',
        path: docRef.path,
        payload,
      },
      () => setDoc(docRef, payload, { merge: true })
    )
  },

  // 2. Reminder Schedules management
  async getReminders(userId: string): Promise<ReminderSchedule[]> {
    if (!this.isInitialized()) return []
    const q = query(collection(firebaseDb!, 'reminders'), where('userId', '==', userId))
    
    const snap = await runWithFirestoreLogger(
      {
        operation: 'getDocs',
        collection: 'reminders',
        queryConstraints: `userId == ${userId}`,
      },
      () => getDocs(q)
    )

    const list: ReminderSchedule[] = []
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as ReminderSchedule)
    })
    return list
  },

  async getHabitReminder(userId: string, habitId: string): Promise<ReminderSchedule | null> {
    if (!this.isInitialized()) return null
    const q = query(
      collection(firebaseDb!, 'reminders'),
      where('userId', '==', userId),
      where('habitId', '==', habitId)
    )

    const snap = await runWithFirestoreLogger(
      {
        operation: 'getDocs',
        collection: 'reminders',
        queryConstraints: `userId == ${userId}, habitId == ${habitId}`,
      },
      () => getDocs(q)
    )

    if (!snap.empty) {
      const first = snap.docs[0]
      return { id: first.id, ...first.data() } as ReminderSchedule
    }
    return null
  },

  async saveReminder(userId: string, data: Omit<ReminderSchedule, 'userId' | 'updatedAt'>): Promise<void> {
    if (!this.isInitialized()) return
    const docRef = doc(firebaseDb!, 'reminders', data.id)
    const payload = {
      ...data,
      userId,
      updatedAt: new Date().toISOString(),
    }

    await runWithFirestoreLogger(
      {
        operation: 'setDoc',
        collection: 'reminders',
        path: docRef.path,
        payload,
      },
      () => setDoc(docRef, payload, { merge: true })
    )
  },

  async deleteReminder(reminderId: string): Promise<void> {
    if (!this.isInitialized()) return
    const docRef = doc(firebaseDb!, 'reminders', reminderId)

    await runWithFirestoreLogger(
      {
        operation: 'deleteDoc',
        collection: 'reminders',
        path: docRef.path,
      },
      () => deleteDoc(docRef)
    )
  },

  // 3. In-App Notification Center
  async getNotifications(userId: string, maxCount = 50): Promise<InAppNotification[]> {
    if (!this.isInitialized()) return []
    const q = query(
      collection(firebaseDb!, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    )

    const snap = await runWithFirestoreLogger(
      {
        operation: 'getDocs',
        collection: 'notifications',
        queryConstraints: `userId == ${userId}, orderBy == createdAt desc, limit == ${maxCount}`,
      },
      () => getDocs(q)
    )

    const list: InAppNotification[] = []
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as InAppNotification)
    })
    return list
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (!this.isInitialized()) return
    const docRef = doc(firebaseDb!, 'notifications', notificationId)
    const payload = { read: true }

    await runWithFirestoreLogger(
      {
        operation: 'updateDoc',
        collection: 'notifications',
        path: docRef.path,
        payload,
      },
      () => updateDoc(docRef, payload)
    )
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (!this.isInitialized()) return
    const q = query(
      collection(firebaseDb!, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    )

    const snap = await runWithFirestoreLogger(
      {
        operation: 'getDocs',
        collection: 'notifications',
        queryConstraints: `userId == ${userId}, read == false`,
      },
      () => getDocs(q)
    )

    const batch = writeBatch(firebaseDb!)
    snap.forEach((d) => {
      batch.update(d.ref, { read: true })
    })

    await runWithFirestoreLogger(
      {
        operation: 'writeBatch',
        collection: 'notifications',
        payload: { size: snap.size },
      },
      () => batch.commit()
    )
  },

  async deleteNotification(notificationId: string): Promise<void> {
    if (!this.isInitialized()) return
    const docRef = doc(firebaseDb!, 'notifications', notificationId)

    await runWithFirestoreLogger(
      {
        operation: 'deleteDoc',
        collection: 'notifications',
        path: docRef.path,
      },
      () => deleteDoc(docRef)
    )
  },

  async createNotification(
    userId: string,
    data: Omit<InAppNotification, 'id' | 'userId' | 'read' | 'createdAt'>
  ): Promise<InAppNotification> {
    if (!this.isInitialized()) throw new Error('Firebase DB not initialized')
    const item = {
      ...data,
      userId,
      read: false,
      createdAt: new Date().toISOString(),
    }

    const docRef = await runWithFirestoreLogger(
      {
        operation: 'addDoc',
        collection: 'notifications',
        payload: item,
      },
      () => addDoc(collection(firebaseDb!, 'notifications'), item)
    )

    return { id: docRef.id, ...item }
  },

  // 4. FCM device token storage
  async registerFCMToken(userId: string, token: string): Promise<void> {
    if (!this.isInitialized()) return
    const docRef = doc(firebaseDb!, 'fcmTokens', token)
    const docData: FcmTokenDoc = {
      token,
      userId,
      deviceType: 'browser',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await runWithFirestoreLogger(
      {
        operation: 'setDoc',
        collection: 'fcmTokens',
        path: docRef.path,
        payload: docData,
      },
      () => setDoc(docRef, docData)
    )
  },

  async unregisterFCMToken(token: string): Promise<void> {
    if (!this.isInitialized()) return
    const docRef = doc(firebaseDb!, 'fcmTokens', token)

    await runWithFirestoreLogger(
      {
        operation: 'deleteDoc',
        collection: 'fcmTokens',
        path: docRef.path,
      },
      () => deleteDoc(docRef)
    )
  },
}
