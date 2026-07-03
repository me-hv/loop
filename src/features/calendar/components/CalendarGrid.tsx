'use client'

import React from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDay } from './CalendarDay'
import { CalendarDayData } from '../types'

interface CalendarGridProps {
  currentDate: Date
  days: Record<string, CalendarDayData>
  selectedDate: string | null
  onSelectDate: (date: string) => void
  isLoading?: boolean
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarGrid({
  currentDate,
  days,
  selectedDate,
  onSelectDate,
  isLoading,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="select-none" role="grid" aria-label={`Calendar for ${format(currentDate, 'MMMM yyyy')}`}>
      {/* Day-of-week header labels */}
      <div className="grid grid-cols-7 mb-2" role="row">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            role="columnheader"
            className="text-center text-[10px] sm:text-xs font-bold text-muted-foreground/60 uppercase tracking-wider py-2"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={format(currentDate, 'yyyy-MM')}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="grid grid-cols-7 gap-1 sm:gap-1.5"
          role="rowgroup"
        >
          {isLoading
            ? // Loading skeleton placeholders
              Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-muted/30 animate-pulse border border-border/20"
                />
              ))
            : allDays.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd')
                return (
                  <CalendarDay
                    key={dateStr}
                    dateStr={dateStr}
                    data={days[dateStr]}
                    isSelected={selectedDate === dateStr}
                    isCurrentMonth={isSameMonth(date, currentDate)}
                    onClick={onSelectDate}
                  />
                )
              })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
