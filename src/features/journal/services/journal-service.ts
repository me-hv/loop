import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase/client'
import { JournalEntry } from '../types'

function isInitialized(): boolean {
  return !!firebaseDb
}

export const journalService = {
  // Generates unique document ID per user per date
  getDocId(userId: string, date: string): string {
    return `${userId}_${date}`
  },

  // 1. Create or Overwrite a journal entry
  async saveJournal(
    userId: string,
    date: string,
    data: Omit<JournalEntry, 'id' | 'userId' | 'date' | 'createdAt' | 'updatedAt'>
  ): Promise<JournalEntry> {
    if (!isInitialized()) {
      throw new Error('Firebase Firestore is not initialized.')
    }

    const docId = this.getDocId(userId, date)
    const docRef = doc(firebaseDb!, 'journals', docId)
    const existingSnap = await getDoc(docRef)

    const now = new Date().toISOString()
    let createdAt = now
    
    if (existingSnap.exists()) {
      createdAt = existingSnap.data().createdAt || now
    }

    const journalDoc: JournalEntry = {
      id: docId,
      userId,
      date,
      ...data,
      createdAt,
      updatedAt: now,
    }

    await setDoc(docRef, journalDoc)
    return journalDoc
  },

  // 2. Fetch a single journal entry by date
  async getJournalByDate(userId: string, date: string): Promise<JournalEntry | null> {
    if (!isInitialized()) return null

    const docId = this.getDocId(userId, date)
    const docRef = doc(firebaseDb!, 'journals', docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as JournalEntry
    }

    return null
  },

  // 3. Delete a journal entry
  async deleteJournal(userId: string, date: string): Promise<void> {
    if (!isInitialized()) {
      throw new Error('Firebase Firestore is not initialized.')
    }

    const docId = this.getDocId(userId, date)
    const docRef = doc(firebaseDb!, 'journals', docId)
    await deleteDoc(docRef)
  },

  // 4. Fetch all user journal entries for timeline list
  async getJournalHistory(userId: string): Promise<JournalEntry[]> {
    if (!isInitialized()) return []

    const q = query(
      collection(firebaseDb!, 'journals'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )

    const snapshot = await getDocs(q)
    const list: JournalEntry[] = []

    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as JournalEntry)
    })

    return list
  },
}
