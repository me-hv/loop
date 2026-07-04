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
import { updateProfile, deleteUser } from 'firebase/auth'
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
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      return snap.data() as UserSettings
    }

    const initial = { ...DEFAULT_SETTINGS(userId), updatedAt: new Date().toISOString() }
    await setDoc(docRef, initial)
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
    await setDoc(docRef, merged)

    // Sync updates to Firebase Auth Profile if name or picture changes
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
    // Try to upload to Firebase Storage if available
    if (firebaseApp) {
      try {
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
        const storage = getStorage(firebaseApp)
        const avatarRef = ref(storage, `avatars/${userId}`)
        await uploadBytes(avatarRef, file)
        const downloadUrl = await getDownloadURL(avatarRef)
        
        // Save URL in settings
        await this.updateSettings(userId, { photoURL: downloadUrl })
        return downloadUrl
      } catch (err) {
        console.warn('Firebase Storage upload failed, falling back to base64 encoding:', err)
      }
    }

    // Base64 encoding fallback if storage is disabled or unavailable
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
    
    // Fetch all user records from Firestore collections
    const collectionsToExport = [
      { name: 'habits', path: 'habits', field: 'userId' },
      { name: 'completions', path: 'habitCompletions', field: 'userId' },
      { name: 'journal', path: 'journal', field: 'userId' },
      { name: 'reminders', path: 'reminders', field: 'userId' },
      { name: 'notifications', path: 'notifications', field: 'userId' },
    ]

    const data: Record<string, unknown> = {}

    // A. Fetch sub-collections
    for (const coll of collectionsToExport) {
      const q = query(collection(db, coll.path), where(coll.field, '==', userId))
      const snap = await getDocs(q)
      data[coll.name] = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    }

    // B. Fetch single documents
    const settingsDoc = await getDoc(doc(db, 'userSettings', userId))
    data.userSettings = settingsDoc.exists() ? settingsDoc.data() : null

    const notificationPrefsDoc = await getDoc(doc(db, 'notificationSettings', userId))
    data.notificationSettings = notificationPrefsDoc.exists() ? notificationPrefsDoc.data() : null

    // C. Trigger browser download
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
    const collectionsToDelete = [
      'habits',
      'habitCompletions',
      'journal',
      'reminders',
      'notifications',
      'fcmTokens',
    ]

    // A. Delete all related documents in batches
    for (const path of collectionsToDelete) {
      const q = query(collection(db, path), where('userId', '==', userId))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const batch = writeBatch(db)
        snap.docs.forEach((doc) => batch.delete(doc.ref))
        await batch.commit()
      }
    }

    // B. Delete config documents
    await deleteDoc(doc(db, 'userSettings', userId))
    await deleteDoc(doc(db, 'notificationSettings', userId))
    await deleteDoc(doc(db, 'userProgress', userId))

    // C. Delete auth account
    const currentUser = firebaseAuth?.currentUser
    if (currentUser) {
      await deleteUser(currentUser)
    }
  },
}
