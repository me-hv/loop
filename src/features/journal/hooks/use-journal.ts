import { useEffect, useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { journalService } from '../services/journal-service'
import { journalFormSchema, JournalFormValues, MOODS } from '../schemas'
import { JournalEntry, JournalFilters, MoodAnalyticsStats, DailyMoodDataPoint, MoodType } from '../types'
import { format, parseISO } from 'date-fns'

// ─── 1. Hook to manage a single journal entry with autosave ───────────────────
export function useJournal(userId: string | undefined, date: string) {
  const queryClient = useQueryClient()
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // A. Fetch journal entry for date
  const { data: journalEntry, isLoading } = useQuery<JournalEntry | null>({
    queryKey: ['journal', userId, date],
    queryFn: () => journalService.getJournalByDate(userId!, date),
    enabled: !!userId && !!date,
    staleTime: 60 * 1000,
  })

  // B. Setup React Hook Form
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      mood: undefined,
      energyLevel: 3,
      stressLevel: 3,
      sleepQuality: 3,
      notes: '',
      gratitude: [],
      wins: [],
      challenges: [],
      tomorrowFocus: '',
      tags: [],
    },
  })

  // C. Reset form values when database entry changes
  useEffect(() => {
    if (journalEntry) {
      reset({
        mood: journalEntry.mood,
        energyLevel: journalEntry.energyLevel,
        stressLevel: journalEntry.stressLevel,
        sleepQuality: journalEntry.sleepQuality,
        notes: journalEntry.notes,
        gratitude: journalEntry.gratitude,
        wins: journalEntry.wins,
        challenges: journalEntry.challenges,
        tomorrowFocus: journalEntry.tomorrowFocus,
        tags: journalEntry.tags,
      })
      setSaveStatus('idle')
    } else {
      reset({
        mood: undefined,
        energyLevel: 3,
        stressLevel: 3,
        sleepQuality: 3,
        notes: '',
        gratitude: [],
        wins: [],
        challenges: [],
        tomorrowFocus: '',
        tags: [],
      })
      setSaveStatus('idle')
    }
  }, [journalEntry, reset])

  // D. Firestore save mutation
  const saveMutation = useMutation({
    mutationFn: (values: JournalFormValues) =>
      journalService.saveJournal(userId!, date, values),
    onSuccess: (savedData) => {
      setSaveStatus('saved')
      // Update cache
      queryClient.setQueryData(['journal', userId, date], savedData)
      // Invalidate list / analytics cache
      queryClient.invalidateQueries({ queryKey: ['journal-history', userId] })
      queryClient.invalidateQueries({ queryKey: ['journal-analytics', userId] })
      queryClient.invalidateQueries({ queryKey: ['calendar-month'] })
    },
    onError: () => {
      setSaveStatus('error')
    },
  })

  const formValues = watch()

  // E. Debounced autosave triggers (1.5s delay)
  useEffect(() => {
    if (!isDirty || !userId || !date) return

    setSaveStatus('saving')
    const timer = setTimeout(() => {
      handleSubmit((values: JournalFormValues) => {
        saveMutation.mutate(values)
      })()
    }, 1500)

    return () => clearTimeout(timer)
  }, [formValues, isDirty, userId, date, handleSubmit, saveMutation])

  // Manual save backup
  const handleManualSave = handleSubmit((values: JournalFormValues) => {
    setSaveStatus('saving')
    saveMutation.mutate(values)
  })

  // Helper to delete this entry
  const handleDelete = useMutation({
    mutationFn: () => journalService.deleteJournal(userId!, date),
    onSuccess: () => {
      queryClient.setQueryData(['journal', userId, date], null)
      queryClient.invalidateQueries({ queryKey: ['journal-history', userId] })
      queryClient.invalidateQueries({ queryKey: ['journal-analytics', userId] })
      queryClient.invalidateQueries({ queryKey: ['calendar-month'] })
      reset({
        mood: undefined,
        energyLevel: 3,
        stressLevel: 3,
        sleepQuality: 3,
        notes: '',
        gratitude: [],
        wins: [],
        challenges: [],
        tomorrowFocus: '',
        tags: [],
      })
      setSaveStatus('idle')
    },
  })

  return {
    register,
    control,
    watch,
    setValue,
    errors,
    saveStatus,
    isLoading,
    isDirty,
    handleManualSave,
    handleDelete: handleDelete.mutate,
    isDeleting: handleDelete.isPending,
    journalEntry,
  }
}

// ─── 2. Hook to fetch history with client-side filtering ─────────────────────
export function useJournalHistory(userId: string | undefined, filters: JournalFilters) {
  const { data: history = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['journal-history', userId],
    queryFn: () => journalService.getJournalHistory(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  const filteredHistory = useMemo(() => {
    if (history.length === 0) return []

    let list = [...history]

    // A. Filter by mood
    if (filters.mood) {
      list = list.filter((e) => e.mood === filters.mood)
    }

    // B. Filter by tag
    if (filters.tag) {
      list = list.filter((e) => e.tags.includes(filters.tag))
    }

    // C. Search query
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (e) =>
          e.notes.toLowerCase().includes(q) ||
          e.gratitude.some((g) => g.toLowerCase().includes(q)) ||
          e.wins.some((w) => w.toLowerCase().includes(q)) ||
          e.challenges.some((c) => c.toLowerCase().includes(q)) ||
          e.tomorrowFocus.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    // D. Sorting
    list.sort((a, b) => {
      const dateA = new Date(a.date + 'T00:00:00').getTime()
      const dateB = new Date(b.date + 'T00:00:00').getTime()
      return filters.sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

    return list
  }, [history, filters])

  return {
    history: filteredHistory,
    isLoading,
  }
}

// ─── 3. Hook to get aggregated mood and journal analytics ──────────────────
export function useMoodAnalytics(userId: string | undefined) {
  const { data: history = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['journal-analytics', userId],
    queryFn: () => journalService.getJournalHistory(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  const stats = useMemo<MoodAnalyticsStats>(() => {
    const defaultStats: MoodAnalyticsStats = {
      moodCounts: {
        excellent: 0,
        happy: 0,
        neutral: 0,
        sad: 0,
        stressed: 0,
        exhausted: 0,
      },
      averageEnergy: 0,
      averageStress: 0,
      averageSleep: 0,
      tagCounts: {},
      mostCommonMood: 'none',
      totalEntries: history.length,
    }

    if (history.length === 0) return defaultStats

    let totalEnergy = 0
    let totalStress = 0
    let totalSleep = 0

    history.forEach((entry) => {
      // Accumulate moods
      if (entry.mood in defaultStats.moodCounts) {
        defaultStats.moodCounts[entry.mood]++
      }

      // Accumulate values
      totalEnergy += entry.energyLevel
      totalStress += entry.stressLevel
      totalSleep += entry.sleepQuality

      // Accumulate tags
      if (entry.tags) {
        entry.tags.forEach((tag) => {
          defaultStats.tagCounts[tag] = (defaultStats.tagCounts[tag] || 0) + 1
        })
      }
    })

    const len = history.length
    defaultStats.averageEnergy = parseFloat((totalEnergy / len).toFixed(1))
    defaultStats.averageStress = parseFloat((totalStress / len).toFixed(1))
    defaultStats.averageSleep = parseFloat((totalSleep / len).toFixed(1))

    // Determine most common mood
    let maxMood: MoodType = 'neutral'
    let maxCount = -1
    MOODS.forEach((m) => {
      const c = defaultStats.moodCounts[m]
      if (c > maxCount) {
        maxCount = c
        maxMood = m
      }
    })
    defaultStats.mostCommonMood = maxCount > 0 ? maxMood : 'none'

    return defaultStats
  }, [history])

  // Trend data formatted for Recharts line graph plotting
  const trendData = useMemo<DailyMoodDataPoint[]>(() => {
    // Sort chronological ascending (oldest first) for graphs
    const sorted = [...history].sort(
      (a, b) => new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime()
    )

    // Slice to past 15 entries so the graph isn't overcrowded
    const sliced = sorted.slice(-15)

    return sliced.map((entry) => {
      const dObj = parseISO(entry.date)
      return {
        date: entry.date,
        label: format(dObj, 'MMM d'),
        mood: entry.mood,
        energyLevel: entry.energyLevel,
        stressLevel: entry.stressLevel,
        sleepQuality: entry.sleepQuality,
      }
    })
  }, [history])

  return {
    stats,
    trendData,
    isLoading,
  }
}
