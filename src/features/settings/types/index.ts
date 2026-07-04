export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet'
export type FontSize = 'sm' | 'base' | 'lg'
export type DashboardView = 'today' | 'habits' | 'analytics'
export type CalendarView = 'month' | 'week'
export type MeasurementUnit = 'metric' | 'imperial'
export type ClockFormat = '12h' | '24h'

export interface UserSettings {
  userId: string
  // Profile settings
  displayName: string
  username: string
  bio: string
  timezone: string
  country: string
  language: string
  dateFormat: string
  timeFormat: string
  photoURL?: string

  // Appearance
  theme: ThemeMode
  accentColor: AccentColor
  compactMode: boolean
  animationsEnabled: boolean
  fontSize: FontSize

  // Preferences
  weekStart: 0 | 1 // 0 = Sunday, 1 = Monday
  defaultDashboard: DashboardView
  defaultCalendarView: CalendarView
  measurementUnit: MeasurementUnit
  clockFormat: ClockFormat

  // Privacy
  analyticsEnabled: boolean
  crashReportingEnabled: boolean
  personalizedInsights: boolean
  dataSharingEnabled: boolean

  updatedAt: string
}
