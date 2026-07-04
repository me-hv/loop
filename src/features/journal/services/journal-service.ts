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
import { runWithFirestoreLogger } from '@/lib/firebase/logger'
import { JournalEntry } from '../types'

function isInitialized(): boolean {
  return !!firebaseDb
}

export const journalService = {
  getDocId(userId: string, date: string): string {
    return `${userId}_${date}`
  },

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
    
    const existingSnap = await runWithFirestoreLogger(
      {
        operation: 'getDoc',
        collection: 'journals',
        path: docRef.path,
      },
      () => getDoc(docRef)
    )

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

    await runWithFirestoreLogger(
      {
        operation: 'setDoc',
        collection: 'journals',
        path: docRef.path,
        payload: journalDoc,
      },
      () => setDoc(docRef, journalDoc)
    )

    return journalDoc
  },

  async getJournalByDate(userId: string, date: string): Promise<JournalEntry | null> {
    if (!isInitialized()) return null

    const docId = this.getDocId(userId, date)
    const docRef = doc(firebaseDb!, 'journals', docId)
    
    const docSnap = await runWithFirestoreLogger(
      {
        operation: 'getDoc',
        collection: 'journals',
        path: docRef.path,
      },
      () => getDoc(docRef)
    )

    if (docSnap.exists()) {
      return docSnap.data() as JournalEntry
    }

    return null
  },

  async deleteJournal(userId: string, date: string): Promise<void> {
    if (!isInitialized()) {
      throw new Error('Firebase Firestore is not initialized.')
    }

    const docId = this.getDocId(userId, date)
    const docRef = doc(firebaseDb!, 'journals', docId)

    await runWithFirestoreLogger(
      {
        operation: 'deleteDoc',
        collection: 'journals',
        path: docRef.path,
      },
      () => deleteDoc(docRef)
    )
  },

  async getJournalHistory(userId: string): Promise<JournalEntry[]> {
    if (!isInitialized()) return []

    const q = query(
      collection(firebaseDb!, 'journals'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )

    const snapshot = await runWithFirestoreLogger(
      {
        operation: 'getDocs',
        collection: 'journals',
        queryConstraints: `userId == ${userId}, orderBy == date desc`,
      },
      () => getDocs(q)
    )

    const list: JournalEntry[] = []
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as JournalEntry)
    })

    return list
  },
}
