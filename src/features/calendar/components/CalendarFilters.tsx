'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarFilters } from '../types'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Health', 'Fitness', 'Reading', 'Coding', 'Learning', 'Meditation', 'Finance', 'Business', 'Personal', 'Custom']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

interface CalendarFiltersProps {
  filters: CalendarFilters
  onUpdate: (updates: Partial<CalendarFilters>) => void
  onReset: () => void
}

const isActive = (arr: string[], val: string) => arr.includes(val)

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer select-none',
        active
          ? 'bg-accent text-white border-accent'
          : 'bg-muted/30 text-muted-foreground border-border/40 hover:border-border hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

function ToggleChip({
  label,
  active,
  onClick,
  activeClass,
}: {
  label: string
  active: boolean
  onClick: () => void
  activeClass?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer select-none',
        active
          ? (activeClass ?? 'bg-green-500/15 text-green-500 border-green-500/40')
          : 'bg-muted/30 text-muted-foreground border-border/40 hover:border-border hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

export function CalendarFiltersBar({ filters, onUpdate, onReset }: CalendarFiltersProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.difficulties.length > 0 ||
    !filters.showCompleted ||
    !filters.showMissed ||
    filters.showArchived

  const toggleCategory = (cat: string) => {
    const next = isActive(filters.categories, cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    onUpdate({ categories: next })
  }

  const toggleDifficulty = (diff: string) => {
    const lower = diff.toLowerCase()
    const next = isActive(filters.difficulties, lower)
      ? filters.difficulties.filter((d) => d !== lower)
      : [...filters.difficulties, lower]
    onUpdate({ difficulties: next })
  }

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border/40 bg-muted/10">
      {/* Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-14 flex-shrink-0">
          Status
        </span>
        <ToggleChip
          label="✅ Completed"
          active={filters.showCompleted}
          onClick={() => onUpdate({ showCompleted: !filters.showCompleted })}
          activeClass="bg-green-500/15 text-green-600 border-green-500/40"
        />
        <ToggleChip
          label="❌ Missed"
          active={filters.showMissed}
          onClick={() => onUpdate({ showMissed: !filters.showMissed })}
          activeClass="bg-destructive/10 text-destructive border-destructive/30"
        />
        <ToggleChip
          label="📦 Archived"
          active={filters.showArchived}
          onClick={() => onUpdate({ showArchived: !filters.showArchived })}
          activeClass="bg-muted text-muted-foreground border-border"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-14 flex-shrink-0">
          Category
        </span>
        {CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            active={isActive(filters.categories, cat)}
            onClick={() => toggleCategory(cat)}
          />
        ))}
      </div>

      {/* Difficulty Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-14 flex-shrink-0">
          Level
        </span>
        {DIFFICULTIES.map((diff) => (
          <FilterChip
            key={diff}
            label={diff}
            active={isActive(filters.difficulties, diff.toLowerCase())}
            onClick={() => toggleDifficulty(diff)}
          />
        ))}
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
        >
          <X className="h-3 w-3" />
          Reset filters
        </Button>
      )}
    </div>
  )
}
