'use client'

import React, { useState } from 'react'
import { Plus, X, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface TagSelectorProps {
  value: string[]
  onChange: (tags: string[]) => void
}

const PRESET_TAGS = ['Gym', 'Reading', 'Coding', 'Travel', 'Work', 'Family', 'Study', 'Health']

export function TagSelector({ value, onChange }: TagSelectorProps) {
  const [customTag, setCustomTag] = useState('')

  const handleTogglePreset = (tag: string) => {
    const nextTags = value.includes(tag)
      ? value.filter((t) => t !== tag)
      : [...value, tag]
    onChange(nextTags)
  }

  const handleAddCustom = () => {
    const trimmed = customTag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setCustomTag('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustom()
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove))
  }

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center gap-1.5">
        <Tag className="h-4 w-4 text-cyan-500" />
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Tags & Activities
        </label>
      </div>

      {/* Preset Tags Grid */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_TAGS.map((tag) => {
          const isSelected = value.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTogglePreset(tag)}
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer',
                isSelected
                  ? 'bg-accent text-white border-accent'
                  : 'bg-muted/30 text-muted-foreground border-border/40 hover:border-border hover:text-foreground'
              )}
            >
              {tag}
            </button>
          )
        })}
      </div>

      {/* Custom Tag Input + list */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add custom tag (e.g. Cooking, Gaming)..."
            className="h-8 text-xs border-border/40 bg-card/40 focus-visible:ring-cyan-500/30 focus-visible:border-cyan-500 max-w-[280px]"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="px-2.5 h-8 rounded-lg border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Display custom added tags if they aren't presets */}
        {value.filter((t) => !PRESET_TAGS.includes(t)).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {value
              .filter((t) => !PRESET_TAGS.includes(t))
              .map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-500/10 text-cyan-600 border border-cyan-500/20"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-cyan-600/60 hover:text-cyan-700 cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
