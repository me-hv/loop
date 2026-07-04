export type NotificationType = 'reminder' | 'achievement' | 'challenge' | 'journal' | 'system'

export interface InAppNotification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
  actionUrl?: string
  relatedId?: string
}

export interface NotificationPreferences {
  habitReminders: boolean
  journalReminders: boolean
  achievementAlerts: boolean
  challengeAlerts: boolean
  weeklySummaries: boolean
  dailySummaries: boolean
}

export interface NotificationSettings {
  userId: string
  enabled: boolean
  soundEnabled: boolean
  timezone: string
  quietHoursEnabled: boolean
  quietHoursStart: string // e.g., "22:00"
  quietHoursEnd: string // e.g., "07:00"
  weekendReminders: boolean
  preferences: NotificationPreferences
  updatedAt: string
}

export interface ReminderSchedule {
  id: string
  userId: string
  habitId: string // "global" or specific habitId
  enabled: boolean
  times: string[] // e.g., ["08:30", "18:00"]
  days: number[] // 0-6 (Sun-Sat)
  customMessage?: string
  updatedAt: string
}

export interface FcmTokenDoc {
  token: string
  userId: string
  deviceType: 'browser'
  createdAt: string
  updatedAt: string
}
