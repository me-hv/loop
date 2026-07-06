import { GoogleGenAI } from '@google/genai'
import { AIChatMessage } from '@/features/ai/types'
import { buildSystemPrompt } from '@/features/ai/prompts'

export const geminiService = {
  getAiClient() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing.')
    }
    return new GoogleGenAI({ apiKey })
  },

  async generateContent(
    action: string,
    promptContext: string,
    chatHistory: AIChatMessage[] = []
  ): Promise<string> {
    const ai = this.getAiClient()
    
    let systemInstructionText = buildSystemPrompt()
    let contents: Array<{ role: string; parts: Array<{ text: string }> }> = []

    if (action === 'chat') {
      systemInstructionText = `${buildSystemPrompt()}

You are Loop AI Coach. Ground every response in the user's logged habits, completions, and journals.
For coaching inquiries, please structure your coaching response to include these 5 components (using bold headers and bullet points):
1. **Motivation**: Celebrate wins or provide an encouraging, non-shaming mindset reset.
2. **Pattern Analysis**: Highlight trends you notice in their consistency, completions, mood logs, or active streaks.
3. **Advice**: Provide clear, bite-sized strategies to overcome friction and build consistency.
4. **Tomorrow Plan**: Offer a single, actionable focus item they should prioritize tomorrow.
5. **Small Challenge**: Suggest a micro-challenge (something that takes less than 5 minutes) they can tackle today.

Here is the current user's habits, logs, and streaks data. Use this data as the source of truth for the conversation:
${promptContext}`
      
      contents = chatHistory.map((msg: AIChatMessage) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    } else if (action === 'generate_title') {
      systemInstructionText = 'You are a title generation tool. Analyze the following conversation exchange and generate a short, descriptive 2-4 word title summarizing the main topic (e.g. "Gym Consistency" or "Morning Routine Audit"). Do NOT include quotes, brackets, or markdown. Output ONLY the title text.'
      
      contents = chatHistory.map((msg: AIChatMessage) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    } else {
      contents = [
        {
          role: 'user',
          parts: [{ text: promptContext }]
        }
      ]
    }

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

    return response.text || ''
  }
}
