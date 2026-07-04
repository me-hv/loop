import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { firebaseDb, firebaseAuth } from '@/lib/firebase/client'
import { runWithFirestoreLogger } from '@/lib/firebase/logger'
import { AIConversation, AIChatMessage } from '../types'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = firebaseAuth?.currentUser
  if (!user) return {}
  const token = await user.getIdToken()
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export const aiService = {
  // ─── 1. Caching & Summaries ────────────────────────────────────────────────
  
  async getCachedSummary(
    userId: string,
    type: 'daily' | 'weekly' | 'monthly',
    dateKey: string
  ): Promise<string | null> {
    const db = firebaseDb!
    const docId = `${type}_${dateKey}_${userId}`
    const docRef = doc(db, 'aiSummaries', docId)

    try {
      const docSnap = await runWithFirestoreLogger(
        {
          operation: 'getDoc',
          collection: 'aiSummaries',
          path: docRef.path,
        },
        () => getDoc(docRef)
      )
      if (docSnap.exists()) {
        return docSnap.data().content
      }
    } catch (err) {
      console.error('Error fetching cached summary:', err)
    }
    return null
  },

  async saveCachedSummary(
    userId: string,
    type: 'daily' | 'weekly' | 'monthly',
    dateKey: string,
    content: string
  ): Promise<void> {
    const db = firebaseDb!
    const docId = `${type}_${dateKey}_${userId}`
    const docRef = doc(db, 'aiSummaries', docId)
    const payload = {
      userId,
      type,
      date: dateKey,
      content,
      createdAt: new Date().toISOString(),
    }

    try {
      await runWithFirestoreLogger(
        {
          operation: 'setDoc',
          collection: 'aiSummaries',
          path: docRef.path,
          payload,
        },
        () => setDoc(docRef, payload)
      )
    } catch (err) {
      console.error('Error caching summary:', err)
    }
  },

  async callAiApi(action: string, promptContext: string, chatHistory: AIChatMessage[] = []): Promise<string> {
    const headers = await getAuthHeaders()
    if (!headers.Authorization) {
      throw new Error('User not authenticated.')
    }

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action,
        promptContext,
        chatHistory,
      }),
    })

    const resData = await response.json()
    if (!response.ok) {
      throw new Error(resData.error || 'Failed to call AI API.')
    }

    return resData.result
  },

  // ─── 2. AI Conversations (Chats) ───────────────────────────────────────────

  async getConversations(userId: string): Promise<AIConversation[]> {
    const db = firebaseDb!
    try {
      const q = query(
        collection(db, 'aiConversations'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      const querySnap = await runWithFirestoreLogger(
        {
          operation: 'getDocs',
          collection: 'aiConversations',
          queryConstraints: `userId == ${userId}, orderBy == updatedAt desc`,
        },
        () => getDocs(q)
      )
      return querySnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AIConversation[]
    } catch (err) {
      console.error('Error fetching conversations:', err)
      return []
    }
  },

  async createConversation(userId: string, firstMessageContent: string): Promise<string> {
    const db = firebaseDb!
    const initialUserMsg: AIChatMessage = {
      role: 'user',
      content: firstMessageContent,
      createdAt: new Date().toISOString(),
    }
    
    const title = firstMessageContent.substring(0, 30) + (firstMessageContent.length > 30 ? '...' : '')
    const payload = {
      userId,
      title,
      messages: [initialUserMsg],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      const docRef = await runWithFirestoreLogger(
        {
          operation: 'addDoc',
          collection: 'aiConversations',
          payload,
        },
        () => addDoc(collection(db, 'aiConversations'), payload)
      )
      return docRef.id
    } catch (err) {
      console.error('Error creating conversation:', err)
      throw err
    }
  },

  async addMessageToConversation(
    conversationId: string,
    updatedMessages: AIChatMessage[]
  ): Promise<void> {
    const db = firebaseDb!
    const docRef = doc(db, 'aiConversations', conversationId)
    const payload = {
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    }

    try {
      await runWithFirestoreLogger(
        {
          operation: 'updateDoc',
          collection: 'aiConversations',
          path: docRef.path,
          payload,
        },
        () => updateDoc(docRef, payload)
      )
    } catch (err) {
      console.error('Error adding message to conversation:', err)
      throw err
    }
  },

  async deleteConversation(conversationId: string): Promise<void> {
    const db = firebaseDb!
    const docRef = doc(db, 'aiConversations', conversationId)

    try {
      await runWithFirestoreLogger(
        {
          operation: 'deleteDoc',
          collection: 'aiConversations',
          path: docRef.path,
        },
        () => deleteDoc(docRef)
      )
    } catch (err) {
      console.error('Error deleting conversation:', err)
      throw err
    }
  }
}
