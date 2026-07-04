'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { MoodType } from '../types'
import { cn } from '@/lib/utils'

interface MoodSelectorProps {
  value: MoodType | undefined
  onChange: (value: MoodType) => void
}

interface MoodOption {
  value: MoodType
  emoji: string
  label: string
  bgClass: string
  borderClass: string
  glowColor: string
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 'excellent',
    emoji: '😁',
    label: 'Excellent',
    bgClass: 'bg-green-500/10 hover:bg-green-500/20 text-green-500',
    borderClass: 'border-green-500/30',
    glowColor: 'shadow-green-500/10',
  },
  {
    value: 'happy',
    emoji: '😊',
    label: 'Happy',
    bgClass: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500',
    borderClass: 'border-indigo-500/30',
    glowColor: 'shadow-indigo-500/10',
  },
  {
    value: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    bgClass: 'bg-slate-500/10 hover:bg-slate-500/20 text-slate-500',
    borderClass: 'border-slate-500/30',
    glowColor: 'shadow-slate-500/10',
  },
  {
    value: 'sad',
    emoji: '😔',
    label: 'Sad',
    bgClass: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500',
    borderClass: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/10',
  },
  {
    value: 'stressed',
    emoji: '😣',
    label: 'Stressed',
    bgClass: 'bg-destructive/10 hover:bg-destructive/20 text-destructive',
    borderClass: 'border-destructive/30',
    glowColor: 'shadow-destructive/10',
  },
  {
    value: 'exhausted',
    emoji: '😴',
    label: 'Exhausted',
    bgClass: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500',
    borderClass: 'border-orange-500/30',
    glowColor: 'shadow-orange-500/10',
  },
]

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
        How is your mood?
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {MOOD_OPTIONS.map((opt) => {
          const isSelected = value === opt.value

          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                'relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer select-none focus:outline-none shadow-sm',
                isSelected
                  ? cn('border-accent ring-2 ring-accent/30 bg-accent/5', opt.glowColor)
                  : 'border-border/40 bg-card hover:border-border/80'
              )}
            >
              <span className="text-2xl mb-1.5 filter drop-shadow-sm select-none">{opt.emoji}</span>
              <span
                className={cn(
                  'text-[10px] font-bold tracking-tight',
                  isSelected ? 'text-foreground font-black' : 'text-muted-foreground/80'
                )}
              >
                {opt.label}
              </span>

              {/* Checkmark bubble */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-accent flex items-center justify-center border border-background shadow-sm text-white">
                  <Check className="h-2.5 w-2.5 stroke-[3px]" />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
