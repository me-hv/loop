'use client'

import React, { useState } from 'react'
import { ReminderSchedule } from '../types'
import { Habit } from '@/features/habits/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, Clock, Plus, Trash2, Save, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReminderFormProps {
  userId: string
  habits: Habit[]
  reminder: ReminderSchedule | null
  habitId: string
  onSave: (reminder: Omit<ReminderSchedule, 'userId' | 'updatedAt'>) => void
  onDelete?: (reminderId: string) => void
  isPending?: boolean
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ReminderForm({
  userId,
  habits,
  reminder,
  habitId,
  onSave,
  onDelete,
  isPending,
}: ReminderFormProps) {
  const [enabled, setEnabled] = useState(() => reminder?.enabled ?? true)
  const [times, setTimes] = useState<string[]>(() => reminder?.times || ['08:00'])
  const [newTime, setNewTime] = useState('08:00')
  const [days, setDays] = useState<number[]>(() => reminder?.days || [1, 2, 3, 4, 5]) // default weekdays
  const [customMessage, setCustomMessage] = useState(() => reminder?.customMessage || '')

  const habit = habits.find((h) => h.id === habitId)
  const habitTitle = habitId === 'global' ? 'Global reminders' : habit?.title || 'Habit'

  // Add a reminder time slot
  const handleAddTime = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTime) return
    if (times.includes(newTime)) return
    setTimes([...times, newTime].sort())
  }

  // Remove a reminder time slot
  const handleRemoveTime = (timeStr: string) => {
    if (times.length <= 1) return // Keep at least one time
    setTimes(times.filter((t) => t !== timeStr))
  }

  // Toggle repeat days
  const handleToggleDay = (dayIdx: number) => {
    if (days.includes(dayIdx)) {
      setDays(days.filter((d) => d !== dayIdx))
    } else {
      setDays([...days, dayIdx].sort())
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: reminder?.id || `${userId}_${habitId}_reminder`,
      habitId,
      enabled,
      times,
      days,
      customMessage: customMessage.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <Card className="border-border/40 bg-card/60 backdrop-blur-md select-none">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground">
              Configure Alerts: <span className="text-accent">{habitTitle}</span>
            </h4>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={enabled ? 'default' : 'outline'}
                onClick={() => setEnabled(!enabled)}
                className="h-7 text-[10px] font-black cursor-pointer"
              >
                {enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>

          {/* Time Picker addition slots */}
          <div className="space-y-2 pt-2 border-t border-border/10">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Reminder Time Slots
            </label>
            <div className="flex gap-2">
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-32 h-9 text-xs"
              />
              <Button
                type="button"
                onClick={handleAddTime}
                variant="outline"
                className="h-9 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Time
              </Button>
            </div>

            {/* List of active time slot chips */}
            <div className="flex flex-wrap gap-2 pt-1.5">
              {times.map((timeStr) => (
                <div
                  key={timeStr}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/5 border border-accent/10 text-xs font-bold text-accent"
                >
                  {timeStr}
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(timeStr)}
                    className="hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Repeat day selectors chips */}
          <div className="space-y-2 pt-2 border-t border-border/10">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Repeat Days
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_SHORT.map((dayName, idx) => {
                const active = days.includes(idx)
                return (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none outline-none',
                      active
                        ? 'bg-accent/15 border-accent/20 text-accent font-extrabold'
                        : 'bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {dayName}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Message Field */}
          <div className="space-y-2 pt-2 border-t border-border/10">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5" /> Custom Reminder Message
            </label>
            <Input
              type="text"
              placeholder="e.g. Time for your Morning Loop."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="text-xs h-9"
              maxLength={80}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end select-none">
        {reminder && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(reminder.id)}
            disabled={isPending}
            className="font-bold text-xs h-9 cursor-pointer"
          >
            Delete Schedule
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className="font-bold text-xs h-9 flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="h-4 w-4" /> Save Reminders
        </Button>
      </div>
    </form>
  )
}
