'use client'

import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CalendarSearch({
  value,
  onChange,
  placeholder = 'Search activity history...',
}: CalendarSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-9 pl-8 pr-8 rounded-lg border border-border/50 bg-muted/20 text-sm text-foreground placeholder:text-muted-foreground/50',
          'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-all'
        )}
        aria-label="Search activity history"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
