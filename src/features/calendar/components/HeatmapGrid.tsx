'use client'

import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { HeatmapCell, HeatmapIntensity } from '../types'
import { cn } from '@/lib/utils'

interface HeatmapGridProps {
  cells: HeatmapCell[]
  isLoading?: boolean
}

const INTENSITY_CLASSES: Record<HeatmapIntensity, string> = {
  0: 'bg-muted/40 border-border/20',
  1: 'bg-green-900/50 border-green-900/30',
  2: 'bg-green-700/60 border-green-700/40',
  3: 'bg-green-500/80 border-green-500/50',
  4: 'bg-green-400 border-green-400/80',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

interface TooltipState {
  cell: HeatmapCell
  x: number
  y: number
}

// Groups cells into columns of 7 (one per week)
function groupIntoWeeks(cells: HeatmapCell[]): HeatmapCell[][] {
  const weeks: HeatmapCell[][] = []
  let week: HeatmapCell[] = []

  // Pad leading days so first day aligns with its correct day-of-week
  if (cells.length > 0) {
    const firstDate = parseISO(cells[0].date)
    const dayOfWeek = firstDate.getDay() // 0 = Sun
    for (let i = 0; i < dayOfWeek; i++) {
      week.push({ date: '', percentage: 0, completedCount: 0, totalCount: 0, intensity: 0 })
    }
  }

  for (const cell of cells) {
    week.push(cell)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    weeks.push(week)
  }
  return weeks
}

// Extracts month label positions for the header
function getMonthLabels(weeks: HeatmapCell[][]): { label: string; colIndex: number }[] {
  const labels: { label: string; colIndex: number }[] = []
  let lastMonth = -1

  weeks.forEach((week, colIdx) => {
    const firstReal = week.find((c) => c.date !== '')
    if (!firstReal) return
    const m = parseISO(firstReal.date).getMonth()
    if (m !== lastMonth) {
      labels.push({ label: MONTHS[m], colIndex: colIdx })
      lastMonth = m
    }
  })

  return labels
}

export function HeatmapGrid({ cells, isLoading }: HeatmapGridProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const weeks = groupIntoWeeks(cells)
  const monthLabels = getMonthLabels(weeks)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted/40 rounded animate-pulse" />
        <div className="flex gap-0.5">
          {Array.from({ length: 53 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="h-3 w-3 rounded-sm bg-muted/30 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-x-auto pb-2">
      {/* Month labels row */}
      <div className="relative mb-1 flex" style={{ paddingLeft: '28px' }}>
        {monthLabels.map(({ label, colIndex }) => (
          <span
            key={`${label}-${colIndex}`}
            className="absolute text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider select-none"
            style={{ left: `${28 + colIndex * 13}px` }}
          >
            {label}
          </span>
        ))}
        <div className="h-3" />
      </div>

      <div className="flex gap-0">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-0.5 mr-1 pt-0.5">
          {DAYS.map((d, i) => (
            <div
              key={i}
              className="h-3 w-6 text-[8px] font-bold text-muted-foreground/60 flex items-center justify-end pr-1 select-none"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid columns (weeks) */}
        <div className="flex gap-0.5">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-0.5">
              {week.map((cell, dayIdx) => {
                if (!cell.date) {
                  return <div key={dayIdx} className="h-3 w-3" />
                }
                return (
                  <div
                    key={cell.date}
                    role="gridcell"
                    aria-label={
                      cell.date
                        ? `${format(parseISO(cell.date), 'MMM d, yyyy')}: ${cell.completedCount}/${cell.totalCount} habits (${cell.percentage}%)`
                        : ''
                    }
                    tabIndex={0}
                    className={cn(
                      'h-3 w-3 rounded-sm border cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-accent hover:ring-offset-1 hover:ring-offset-background focus:outline-none focus:ring-1 focus:ring-accent',
                      INTENSITY_CLASSES[cell.intensity]
                    )}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTooltip({
                        cell,
                        x: rect.left + window.scrollX,
                        y: rect.top + window.scrollY,
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onFocus={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTooltip({
                        cell,
                        x: rect.left + window.scrollX,
                        y: rect.top + window.scrollY,
                      })
                    }}
                    onBlur={() => setTooltip(null)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-lg bg-popover border border-border shadow-lg text-[11px] font-medium pointer-events-none"
          style={{
            left: tooltip.x - 60,
            top: tooltip.y - 52,
          }}
        >
          <div className="font-bold text-foreground">
            {format(parseISO(tooltip.cell.date), 'MMM d, yyyy')}
          </div>
          <div className="text-muted-foreground">
            {tooltip.cell.completedCount} of {tooltip.cell.totalCount} habits &mdash;{' '}
            <span className="text-green-400 font-bold">{tooltip.cell.percentage}%</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 select-none">
        <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">Less</span>
        {([0, 1, 2, 3, 4] as HeatmapIntensity[]).map((level) => (
          <div key={level} className={cn('h-3 w-3 rounded-sm border', INTENSITY_CLASSES[level])} />
        ))}
        <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">More</span>
      </div>
    </div>
  )
}
