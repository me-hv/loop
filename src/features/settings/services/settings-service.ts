import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore'
import { firebaseDb, firebaseApp, firebaseAuth } from '@/lib/firebase/client'
import { updateProfile } from 'firebase/auth'
import { runWithFirestoreLogger } from '@/lib/firebase/logger'
import { UserSettings } from '../types'

const DEFAULT_SETTINGS = (userId: string): Omit<UserSettings, 'updatedAt'> => ({
  userId,
  displayName: '',
  username: '',
  bio: '',
  timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  country: 'US',
  language: 'en',
  dateFormat: 'yyyy-MM-dd',
  timeFormat: '12h',
  theme: 'system',
  accentColor: 'indigo',
  compactMode: false,
  animationsEnabled: true,
  fontSize: 'base',
  weekStart: 1, // Monday
  defaultDashboard: 'today',
  defaultCalendarView: 'month',
  measurementUnit: 'metric',
  clockFormat: '12h',
  analyticsEnabled: true,
  crashReportingEnabled: true,
  personalizedInsights: true,
  dataSharingEnabled: false,
})

export const settingsService = {
  isInitialized(): boolean {
    return !!firebaseDb
  },

  // 1. Get Settings
  async getSettings(userId: string): Promise<UserSettings> {
    if (!this.isInitialized()) return { ...DEFAULT_SETTINGS(userId), updatedAt: new Date().toISOString() }

    const docRef = doc(firebaseDb!, 'userSettings', userId)
    const snap = await runWithFirestoreLogger(
      {
        operation: 'getDoc',
        collection: 'userSettings',
        path: docRef.path,
      },
      () => getDoc(docRef)
    )

    if (snap.exists()) {
      return snap.data() as UserSettings
    }

    const initial = { ...DEFAULT_SETTINGS(userId), updatedAt: new Date().toISOString() }
    await runWithFirestoreLogger(
      {
        operation: 'setDoc',
        collection: 'userSettings',
        path: docRef.path,
        payload: initial,
      },
      () => setDoc(docRef, initial)
    )
    return initial
  },

  // 2. Update Settings
  async updateSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    if (!this.isInitialized()) throw new Error('Firebase not initialized')

    const docRef = doc(firebaseDb!, 'userSettings', userId)
    const current = await this.getSettings(userId)
    const merged = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await runWithFirestoreLogger(
      {
        operation: 'setDoc',
        collection: 'userSettings',
        path: docRef.path,
        payload: merged,
      },
      () => setDoc(docRef, merged)
    )

    const currentUser = firebaseAuth?.currentUser
    if (currentUser) {
      const authUpdates: { displayName?: string; photoURL?: string } = {}
      if (updates.displayName !== undefined) {
        authUpdates.displayName = updates.displayName
      }
      if (updates.photoURL !== undefined) {
        authUpdates.photoURL = updates.photoURL
      }
      if (Object.keys(authUpdates).length > 0) {
        try {
          await updateProfile(currentUser, authUpdates)
        } catch (err) {
          console.warn('Could not sync settings to Auth profile:', err)
        }
      }
    }

    return merged
  },

  // 3. Upload Avatar
  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (firebaseApp) {
      try {
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
        const storage = getStorage(firebaseApp)
        const avatarRef = ref(storage, `avatars/${userId}`)
        await uploadBytes(avatarRef, file)
        const downloadUrl = await getDownloadURL(avatarRef)
        
        await this.updateSettings(userId, { photoURL: downloadUrl })
        return downloadUrl
      } catch (err) {
        console.warn('Firebase Storage upload failed, falling back to base64 encoding:', err)
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Url = reader.result as string
        try {
          await this.updateSettings(userId, { photoURL: base64Url })
          resolve(base64Url)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  },

  // 4. Export User Data
  async exportUserData(userId: string): Promise<void> {
    if (!this.isInitialized()) throw new Error('Firebase not initialized')

    const db = firebaseDb!
    
    // Corrected singular 'journal' path to plural 'journals'
    const collectionsToExport = [
      { name: 'habits', path: 'habits', field: 'userId' },
      { name: 'completions', path: 'habitCompletions', field: 'userId' },
      { name: 'journal', path: 'journals', field: 'userId' },
      { name: 'reminders', path: 'reminders', field: 'userId' },
      { name: 'notifications', path: 'notifications', field: 'userId' },
    ]

    const data: Record<string, unknown> = {}

    for (const coll of collectionsToExport) {
      const q = query(collection(db, coll.path), where(coll.field, '==', userId))
      const snap = await runWithFirestoreLogger(
        {
          operation: 'getDocs',
          collection: coll.path,
          queryConstraints: `${coll.field} == ${userId}`,
        },
        () => getDocs(q)
      )
      data[coll.name] = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    }

    const settingsDocRef = doc(db, 'userSettings', userId)
    const settingsDoc = await runWithFirestoreLogger(
      {
        operation: 'getDoc',
        collection: 'userSettings',
        path: settingsDocRef.path,
      },
      () => getDoc(settingsDocRef)
    )
    data.userSettings = settingsDoc.exists() ? settingsDoc.data() : null

    const notificationPrefsDocRef = doc(db, 'notificationSettings', userId)
    const notificationPrefsDoc = await runWithFirestoreLogger(
      {
        operation: 'getDoc',
        collection: 'notificationSettings',
        path: notificationPrefsDocRef.path,
      },
      () => getDoc(notificationPrefsDocRef)
    )
    data.notificationSettings = notificationPrefsDoc.exists() ? notificationPrefsDoc.data() : null

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute('download', `loop_user_data_export_${userId}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  },

  // 5. Delete Account Data
  async deleteAccount(userId: string): Promise<void> {
    if (!this.isInitialized()) throw new Error('Firebase not initialized')

    const db = firebaseDb!
    // Corrected singular 'journal' to plural 'journals'
    const collectionsToDelete = [
      'habits',
      'habitCompletions',
      'journals',
      'reminders',
      'notifications',
      'fcmTokens',
    ]

    for (const path of collectionsToDelete) {
      const q = query(collection(db, path), where('userId', '==', userId))
      const snap = await runWithFirestoreLogger(
        {
          operation: 'getDocs',
          collection: path,
          queryConstraints: `userId == ${userId}`,
        },
        () => getDocs(q)
      )
      if (!snap.empty) {
        const batch = writeBatch(db)
        snap.docs.forEach((doc) => batch.delete(doc.ref))
        
        await runWithFirestoreLogger(
          {
            operation: 'writeBatch',
            collection: path,
            payload: { size: snap.size },
          },
          () => batch.commit()
        )
      }
    }

    const settingsDocRef = doc(db, 'userSettings', userId)
    await runWithFirestoreLogger(
      {
        operation: 'deleteDoc',
        collection: 'userSettings',
        path: settingsDocRef.path,
      },
      () => deleteDoc(settingsDocRef)
    )

    const notificationPrefsDocRef = doc(db, 'notificationSettings', userId)
    await runWithFirestoreLogger(
      {
        operation: 'deleteDoc',
        collection: 'notificationSettings',
        path: notificationPrefsDocRef.path,
      },
      () => deleteDoc(notificationPrefsDocRef)
    )
  },
}
