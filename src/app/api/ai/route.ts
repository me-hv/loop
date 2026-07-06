import { NextResponse } from 'next/server'
import { buildSystemPrompt } from '@/features/ai/prompts'
import { AIChatMessage } from '@/features/ai/types'
import { GoogleGenAI } from '@google/genai'

// Simple in-memory rate-limiter: maps userId -> timestamps of requests
const rateLimitMap = new Map<string, number[]>()
const LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10 // max 10 calls/min per user

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(userId) || []
  
  // Filter out expired timestamps
  const activeTimestamps = timestamps.filter((t) => now - t < LIMIT_WINDOW_MS)
  
  if (activeTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }
  
  activeTimestamps.push(now)
  rateLimitMap.set(userId, activeTimestamps)
  return false
}

// Lightweight offline Firebase JWT validation check
function verifyFirebaseToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.split(' ')[1]
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    // Decode base64url payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
    
    // Validate expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      console.warn('AI API Auth Warning: Token has expired.')
      return null
    }
    
    // Validate issuer matching current project ID
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'loop-habits'
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
      console.warn('AI API Auth Warning: Firebase project ID mismatch.')
      return null
    }
    
    return payload.sub // sub is the Firebase User UID
  } catch (err) {
    console.error('AI API Auth Error: Failed to parse ID token JWT', err)
    return null
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate using Bearer token
    const authHeader = request.headers.get('Authorization')
    const userId = verifyFirebaseToken(authHeader)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or expired authentication token.' },
        { status: 401 }
      )
    }

    // 2. Enforce Rate Limiting
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before sending more requests.' },
        { status: 429 }
      )
    }

    // 3. Verify Gemini key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Gemini API key is missing. Please add GEMINI_API_KEY to your environment variables.',
          missingKey: true
        },
        { status: 400 }
      )
    }

    // 4. Parse request content
    const body = await request.json()
    const { action, promptContext, chatHistory = [] } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 })
    }

    // Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey })

    // 5. Construct Gemini system instruction and contents payload
    let systemInstructionText = buildSystemPrompt()
    let contents = []

    if (action === 'chat') {
      // Chat actions inject the user's data context as a system reminder, followed by history
      systemInstructionText = `${buildSystemPrompt()}\n\nHere is the current user's habits, logs, and streaks data. Use this data as the source of truth for the conversation:\n\n${promptContext}`
      
      // Append past chat messages (handling role types and converting assistant -> model)
      contents = chatHistory.map((msg: AIChatMessage) => ({
        role: (msg.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        parts: [{ text: msg.content }]
      }))
    } else {
      // Summaries and reviews append the context and instructions as the single user prompt
      contents = [
        {
          role: 'user' as const,
          parts: [{ text: promptContext }]
        }
      ]
    }

    // 6. Query Google GenAI SDK using Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: {
          parts: [{ text: systemInstructionText }]
        },
        temperature: 0.7
      }
    })

    const content = response.text || ''

    return NextResponse.json({ result: content })
  } catch (err) {
    console.error('AI API Route Exception:', err)
    const errMessage = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json(
      { error: errMessage },
      { status: 500 }
    )
  }
}
