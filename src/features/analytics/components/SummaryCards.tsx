'use client'

import React from 'react'
import {
  Flame,
  Trophy,
  TrendingUp,
  CheckCircle2,
  CalendarCheck,
  Star,
  Zap,
  Target,
} from 'lucide-react'
import { AnalyticsSummary } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  summary: AnalyticsSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const items = [
    {
      label: 'Current Streak',
      value: `${summary.currentStreak} days`,
      icon: Flame,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      description: 'Consecutive active tracking',
    },
    {
      label: 'Longest Streak',
      value: `${summary.longestStreak} days`,
      icon: Trophy,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: 'Your all-time record run',
    },
    {
      label: 'Overall Rate',
      value: `${summary.overallCompletionRate}%`,
      icon: TrendingUp,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      description: 'Lifetime completion percentage',
    },
    {
      label: 'Total Completed',
      value: summary.totalCompletions.toLocaleString(),
      icon: CheckCircle2,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      description: 'Completed habit check-ins',
    },
    {
      label: 'Perfect Days',
      value: `${summary.perfectDaysCount} days`,
      icon: Star,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Days with 100% completions',
    },
    {
      label: 'Avg Daily Check-ins',
      value: summary.averageDailyCompletion,
      icon: Zap,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Average completed per day',
    },
    {
      label: 'Active Habits',
      value: summary.activeHabitsCount,
      icon: CalendarCheck,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      description: 'Currently tracked habits',
    },
    {
      label: 'This Month',
      value: `${summary.currentMonthProgress}%`,
      icon: Target,
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      description: 'Current month success rate',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card
            key={item.label}
            className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border/80 transition-colors shadow-sm select-none"
          >
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
                <div className={cn('p-1.5 rounded-lg flex items-center justify-center', item.bgColor)}>
                  <Icon className={cn('h-3.5 w-3.5', item.iconColor)} />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold text-foreground">{item.value}</span>
                <p className="text-[9px] text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
