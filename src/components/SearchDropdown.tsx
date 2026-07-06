import React from 'react'
import { SearchResult } from '@/services/searchService'
import { SearchResultItem } from './SearchResultItem'
import { AlertTriangle, CornerDownLeft, Loader2, ArrowUp, ArrowDown } from 'lucide-react'

interface SearchDropdownProps {
  results: SearchResult[]
  query: string
  selectedIndex: number
  isSearching: boolean
  searchError: string | null
  onItemClick: (result: SearchResult) => void
}

export function SearchDropdown({
  results,
  query,
  selectedIndex,
  isSearching,
  searchError,
  onItemClick,
}: SearchDropdownProps) {
  if (isSearching) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 text-accent animate-spin" />
        <span className="text-xs text-muted-foreground">Searching...</span>
      </div>
    )
  }

  if (searchError) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center gap-3 text-destructive">
        <AlertTriangle className="h-6 w-6" />
        <span className="text-xs font-semibold">{searchError}</span>
      </div>
    )
  }

  if (query && results.length === 0) {
    return (
      <div className="p-10 text-center space-y-2 select-none">
        <AlertTriangle className="h-7 w-7 text-muted-foreground opacity-30 mx-auto" />
        <h4 className="text-xs font-bold text-foreground">No results found.</h4>
        <p className="text-[10px] text-muted-foreground">Try another keyword.</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="p-8 text-center select-none text-[10px] text-muted-foreground leading-normal max-w-xs mx-auto">
        Type a query to search across habits, journal, calendar schedules, coaching history, settings, and achievements.
      </div>
    )
  }

  // Group flat results by category
  const categories = Array.from(new Set(results.map((r) => r.category)))

  return (
    <div className="flex flex-col h-full max-h-[380px] md:max-h-[460px]">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {categories.map((category) => {
          const catItems = results.filter((r) => r.category === category)
          return (
            <div key={category} className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground px-2 block select-none">
                {category}
              </span>
              <div className="space-y-1">
                {catItems.map((result) => {
                  const flatIndex = results.indexOf(result)
                  return (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      query={query}
                      isSelected={flatIndex === selectedIndex}
                      onClick={() => onItemClick(result)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Keyboard shortcuts footer guide */}
      <div className="p-2.5 border-t border-border/10 bg-muted/20 shrink-0 flex items-center justify-between text-[9px] font-bold text-muted-foreground select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3 bg-card border border-border rounded px-0.5" />
            <ArrowDown className="h-3 w-3 bg-card border border-border rounded px-0.5" />
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3 bg-card border border-border rounded px-0.5" />
            Open
          </span>
        </div>
        <span>ESC to close</span>
      </div>
    </div>
  )
}
