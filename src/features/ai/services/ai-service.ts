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
import { AIConversation, AIChatMessage } from '../types'

// Helper to get Firebase ID token for Authorization header
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
    try {
      const docSnap = await getDoc(doc(db, 'aiSummaries', docId))
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
    try {
      await setDoc(doc(db, 'aiSummaries', docId), {
        userId,
        type,
        date: dateKey,
        content,
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Error caching summary:', err)
    }
  },

  // Calling Server API route securely
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
      const querySnap = await getDocs(q)
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
    
    // Generate a title based on the first few words
    const title = firstMessageContent.substring(0, 30) + (firstMessageContent.length > 30 ? '...' : '')
    
    try {
      const docRef = await addDoc(collection(db, 'aiConversations'), {
        userId,
        title,
        messages: [initialUserMsg],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
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
    try {
      await updateDoc(doc(db, 'aiConversations', conversationId), {
        messages: updatedMessages,
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Error adding message to conversation:', err)
      throw err
    }
  },

  async deleteConversation(conversationId: string): Promise<void> {
    const db = firebaseDb!
    try {
      await deleteDoc(doc(db, 'aiConversations', conversationId))
    } catch (err) {
      console.error('Error deleting conversation:', err)
      throw err
    }
  }
}
