'use client'

import React from 'react'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { ActivityLogItem } from '@/features/tracking/types'
import { getHabitColor, getHabitIcon } from '@/features/habits/utils/icons'
import { cn } from '@/lib/utils'

interface ActivityTimelineProps {
  activities: ActivityLogItem[]
  isLoading?: boolean
  searchQuery?: string
}

export function ActivityTimeline({ activities, isLoading, searchQuery = '' }: ActivityTimelineProps) {
  const filtered = searchQuery
    ? activities.filter((a) => a.habitTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    : activities

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted/40 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted/40 rounded w-2/3" />
              <div className="h-2 bg-muted/30 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        {searchQuery ? 'No activity matches your search.' : 'No activity yet.'}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border/40" aria-hidden />

      <div className="space-y-1">
        {filtered.map((item, index) => {
          const colorPreset = getHabitColor(item.color)
          const IconComp = getHabitIcon(item.icon)
          const isCompleted = item.action === 'completed'
          const relativeTime = formatDistanceToNow(parseISO(item.completedAt), { addSuffix: true })
          const exactTime = format(parseISO(item.completedAt), 'MMM d, h:mm a')

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="relative flex items-start gap-3 pl-1 group"
            >
              {/* Timeline node */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={cn(
                    'h-7 w-7 rounded-full border-2 flex items-center justify-center',
                    isCompleted
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-muted-foreground/30 bg-muted/30'
                  )}
                >
                  {React.createElement(IconComp, {
                    className: cn('h-3 w-3', colorPreset.textClass),
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {isCompleted ? '✅' : '❌'} {item.habitTitle}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{item.category}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className="text-[9px] font-medium text-muted-foreground/60"
                      title={exactTime}
                    >
                      {relativeTime}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
