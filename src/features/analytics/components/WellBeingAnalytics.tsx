'use client'

import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { MoodAnalyticsStats, DailyMoodDataPoint, MoodType } from '@/features/journal/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Smile, Flame, Target, Star, Tag, Info } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface WellBeingAnalyticsProps {
  stats: MoodAnalyticsStats
  trendData: DailyMoodDataPoint[]
  isLoading?: boolean
}

const EMOJI_MAP: Record<MoodType | 'none', string> = {
  excellent: '😁 Excellent',
  happy: '😊 Happy',
  neutral: '😐 Neutral',
  sad: '😔 Sad',
  stressed: '😣 Stressed',
  exhausted: '😴 Exhausted',
  none: '—',
}

export function WellBeingAnalytics({ stats, trendData, isLoading }: WellBeingAnalyticsProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const handle = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(handle)
  }, [])

  if (isLoading || !isMounted) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-border/30 bg-muted/10 h-24" />
          ))}
        </div>
        <Card className="border-border/30 bg-muted/10 h-[300px]" />
      </div>
    )
  }

  const isDark = theme === 'dark'
  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
  const textStroke = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  const summaryItems = [
    {
      label: 'Dominant Mood',
      value: EMOJI_MAP[stats.mostCommonMood],
      icon: Smile,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Avg Sleep Quality',
      value: `${stats.averageSleep} / 5`,
      icon: Star,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Avg Energy Level',
      value: `${stats.averageEnergy} / 5`,
      icon: Flame,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Avg Stress Level',
      value: `${stats.averageStress} / 5`,
      icon: Info,
      iconColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Total Logs',
      value: stats.totalEntries,
      icon: Target,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ]

  const sortedTags = Object.entries(stats.tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {summaryItems.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.label}
              className="border-border/40 bg-card/60 backdrop-blur-md hover:border-border/80 transition-colors shadow-sm select-none"
            >
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </span>
                  <div className={cn('p-1.5 rounded-lg flex items-center justify-center', item.bgColor)}>
                    <Icon className={cn('h-3.5 w-3.5', item.iconColor)} />
                  </div>
                </div>
                <div>
                  <span className="text-base font-extrabold text-foreground">{item.value}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Recharts line graph overlay (Sleep, energy, stress) */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md lg:col-span-2 select-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Mood & Well-being Trends</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Timeline overlay tracking energy, stress, and sleep qualities across past 15 logs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Need journal logs to plot well-being trends
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke={textStroke}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={textStroke}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="sleepQuality"
                      name="Sleep Quality"
                      stroke="#6366f1"
                      strokeWidth={2}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energyLevel"
                      name="Energy Level"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="stressLevel"
                      name="Stress Level"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Most common Tags list */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md select-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Reflection Tag Cloud</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Most frequent tags mentioned in your reflections
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {sortedTags.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground">
                No tags tracked yet
              </div>
            ) : (
              <div className="space-y-3.5 pt-2">
                {sortedTags.map(([tag, count]) => {
                  const percentage = Math.min(100, Math.round((count / stats.totalEntries) * 100))
                  return (
                    <div key={tag} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Tag className="h-3 w-3 text-cyan-500" />
                          {tag}
                        </span>
                        <span className="text-muted-foreground/75 font-bold">{count} times</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
