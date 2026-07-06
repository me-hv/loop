import { QueryClient } from '@tanstack/react-query'
import { Habit } from '@/features/habits/types'
import { JournalEntry } from '@/features/journal/types'
import { AIConversation } from '@/features/ai/types'
import { InAppNotification } from '@/features/notifications/types'
import { HabitCompletion } from '@/features/tracking/types'
import { gamificationService } from '@/features/gamification/services/gamification-service'

export interface SearchResult {
  id: string
  title: string
  category: 'Habits' | 'Journal' | 'Calendar' | 'AI Coach' | 'Achievements' | 'Notifications' | 'Settings'
  icon: string
  preview: string
  url: string
  date?: string
}

const SETTINGS_SECTIONS = [
  { id: 'settings-profile', title: 'Edit Profile', preview: 'Change name, bio, email, or profile photo.', url: '/settings/profile', icon: 'User' },
  { id: 'settings-account', title: 'Account Settings', preview: 'Manage account security, email verification, or password reset.', url: '/settings/account', icon: 'Lock' },
  { id: 'settings-appearance', title: 'Appearance / Theme', preview: 'Toggle dark mode, light mode, or system themes.', url: '/settings/appearance', icon: 'Palette' },
  { id: 'settings-preferences', title: 'User Preferences', preview: 'Set local time formats, starting days of week, or language.', url: '/settings/preferences', icon: 'Sliders' },
  { id: 'settings-notifications', title: 'Notifications Settings', preview: 'Configure email, push, or reminder alert preferences.', url: '/settings/notifications', icon: 'Bell' },
  { id: 'settings-privacy', title: 'Privacy & Security', preview: 'Manage active sessions, data sharing, or access rights.', url: '/settings/privacy', icon: 'Shield' },
  { id: 'settings-data', title: 'Data Management', preview: 'Export your logs, clear history, or import backup data.', url: '/settings/data', icon: 'Database' },
]

export const searchService = {
  // Pre-cache all queries in the background
  async prefetchSearchData(queryClient: QueryClient, userId: string): Promise<void> {
    try {
      // These will load data into React Query cache if not already loaded
      queryClient.invalidateQueries({ queryKey: ['habits', userId] })
      queryClient.invalidateQueries({ queryKey: ['journal-history', userId] })
      queryClient.invalidateQueries({ queryKey: ['aiConversations', userId] })
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    } catch (err) {
      console.error('Error prefetching search data:', err)
    }
  },

  searchLocalData(userId: string, queryClient: QueryClient, queryText: string): SearchResult[] {
    const term = queryText.toLowerCase().trim()
    if (!term) return []

    const results: SearchResult[] = []

    // 1. Get Habits from Cache
    const habits: Habit[] = queryClient.getQueryData(['habits', userId]) || []
    habits.forEach((h) => {
      if (h.isDeleted) return
      const titleMatch = h.title.toLowerCase().includes(term)
      const descMatch = h.description?.toLowerCase().includes(term)
      const catMatch = h.category.toLowerCase().includes(term)
      const freqMatch = h.frequency.toLowerCase().includes(term)
      const prioMatch = h.difficulty.toLowerCase().includes(term)

      if (titleMatch || descMatch || catMatch || freqMatch || prioMatch) {
        results.push({
          id: h.id,
          title: h.title,
          category: 'Habits',
          icon: 'CheckSquare',
          preview: `${h.description || 'No description'} (Frequency: ${h.frequency}, Priority: ${h.difficulty})`,
          url: `/dashboard/habits#habit-${h.id}`,
        })
      }
    })

    // 2. Get Journal Entries from Cache
    const journals: JournalEntry[] = queryClient.getQueryData(['journal-history', userId]) || []
    journals.forEach((j) => {
      const notesMatch = j.notes?.toLowerCase().includes(term)
      const moodMatch = j.mood?.toLowerCase().includes(term)
      const tagMatch = j.tags?.some((t) => t.toLowerCase().includes(term))
      const winsMatch = j.wins?.some((w) => w.toLowerCase().includes(term))

      if (notesMatch || moodMatch || tagMatch || winsMatch) {
        results.push({
          id: j.id || j.date,
          title: `Journal Entry - ${j.date}`,
          category: 'Journal',
          icon: 'BookOpen',
          preview: `Mood: ${j.mood || 'Normal'} | "${j.notes?.substring(0, 75) || 'No notes'}${j.notes && j.notes.length > 75 ? '...' : ''}"`,
          url: `/dashboard/journal/${j.date}`,
          date: j.date,
        })
      }
    })

    // 3. Get Calendar schedules & completion notes
    // We derive Calendar events from active habits & completed entries
    habits.forEach((h) => {
      if (h.isDeleted || h.isArchived) return
      const freqMatch = h.frequency.toLowerCase().includes(term)
      const titleMatch = h.title.toLowerCase().includes(term)
      
      if (freqMatch || titleMatch) {
        results.push({
          id: `cal-${h.id}`,
          title: `${h.title} (Schedule)`,
          category: 'Calendar',
          icon: 'Calendar',
          preview: `Scheduled habits on ${h.frequency} - View on Calendar.`,
          url: `/dashboard/calendar`,
        })
      }
    })

    // 4. Get AI Coach Conversations
    const conversations: AIConversation[] = queryClient.getQueryData(['aiConversations', userId]) || []
    conversations.forEach((c) => {
      if (c.isArchived) return
      const titleMatch = c.title.toLowerCase().includes(term)
      const msgMatch = c.messages.some((m) => m.content.toLowerCase().includes(term))

      if (titleMatch || msgMatch) {
        results.push({
          id: c.id,
          title: c.title,
          category: 'AI Coach',
          icon: 'Bot',
          preview: `Conversation mentioning "${queryText.substring(0, 30)}"`,
          url: `/dashboard/ai?chat=${c.id}`,
        })
      }
    })

    // 5. Get Achievements (derived dynamically)
    const completions = (queryClient.getQueryData(['completions', userId]) || []) as HabitCompletion[]
    const achievements = gamificationService.getAchievementsList(habits, completions, journals)
    achievements.forEach((a) => {
      const nameMatch = a.title.toLowerCase().includes(term)
      const descMatch = a.description.toLowerCase().includes(term)
      if (nameMatch || descMatch) {
        results.push({
          id: a.id,
          title: a.title,
          category: 'Achievements',
          icon: 'Trophy',
          preview: `${a.description} (${a.unlocked ? 'Unlocked!' : 'Locked'})`,
          url: '/dashboard/achievements',
        })
      }
    })

    // 6. Get Notifications
    const notifications: InAppNotification[] = queryClient.getQueryData(['notifications', userId]) || []
    notifications.forEach((n) => {
      const titleMatch = n.title.toLowerCase().includes(term)
      const bodyMatch = n.message.toLowerCase().includes(term)

      if (titleMatch || bodyMatch) {
        results.push({
          id: n.id,
          title: n.title,
          category: 'Notifications',
          icon: 'Bell',
          preview: n.message,
          url: '/dashboard/notifications',
        })
      }
    })

    // 7. Get Settings sections
    SETTINGS_SECTIONS.forEach((s) => {
      const titleMatch = s.title.toLowerCase().includes(term)
      const previewMatch = s.preview.toLowerCase().includes(term)

      if (titleMatch || previewMatch) {
        results.push({
          id: s.id,
          title: s.title,
          category: 'Settings',
          icon: s.icon,
          preview: s.preview,
          url: s.url,
        })
      }
    })

    return results
  }
}
