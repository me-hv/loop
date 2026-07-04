'use client'

import React from 'react'
import { NotificationSettings } from '../types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Volume2, Moon, CalendarDays, Globe, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationPreferencesProps {
  settings: NotificationSettings
  onSave: (updates: Partial<NotificationSettings>) => void
  isPending?: boolean
}

export function NotificationPreferences({
  settings,
  onSave,
  isPending,
}: NotificationPreferencesProps) {
  const [enabled, setEnabled] = React.useState(settings.enabled)
  const [soundEnabled, setSoundEnabled] = React.useState(settings.soundEnabled)
  const [quietHoursEnabled, setQuietHoursEnabled] = React.useState(settings.quietHoursEnabled)
  const [quietHoursStart, setQuietHoursStart] = React.useState(settings.quietHoursStart)
  const [quietHoursEnd, setQuietHoursEnd] = React.useState(settings.quietHoursEnd)
  const [weekendReminders, setWeekendReminders] = React.useState(settings.weekendReminders)
  const [timezone, setTimezone] = React.useState(settings.timezone)

  const [prefHabit, setPrefHabit] = React.useState(settings.preferences.habitReminders)
  const [prefJournal, setPrefJournal] = React.useState(settings.preferences.journalReminders)
  const [prefAch, setPrefAch] = React.useState(settings.preferences.achievementAlerts)
  const [prefChal, setPrefChal] = React.useState(settings.preferences.challengeAlerts)
  const [prefDaily, setPrefDaily] = React.useState(settings.preferences.dailySummaries)
  const [prefWeekly, setPrefWeekly] = React.useState(settings.preferences.weeklySummaries)

  // Sync state if settings document changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setEnabled(settings.enabled)
      setSoundEnabled(settings.soundEnabled)
      setQuietHoursEnabled(settings.quietHoursEnabled)
      setQuietHoursStart(settings.quietHoursStart)
      setQuietHoursEnd(settings.quietHoursEnd)
      setWeekendReminders(settings.weekendReminders)
      setTimezone(settings.timezone)

      setPrefHabit(settings.preferences.habitReminders)
      setPrefJournal(settings.preferences.journalReminders)
      setPrefAch(settings.preferences.achievementAlerts)
      setPrefChal(settings.preferences.challengeAlerts)
      setPrefDaily(settings.preferences.dailySummaries)
      setPrefWeekly(settings.preferences.weeklySummaries)
    }, 0)
    return () => clearTimeout(timer)
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      enabled,
      soundEnabled,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      weekendReminders,
      timezone,
      preferences: {
        habitReminders: prefHabit,
        journalReminders: prefJournal,
        achievementAlerts: prefAch,
        challengeAlerts: prefChal,
        dailySummaries: prefDaily,
        weeklySummaries: prefWeekly,
      },
    })
  }

  // Toggle switch helper styling
  const renderToggle = (val: boolean, setVal: (v: boolean) => void) => (
    <button
      type="button"
      onClick={() => setVal(!val)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out outline-none',
        val ? 'bg-accent' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
          val ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Global Master Preferences */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md select-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Reminders master switch</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Enable or completely suppress all habit notifications
              </CardDescription>
            </div>
            {renderToggle(enabled, setEnabled)}
          </div>
        </CardHeader>
      </Card>

      {/* 2. Quiet Hours & Delivery gating */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md select-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Moon className="h-4 w-4 text-accent" /> Quiet Hours
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Automatically suppress notifications during specified quiet periods.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">Enable Quiet Hours</label>
            {renderToggle(quietHoursEnabled, setQuietHoursEnabled)}
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/10">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Start Hour
                </label>
                <Input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  End Hour
                </label>
                <Input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Delivery options (Sound, weekend, timezone) */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md select-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground">Delivery Conditions</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Configure how and when notifications arrive.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          {/* Sounds */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-muted-foreground" /> Alert Sound
              </label>
              <p className="text-[10px] text-muted-foreground">Play sound effect on arrival</p>
            </div>
            {renderToggle(soundEnabled, setSoundEnabled)}
          </div>

          {/* Weekend */}
          <div className="flex items-center justify-between pt-2 border-t border-border/10">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-muted-foreground" /> Weekend Reminders
              </label>
              <p className="text-[10px] text-muted-foreground">Deliver alerts on weekends</p>
            </div>
            {renderToggle(weekendReminders, setWeekendReminders)}
          </div>

          {/* Timezone */}
          <div className="space-y-1.5 pt-2 border-t border-border/10">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-muted-foreground" /> Timezone
            </label>
            <Input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="text-xs h-9"
              placeholder="e.g. America/New_York"
            />
            <p className="text-[9px] text-muted-foreground font-semibold">
              Routines schedule triggers respect this timezone settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Categorized Toggles */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md select-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Bell className="h-4 w-4 text-accent" /> Preferences by Category
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Toggle specific reminder channels on or off.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          {[
            { label: 'Habit Reminders', desc: 'Alerts for specific habit times', val: prefHabit, set: setPrefHabit },
            { label: 'Journal Reminders', desc: 'Reflections and journal prompts', val: prefJournal, set: setPrefJournal },
            { label: 'Achievement Alerts', desc: 'Notifications on unlocked badges', val: prefAch, set: setPrefAch },
            { label: 'Challenge Alerts', desc: 'Reminders on active quests progress', val: prefChal, set: setPrefChal },
            { label: 'Daily Review Summaries', desc: 'Evening summaries of daily completions', val: prefDaily, set: setPrefDaily },
            { label: 'Weekly Performance Summaries', desc: 'Sunday review of completion rate metrics', val: prefWeekly, set: setPrefWeekly },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between pt-2 border-t border-border/10 first:border-0 first:pt-0">
              <div className="space-y-0.5">
                <label className="text-xs font-semibold text-foreground">{item.label}</label>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              {renderToggle(item.val, item.set)}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end select-none">
        <Button
          type="submit"
          disabled={isPending}
          className="font-bold text-xs h-9 flex items-center gap-1.5 cursor-pointer animate-none"
        >
          <Save className="h-4 w-4" /> Save Preferences
        </Button>
      </div>
    </form>
  )
}
