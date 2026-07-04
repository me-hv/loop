import { NextResponse } from 'next/server'
import { buildSystemPrompt } from '@/features/ai/prompts'
import { AIChatMessage } from '@/features/ai/types'

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

    // 3. Verify OpenAI key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'OpenAI API key is missing. Please add OPENAI_API_KEY to your .env.local file.',
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

    // 5. Construct OpenAI messages payload
    const messages = []
    messages.push({ role: 'system', content: buildSystemPrompt() })

    if (action === 'chat') {
      // Chat actions inject the user's data context as a system reminder, followed by history
      messages.push({
        role: 'system',
        content: `Here is the current user's habits, logs, and streaks data. Use this data as the source of truth for the conversation:\n\n${promptContext}`
      })
      // Append past chat messages (handling role types)
      chatHistory.forEach((msg: AIChatMessage) => {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })
    } else {
      // Summaries and reviews append the context and instructions as the single user prompt
      messages.push({
        role: 'user',
        content: promptContext
      })
    }

    // 6. Query OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenAI Request Failed:', errText)
      return NextResponse.json(
        { error: `AI service provider failure: ${response.statusText}` },
        { status: response.status }
      )
    }

    const resJson = await response.json()
    const content = resJson.choices?.[0]?.message?.content || ''

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
