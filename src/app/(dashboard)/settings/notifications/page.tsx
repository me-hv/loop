'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useReminderSettings } from '@/features/notifications/hooks/use-notifications'
import { useQuery } from '@tanstack/react-query'
import { habitsService } from '@/features/habits/services/habits-service'
import { NotificationPreferences } from '@/features/notifications/components/NotificationPreferences'
import { ReminderForm } from '@/features/notifications/components/ReminderForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function NotificationSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const [selectedHabitId, setSelectedHabitId] = useState<string>('global')

  // Load habits list
  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits', user?.uid],
    queryFn: () => habitsService.getHabits(user!.uid),
    enabled: !!user?.uid,
  })

  // Load reminder preference settings
  const {
    settings,
    reminders,
    isLoading: settingsLoading,
    updateSettings,
    saveReminder,
    deleteReminder,
    isUpdating,
  } = useReminderSettings(user?.uid)

  const isLoading = habitsLoading || settingsLoading

  if (isLoading) {
    return <SettingsSkeleton />
  }

  // Find the reminder schedule matching the selected habit/global target
  const activeReminder = reminders.find((r) => r.habitId === selectedHabitId) || null

  return (
    <div className="space-y-6 select-none">
      <div>
        <h2 className="text-lg font-black text-foreground">Notification Preferences</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure quiet hours, weekend alarms, and custom reminder triggers per habit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Preferences */}
        {settings && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none px-1">
              Preferences & Delivery
            </h3>
            <NotificationPreferences
              settings={settings}
              onSave={updateSettings}
              isPending={isUpdating}
            />
          </div>
        )}

        {/* Right Column: Custom Schedules */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none px-1">
            Schedules Config
          </h3>
          
          <Card className="border-border/40 bg-card/60 backdrop-blur-md select-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Select Alert Target</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Set schedules globally or configure per-habit reminders.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                <select
                  value={selectedHabitId}
                  onChange={(e) => setSelectedHabitId(e.target.value)}
                  className="w-full h-10 px-3 py-1.5 rounded-lg border border-border/40 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-accent outline-none cursor-pointer"
                >
                  <option value="global">Global Daily Reminder (App-wide)</option>
                  {habits.map((h) => (
                    <option key={h.id} value={h.id}>
                      Habit: {h.title}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Reminder form config */}
          {user && (
            <ReminderForm
              key={selectedHabitId}
              userId={user.uid}
              habits={habits}
              reminder={activeReminder}
              habitId={selectedHabitId}
              onSave={saveReminder}
              onDelete={deleteReminder}
              isPending={isUpdating}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      <div className="space-y-1">
        <div className="h-7 bg-muted/40 rounded w-1/4" />
        <div className="h-4 bg-muted/30 rounded w-1/3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="h-20 border-border/30 bg-muted/10" />
          <Card className="h-48 border-border/30 bg-muted/10" />
          <Card className="h-64 border-border/30 bg-muted/10" />
        </div>
        <div className="space-y-4">
          <Card className="h-24 border-border/30 bg-muted/10" />
          <Card className="h-64 border-border/30 bg-muted/10" />
        </div>
      </div>
    </div>
  )
}
