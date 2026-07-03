'use client'

import React from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarView } from '../types'
import { cn } from '@/lib/utils'

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onPrevMonth: () => void
  onNextMonth: () => void
  onPrevWeek: () => void
  onNextWeek: () => void
  onGoToToday: () => void
  onViewChange: (view: CalendarView) => void
}

export function CalendarHeader({
  currentDate,
  view,
  onPrevMonth,
  onNextMonth,
  onPrevWeek,
  onNextWeek,
  onGoToToday,
  onViewChange,
}: CalendarHeaderProps) {
  const isMonth = view === 'month'

  const handlePrev = isMonth ? onPrevMonth : onPrevWeek
  const handleNext = isMonth ? onNextMonth : onNextWeek

  const title =
    view === 'month'
      ? format(currentDate, 'MMMM yyyy')
      : view === 'week'
        ? `Week of ${format(currentDate, 'MMM d, yyyy')}`
        : format(currentDate, 'EEEE, MMMM d, yyyy')

  const viewOptions: { label: string; value: CalendarView; icon: React.ElementType }[] = [
    { label: 'Month', value: 'month', icon: LayoutGrid },
    { label: 'Week', value: 'week', icon: CalendarDays },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Left: navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="h-8 w-8 rounded-lg border-border/60 hover:bg-muted cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="h-8 w-8 rounded-lg border-border/60 hover:bg-muted cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground select-none min-w-[180px]">
          {title}
        </h2>
      </div>

      {/* Right: view switcher + today */}
      <div className="flex items-center gap-2">
        {/* View Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border/40">
          {viewOptions.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onViewChange(value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer select-none',
                view === value
                  ? 'bg-card text-foreground shadow-sm border border-border/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
              aria-pressed={view === value}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onGoToToday}
          className="h-8 text-xs font-semibold border-border/60 hover:bg-accent hover:text-white hover:border-accent transition-all cursor-pointer gap-1.5"
        >
          <CalendarCheck className="h-3.5 w-3.5" />
          Today
        </Button>
      </div>
    </div>
  )
}
