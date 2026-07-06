import React from 'react'
import { SearchResult } from '@/services/searchService'
import * as Icons from 'lucide-react'
import { highlightText } from '@/utils/searchHelpers'

interface SearchResultItemProps {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
  query: string
}

export function SearchResultItem({ result, isSelected, onClick, query }: SearchResultItemProps) {
  const IconsMap = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  const IconComponent = IconsMap[result.icon] || Icons.HelpCircle

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-150 cursor-pointer select-none border text-left ${
        isSelected
          ? 'bg-accent/15 border-accent/25 text-accent shadow-xs scale-[1.01]'
          : 'bg-card/40 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
      }`}
    >
      <div
        className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
          isSelected
            ? 'bg-accent/20 border-accent/35 text-accent'
            : 'bg-muted border-border text-muted-foreground'
        }`}
      >
        <IconComponent className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-foreground">
            {highlightText(result.title, query)}
          </span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
            {result.category}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-normal truncate">
          {highlightText(result.preview, query)}
        </p>
      </div>
    </div>
  )
}
