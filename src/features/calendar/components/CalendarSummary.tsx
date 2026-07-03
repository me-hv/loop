'use client'

import React from 'react'
import { TrendingUp, Flame, Trophy, CalendarCheck, Star, Zap } from 'lucide-react'
import { CalendarSummaryStats } from '../types'
import { cn } from '@/lib/utils'

interface CalendarSummaryProps {
  stats: CalendarSummaryStats | undefined
  isLoading?: boolean
}

const statItems = (stats: CalendarSummaryStats) => [
  {
    label: 'Total Completions',
    value: stats.totalCompletions.toLocaleString(),
    icon: CalendarCheck,
    iconClass: 'text-accent',
    bgClass: 'bg-accent/10',
  },
  {
    label: 'Current Streak',
    value: `${stats.currentStreak}d`,
    icon: Flame,
    iconClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10',
  },
  {
    label: 'Longest Streak',
    value: `${stats.longestStreak}d`,
    icon: Trophy,
    iconClass: 'text-yellow-500',
    bgClass: 'bg-yellow-500/10',
  },
  {
    label: 'Overall Rate',
    value: `${stats.overallPercentage}%`,
    icon: TrendingUp,
    iconClass: 'text-green-500',
    bgClass: 'bg-green-500/10',
  },
  {
    label: 'Best Month',
    value: stats.bestMonth ?? '—',
    icon: Star,
    iconClass: 'text-purple-500',
    bgClass: 'bg-purple-500/10',
    small: true,
  },
  {
    label: 'Most Active',
    value: stats.mostActiveDay ?? '—',
    icon: Zap,
    iconClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
    small: true,
  },
]

export function CalendarSummary({ stats, isLoading }: CalendarSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted/20 border border-border/30 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statItems(stats).map(({ label, value, icon: Icon, iconClass, bgClass, small }) => (
        <div
          key={label}
          className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-border/40 bg-card hover:border-border/70 transition-colors"
        >
          <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center', bgClass)}>
            <Icon className={cn('h-3.5 w-3.5', iconClass)} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">
              {label}
            </p>
            <p className={cn('font-extrabold text-foreground leading-none', small ? 'text-sm' : 'text-xl')}>
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
