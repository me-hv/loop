'use client'

import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { TrendDataPoint, WeekdayDataPoint } from '../types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTheme } from 'next-themes'

// Tailwind HSL color maps matching our premium design system
const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
]

interface ChartsProps {
  trendData: TrendDataPoint[]
  categoryDistribution: { name: string; value: number }[]
  weekdayStats: WeekdayDataPoint[]
}

export function Charts({ trendData, categoryDistribution, weekdayStats }: ChartsProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const handle = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(handle)
  }, [])

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const isDark = theme === 'dark'
  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
  const textStroke = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Completion Rate Trend Area Chart */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground">Completion Rate Trend</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Daily activity rates across your scheduled habits
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Weekday Performance Bar Chart */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground">Activity by Weekday</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Comparison of completion rates across different days of the week
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="dayName"
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
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                />
                <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {weekdayStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.rate > 70 ? '#10b981' : entry.rate > 40 ? '#6366f1' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Category Distribution Donut Chart */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground">Category Distribution</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Number of total completions segmented by habit category
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 flex items-center justify-center">
          {categoryDistribution.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground">
              No category data available
            </div>
          ) : (
            <div className="h-[250px] w-full flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="h-[180px] w-[180px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[180px] pr-2">
                {categoryDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate max-w-[100px]">{entry.name}</span>
                    <span className="font-bold text-foreground ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
