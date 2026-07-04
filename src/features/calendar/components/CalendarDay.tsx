'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isFuture, parseISO } from 'date-fns'
import { CalendarDayData } from '../types'
import { cn } from '@/lib/utils'

interface CalendarDayProps {
  dateStr: string
  data: CalendarDayData | undefined
  isSelected: boolean
  isCurrentMonth: boolean
  onClick: (date: string) => void
}

function CompletionRing({ percentage, size = 28 }: { percentage: number; size?: number }) {
  const radius = (size - 4) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const color =
    percentage === 0
      ? 'var(--muted-foreground)'
      : percentage <= 25
        ? '#86efac'
        : percentage <= 50
          ? '#4ade80'
          : percentage <= 75
            ? '#16a34a'
            : '#15803d'

  return (
    <svg width={size} height={size} className="absolute top-1.5 right-1.5 opacity-80" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-muted/40"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

export function CalendarDay({
  dateStr,
  data,
  isSelected,
  isCurrentMonth,
  onClick,
}: CalendarDayProps) {
  const dateObj = parseISO(dateStr)
  const dayNum = format(dateObj, 'd')
  const isTodayDate = isToday(dateObj)
  const isFutureDate = isFuture(dateObj)
  const hasActivity = data?.hasActivity ?? false
  const percentage = data?.percentage ?? 0
  const completedCount = data?.completedCount ?? 0
  const totalCount = data?.totalCount ?? 0

  return (
    <motion.button
      type="button"
      onClick={() => !isFutureDate && onClick(dateStr)}
      disabled={isFutureDate}
      whileHover={!isFutureDate ? { scale: 1.03 } : undefined}
      whileTap={!isFutureDate ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'relative w-full aspect-[1/1.1] sm:aspect-square rounded-xl border text-left flex flex-col p-1.5 sm:p-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group',
        // Base states
        isCurrentMonth ? 'bg-card' : 'bg-muted/20',
        isFutureDate ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer',
        // Selected
        isSelected
          ? 'border-accent ring-2 ring-accent/30 bg-accent/5'
          : 'border-border/40 hover:border-border/80 hover:bg-muted/50',
        // Today highlight
        isTodayDate && !isSelected ? 'border-accent/50 bg-accent/5' : '',
        // No current month dimming
        !isCurrentMonth && 'text-muted-foreground/50'
      )}
      aria-label={`${dateStr}${hasActivity ? `, ${completedCount} of ${totalCount} habits` : ''}`}
      aria-pressed={isSelected}
    >
      {/* Day number & Journal indicator */}
      <div className="flex items-center justify-between w-full select-none">
        <div
          className={cn(
            'text-[11px] sm:text-xs font-bold leading-none',
            isTodayDate
              ? 'text-accent'
              : isCurrentMonth
                ? 'text-foreground'
                : 'text-muted-foreground/50'
          )}
        >
          {isTodayDate ? (
            <span className="inline-flex items-center justify-center h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full bg-accent text-white text-[10px] font-black">
              {dayNum}
            </span>
          ) : (
            dayNum
          )}
        </div>
        {isCurrentMonth && !isFutureDate && data?.hasJournal && (
          <span className="text-[10px]" title="Journal logged">📝</span>
        )}
      </div>

      {/* Completion percentage ring (hidden on tiny cells) */}
      {isCurrentMonth && !isFutureDate && totalCount > 0 && (
        <CompletionRing percentage={percentage} size={22} />
      )}

      {/* Bottom: completion dots / percentage */}
      {isCurrentMonth && !isFutureDate && hasActivity && (
        <div className="mt-auto flex items-center gap-0.5">
          {Array.from({ length: Math.min(completedCount, 5) }).map((_, i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-green-500 flex-shrink-0"
              aria-hidden
            />
          ))}
          {totalCount > 0 && (
            <span className="ml-auto text-[8px] sm:text-[9px] font-bold text-muted-foreground/70 select-none">
              {percentage}%
            </span>
          )}
        </div>
      )}
    </motion.button>
  )
}
