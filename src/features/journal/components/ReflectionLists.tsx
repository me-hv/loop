'use client'

import React, { useState } from 'react'
import { Plus, X, ArrowRight, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// ─── 1. Gratitude List (Exactly 3 slots) ──────────────────────────────────────
interface GratitudeInputsProps {
  items: string[]
  onChange: (items: string[]) => void
}

export function GratitudeInputs({ items, onChange }: GratitudeInputsProps) {
  const handleSlotChange = (idx: number, val: string) => {
    const newItems = [...items]
    while (newItems.length <= idx) {
      newItems.push('')
    }
    newItems[idx] = val
    // Filter trailing empty strings to keep list clean
    onChange(newItems)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 select-none">
        <Heart className="h-4 w-4 text-pink-500 fill-pink-500/10" />
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Gratitude (List 3 things you are thankful for)
        </label>
      </div>
      <div className="space-y-2.5">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground/60 select-none w-4">
              {idx + 1}.
            </span>
            <Input
              type="text"
              value={items[idx] || ''}
              onChange={(e) => handleSlotChange(idx, e.target.value)}
              placeholder={`I am grateful for...`}
              className="h-9 text-xs border-border/40 focus-visible:ring-pink-500/30 focus-visible:border-pink-500 bg-card/40"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 2. Wins and Challenges Bullet List Editors ─────────────────────────────
interface BulletListEditorProps {
  title: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
  icon: React.ReactNode
  accentColor: string
  ringColor: string
}

export function BulletListEditor({
  title,
  items,
  onChange,
  placeholder,
  icon,
  accentColor,
  ringColor,
}: BulletListEditorProps) {
  const [inputVal, setInputVal] = useState('')

  const handleAdd = () => {
    const trimmed = inputVal.trim()
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed])
      setInputVal('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleRemove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 select-none">
        {icon}
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </label>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn('h-9 text-xs border-border/40 bg-card/40', ringColor)}
        />
        <button
          type="button"
          onClick={handleAdd}
          className={cn(
            'px-3 rounded-lg border border-border/40 flex items-center justify-center cursor-pointer transition-colors',
            accentColor
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {items.length > 0 && (
        <ul className="space-y-1.5 pt-1 pl-1">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-3 text-xs text-foreground group bg-muted/20 border border-border/30 rounded-lg p-2"
            >
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span className="leading-tight">{item}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-muted-foreground/50 hover:text-destructive cursor-pointer transition-colors pt-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── 3. Tomorrow's Focus Reflection Card ──────────────────────────────────────
interface TomorrowFocusProps {
  value: string
  onChange: (val: string) => void
}

export function TomorrowFocus({ value, onChange }: TomorrowFocusProps) {
  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center gap-1.5">
        <ArrowRight className="h-4 w-4 text-purple-500" />
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Tomorrow&apos;s Focus (What is the primary target for tomorrow?)
        </label>
      </div>
      <Card className="border-border/40 bg-card/40 backdrop-blur-md">
        <CardContent className="p-3">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Focus on finishing loop design, workout, family time..."
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-xs resize-none h-16 min-h-[64px] placeholder:text-muted-foreground/50 leading-relaxed"
          />
        </CardContent>
      </Card>
    </div>
  )
}
