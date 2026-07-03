'use client'

import React from 'react'
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isToday } from 'date-fns'
import { motion } from 'framer-motion'
import { CalendarDayData } from '../types'
import { cn } from '@/lib/utils'

interface WeekViewProps {
  weekStart: Date
  days: Record<string, CalendarDayData>
  selectedDate: string | null
  onSelectDate: (date: string) => void
  isLoading?: boolean
}

export function WeekView({ weekStart, days, selectedDate, onSelectDate, isLoading }: WeekViewProps) {
  const weekEnd = endOfWeek(startOfWeek(weekStart, { weekStartsOn: 0 }), { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({
    start: startOfWeek(weekStart, { weekStartsOn: 0 }),
    end: weekEnd,
  })

  return (
    <div className="grid grid-cols-7 gap-2 select-none">
      {weekDays.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const data = days[dateStr]
        const isTodayDate = isToday(date)
        const isSelected = selectedDate === dateStr
        const percentage = data?.percentage ?? 0

        const intensityClass =
          percentage === 0
            ? 'bg-muted/30'
            : percentage <= 25
              ? 'bg-green-900/30'
              : percentage <= 50
                ? 'bg-green-700/40'
                : percentage <= 75
                  ? 'bg-green-600/50'
                  : 'bg-green-500/60'

        return (
          <motion.button
            key={dateStr}
            type="button"
            onClick={() => onSelectDate(dateStr)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-3 cursor-pointer transition-all duration-200 focus:outline-none',
              isSelected
                ? 'border-accent ring-2 ring-accent/30 bg-accent/5'
                : 'border-border/40 hover:border-border/70 hover:bg-muted/30',
              isTodayDate && !isSelected ? 'border-accent/50' : ''
            )}
            aria-label={dateStr}
            aria-pressed={isSelected}
          >
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {format(date, 'EEE')}
            </span>
            <span
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold',
                isTodayDate ? 'bg-accent text-white' : 'text-foreground'
              )}
            >
              {format(date, 'd')}
            </span>

            {/* Completion bar */}
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div
              className={cn(
                'w-full h-6 rounded-md text-[9px] font-bold flex items-center justify-center text-foreground/70',
                intensityClass
              )}
            >
              {isLoading ? '...' : percentage > 0 ? `${percentage}%` : '—'}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
