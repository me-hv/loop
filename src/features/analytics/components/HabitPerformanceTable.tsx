'use client'

import React, { useState, useMemo } from 'react'
import { HabitPerformanceItem } from '../types'
import { getHabitColor, getHabitIcon } from '@/features/habits/utils/icons'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowUpRight, ArrowDownRight, Minus, Flame, Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HabitPerformanceTableProps {
  performance: HabitPerformanceItem[]
}

type SortField = 'rate' | 'completions' | 'streak'
type SortOrder = 'asc' | 'desc'

export function HabitPerformanceTable({ performance }: HabitPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>('rate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const sortedPerformance = useMemo(() => {
    return [...performance].sort((a, b) => {
      let valA = 0
      let valB = 0

      switch (sortField) {
        case 'rate':
          valA = a.completionRate
          valB = b.completionRate
          break
        case 'completions':
          valA = a.totalCompletions
          valB = b.totalCompletions
          break
        case 'streak':
          valA = a.currentStreak
          valB = b.currentStreak
          break
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB
    })
  }, [performance, sortField, sortOrder])

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-md">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">Habit Consistency Leaderboard</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Breakdown of success rates and streak records per routine
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground/75 font-semibold text-[10px] uppercase tracking-wider">
                <th className="p-4 pl-6 font-bold">Habit</th>
                <th
                  className="p-4 font-bold cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('rate')}
                >
                  <div className="flex items-center gap-1">
                    Success Rate
                    {sortField === 'rate' && (sortOrder === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
                  </div>
                </th>
                <th
                  className="p-4 font-bold cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('completions')}
                >
                  <div className="flex items-center gap-1">
                    Completions
                    {sortField === 'completions' && (sortOrder === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
                  </div>
                </th>
                <th
                  className="p-4 font-bold cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('streak')}
                >
                  <div className="flex items-center gap-1">
                    Streaks (Curr/Max)
                    {sortField === 'streak' && (sortOrder === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="p-4 font-bold hidden md:table-cell">Past Week / Month</th>
                <th className="p-4 pr-6 font-bold text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {sortedPerformance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
                    No habit performance metrics to display
                  </td>
                </tr>
              ) : (
                sortedPerformance.map((item) => {
                  const colorPreset = getHabitColor(item.color)
                  const IconComp = getHabitIcon(item.icon)
                  const isHighRate = item.completionRate >= 75
                  const isLowRate = item.completionRate < 40

                  return (
                    <tr
                      key={item.habitId}
                      className="border-b border-border/20 hover:bg-muted/10 transition-colors group"
                    >
                      {/* 1. Habit Title */}
                      <td className="p-4 pl-6 flex items-center gap-3 min-w-[160px]">
                        <div
                          className={cn(
                            'h-7.5 w-7.5 rounded-lg flex items-center justify-center border shrink-0',
                            colorPreset.bgClass,
                            colorPreset.borderClass,
                            colorPreset.textClass
                          )}
                        >
                          {React.createElement(IconComp, { className: 'h-3.5 w-3.5' })}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                            {item.habitTitle}
                          </p>
                          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">
                            {item.category}
                          </span>
                        </div>
                      </td>

                      {/* 2. Success Rate */}
                      <td className="p-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'font-bold min-w-[32px]',
                              isHighRate ? 'text-success' : isLowRate ? 'text-destructive' : 'text-foreground'
                            )}
                          >
                            {item.completionRate}%
                          </span>
                          <Progress
                            value={item.completionRate}
                            className="h-1.5 w-16 bg-muted [&>div]:bg-success"
                          />
                        </div>
                      </td>

                      {/* 3. Total Completions / Missed */}
                      <td className="p-4 text-muted-foreground">
                        <span className="font-bold text-foreground">{item.totalCompletions}</span>
                        <span className="text-[10px]"> / {item.missedDays} missed</span>
                      </td>

                      {/* 4. Streaks */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold">
                            <Flame className="h-3 w-3 fill-orange-500/10" />
                            <span>{item.currentStreak}d</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold">
                            <Trophy className="h-3 w-3" />
                            <span>{item.longestStreak}d</span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Weekly/Monthly Comparison */}
                      <td className="p-4 hidden md:table-cell text-muted-foreground text-[10px]">
                        <span className="font-semibold text-foreground">{item.weeklyRate}%</span> wk
                        <span className="mx-1">•</span>
                        <span className="font-semibold text-foreground">{item.monthlyRate}%</span> mo
                      </td>

                      {/* 6. Trend Badge */}
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center justify-end">
                          {item.trend === 'up' ? (
                            <div className="h-5 w-5 rounded-md bg-green-500/10 flex items-center justify-center text-green-500" title="Consistent Improvement">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </div>
                          ) : item.trend === 'down' ? (
                            <div className="h-5 w-5 rounded-md bg-destructive/10 flex items-center justify-center text-destructive" title="Success Rate Slipping">
                              <ArrowDownRight className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground" title="Stable Routine">
                              <Minus className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
