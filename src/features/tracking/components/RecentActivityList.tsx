'use client'

import React from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useActivityLog } from '../hooks/use-tracking'
import { getHabitColor, getHabitIcon } from '@/features/habits/utils/icons'
import { Check, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatRelativeTime(dateStr: string): string {
  const time = new Date(dateStr).getTime()
  const diff = Date.now() - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function RecentActivityList() {
  const user = useAuthStore((state) => state.user)
  const { activityLog = [], isLoading } = useActivityLog(user?.uid)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 items-center animate-pulse">
            <div className="h-8 w-8 bg-muted/30 rounded-full" />
            <div className="space-y-1.5 w-full">
              <div className="h-3.5 bg-muted/30 rounded w-1/2" />
              <div className="h-2.5 bg-muted/30 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activityLog.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground select-none">
        No recent activities recorded. Complete a routine to begin.
      </div>
    )
  }

  return (
    <div className="relative pl-4 space-y-5 border-l border-border/40 select-none">
      {activityLog.map((log) => {
        const IconComponent = getHabitIcon(log.icon)
        const colorPreset = getHabitColor(log.color)

        return (
          <div key={log.id} className="relative flex items-start gap-3 text-xs group">
            {/* Timeline node marker */}
            <div
              className={cn(
                'absolute -left-[23px] top-0 h-4.5 w-4.5 rounded-full border border-card flex items-center justify-center shadow-sm text-white',
                colorPreset.bgClass
              )}
            >
              <Check className="h-2.5 w-2.5 stroke-[3px]" />
            </div>

            {/* Content card */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                Completed <strong className={cn('font-bold', colorPreset.textClass)}>{log.habitTitle}</strong>
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                <span className="capitalize">{log.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatRelativeTime(log.completedAt)}
                </span>
              </div>
            </div>

            {/* Miniature category icon bubble */}
            <div className={cn('p-1.5 rounded-md border shrink-0', colorPreset.bgClass, colorPreset.borderClass, colorPreset.textClass)}>
              {React.createElement(IconComponent, { className: 'h-3.5 w-3.5' })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
