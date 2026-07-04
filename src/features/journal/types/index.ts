export type MoodType = 'excellent' | 'happy' | 'neutral' | 'sad' | 'stressed' | 'exhausted'

export interface JournalEntry {
  id: string
  userId: string
  date: string // format: YYYY-MM-DD
  mood: MoodType
  energyLevel: number // 1 to 5
  stressLevel: number // 1 to 5
  sleepQuality: number // 1 to 5
  notes: string // free-form notes / markdown
  gratitude: string[] // up to 3 items
  wins: string[]
  challenges: string[]
  tomorrowFocus: string
  tags: string[]
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

export interface JournalFilters {
  search: string
  mood: string // empty string for 'all'
  tag: string // empty string for 'all'
  sortBy: 'newest' | 'oldest'
}

export interface MoodAnalyticsStats {
  moodCounts: Record<MoodType, number>
  averageEnergy: number
  averageStress: number
  averageSleep: number
  tagCounts: Record<string, number>
  mostCommonMood: MoodType | 'none'
  totalEntries: number
}

export interface DailyMoodDataPoint {
  date: string // YYYY-MM-DD
  label: string // display format
  mood: MoodType
  energyLevel: number
  stressLevel: number
  sleepQuality: number
}
