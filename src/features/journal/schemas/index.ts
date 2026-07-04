import { z } from 'zod'

export const MOODS = ['excellent', 'happy', 'neutral', 'sad', 'stressed', 'exhausted'] as const

export const journalFormSchema = z.object({
  mood: z.enum(MOODS, {
    message: 'Please select your mood.',
  }),
  energyLevel: z.number().min(1).max(5),
  stressLevel: z.number().min(1).max(5),
  sleepQuality: z.number().min(1).max(5),
  notes: z.string(),
  gratitude: z.array(z.string().trim()).max(3, 'You can write up to 3 gratitude items.'),
  wins: z.array(z.string().trim()),
  challenges: z.array(z.string().trim()),
  tomorrowFocus: z.string().trim(),
  tags: z.array(z.string().trim()),
})

export type JournalFormValues = z.infer<typeof journalFormSchema>
