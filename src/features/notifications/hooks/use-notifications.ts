'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '../services/notifications-service'
import { NotificationSettings, ReminderSchedule } from '../types'
import { firebaseApp } from '@/lib/firebase/client'

// Initialize FCM messaging safely in the client browser only
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let messagingInstance: any = null
if (typeof window !== 'undefined' && firebaseApp) {
  import('firebase/messaging').then(({ isSupported, getMessaging }) => {
    isSupported().then((supported) => {
      if (supported) {
        try {
          messagingInstance = getMessaging(firebaseApp)
        } catch (err) {
          console.warn('FCM messaging failed to initialize:', err)
        }
      }
    })
  })
}

// ─── 1. Hook for In-App Notifications List ────────────────────────────────────
export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient()

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationsService.getNotifications(userId!),
    enabled: !!userId,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })

  const unreadCount = list.filter((n) => !n.read).length

  return {
    notifications: list,
    unreadCount,
    isLoading,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    isMarking: markReadMutation.isPending || markAllReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

// ─── 2. Hook for Reminder & Settings Preferences ────────────────────────────
export function useReminderSettings(userId: string | undefined) {
  const queryClient = useQueryClient()

  // Global preferences query
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['notification-settings', userId],
    queryFn: () => notificationsService.getNotificationSettings(userId!),
    enabled: !!userId,
  })

  // All schedules query
  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ['reminders', userId],
    queryFn: () => notificationsService.getReminders(userId!),
    enabled: !!userId,
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<NotificationSettings>) =>
      notificationsService.updateNotificationSettings(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings', userId] })
    },
  })

  const saveReminderMutation = useMutation({
    mutationFn: (data: Omit<ReminderSchedule, 'userId' | 'updatedAt'>) =>
      notificationsService.saveReminder(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', userId] })
    },
  })

  const deleteReminderMutation = useMutation({
    mutationFn: (id: string) => notificationsService.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', userId] })
    },
  })

  return {
    settings,
    reminders,
    isLoading: settingsLoading || remindersLoading,
    updateSettings: updateSettingsMutation.mutate,
    saveReminder: saveReminderMutation.mutate,
    deleteReminder: deleteReminderMutation.mutate,
    isUpdating:
      updateSettingsMutation.isPending ||
      saveReminderMutation.isPending ||
      deleteReminderMutation.isPending,
  }
}

// ─── 3. Hook for Notification Permissions & FCM ──────────────────────────────
export function useNotificationPermission(userId: string | undefined) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [token, setToken] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const timer = setTimeout(() => {
      setIsSupported('Notification' in window)
      setPermission(Notification.permission)
      setIsLoading(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Auto token register if permission was already granted previously
  useEffect(() => {
    if (!userId || permission !== 'granted' || !messagingInstance) return

    const fetchToken = async () => {
      try {
        const { getToken } = await import('firebase/messaging')
        // Obtain messaging token using registration sw
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) {
          const fcmToken = await getToken(messagingInstance, {
            serviceWorkerRegistration: reg,
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          })
          if (fcmToken) {
            setToken(fcmToken)
            await notificationsService.registerFCMToken(userId, fcmToken)
          }
        }
      } catch (err) {
        console.warn('Failed to obtain FCM registration token:', err)
      }
    }
    fetchToken()
  }, [permission, userId])

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    try {
      setIsLoading(true)
      const res = await Notification.requestPermission()
      setPermission(res)
      setIsLoading(false)

      if (res === 'granted' && userId && messagingInstance) {
        // Register sw and request token
        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
        const { getToken } = await import('firebase/messaging')
        const fcmToken = await getToken(messagingInstance, {
          serviceWorkerRegistration: reg,
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        })
        if (fcmToken) {
          setToken(fcmToken)
          await notificationsService.registerFCMToken(userId, fcmToken)
        }
        return true
      }
      return res === 'granted'
    } catch (err) {
      console.warn('Error requesting notification permission:', err)
      setIsLoading(false)
      return false
    }
  }

  return {
    permission,
    token,
    isSupported,
    isLoading,
    requestPermission,
  }
}
