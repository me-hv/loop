'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '../services/settings-service'
import { UserSettings, ThemeMode } from '../types'

// ─── 1. Core Settings Hook ──────────────────────────────────────────────────
export function useSettings(userId: string | undefined) {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['user-settings', userId],
    queryFn: () => settingsService.getSettings(userId!),
    enabled: !!userId,
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<UserSettings>) => settingsService.updateSettings(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', userId] })
    },
  })

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  }
}

// ─── 2. Theme management Hook ───────────────────────────────────────────────
export function useTheme(userId: string | undefined) {
  const { settings, updateSettings } = useSettings(userId)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  const theme: ThemeMode = settings?.theme || 'system'

  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyTheme = () => {
      const root = document.documentElement
      let active: 'light' | 'dark' = 'light'

      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        active = systemPrefersDark ? 'dark' : 'light'
      } else {
        active = theme as 'light' | 'dark'
      }

      setResolvedTheme(active)
      if (active === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    applyTheme()

    // Listen for system changes if system theme is selected
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const setTheme = (mode: ThemeMode) => {
    updateSettings({ theme: mode })
  }

  return {
    theme,
    resolvedTheme,
    setTheme,
  }
}

// ─── 3. User Preferences Hook ───────────────────────────────────────────────
export function useUserPreferences(userId: string | undefined) {
  const { settings, updateSettings, isLoading, isUpdating } = useSettings(userId)

  return {
    weekStart: settings?.weekStart ?? 1,
    defaultDashboard: settings?.defaultDashboard ?? 'today',
    defaultCalendarView: settings?.defaultCalendarView ?? 'month',
    measurementUnit: settings?.measurementUnit ?? 'metric',
    clockFormat: settings?.clockFormat ?? '12h',
    isLoading,
    isUpdating,
    updatePreferences: (updates: Partial<Pick<UserSettings, 'weekStart' | 'defaultDashboard' | 'defaultCalendarView' | 'measurementUnit' | 'clockFormat'>>) => {
      updateSettings(updates)
    },
  }
}

// ─── 4. Privacy Settings Hook ────────────────────────────────────────────────
export function usePrivacySettings(userId: string | undefined) {
  const { settings, updateSettings, isLoading, isUpdating } = useSettings(userId)

  return {
    analyticsEnabled: settings?.analyticsEnabled ?? true,
    crashReportingEnabled: settings?.crashReportingEnabled ?? true,
    personalizedInsights: settings?.personalizedInsights ?? true,
    dataSharingEnabled: settings?.dataSharingEnabled ?? false,
    isLoading,
    isUpdating,
    updatePrivacy: (updates: Partial<Pick<UserSettings, 'analyticsEnabled' | 'crashReportingEnabled' | 'personalizedInsights' | 'dataSharingEnabled'>>) => {
      updateSettings(updates)
    },
  }
}

// ─── 5. Appearance Hook ─────────────────────────────────────────────────────
export function useAppearance(userId: string | undefined) {
  const { settings, updateSettings, isLoading, isUpdating } = useSettings(userId)

  return {
    accentColor: settings?.accentColor ?? 'indigo',
    compactMode: settings?.compactMode ?? false,
    animationsEnabled: settings?.animationsEnabled ?? true,
    fontSize: settings?.fontSize ?? 'base',
    isLoading,
    isUpdating,
    updateAppearance: (updates: Partial<Pick<UserSettings, 'accentColor' | 'compactMode' | 'animationsEnabled' | 'fontSize'>>) => {
      updateSettings(updates)
    },
  }
}
