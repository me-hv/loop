'use client'

import React, { useState } from 'react'
import { AchievementItem, AchievementCategory } from '../types'
import { AchievementCard } from './AchievementCard'
import { cn } from '@/lib/utils'

interface BadgeGridProps {
  achievements: AchievementItem[]
}

export function BadgeGrid({ achievements }: BadgeGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'All'>('All')

  const categories: (AchievementCategory | 'All')[] = [
    'All',
    'Consistency',
    'Streaks',
    'Habits',
    'Journal',
    'Milestones',
  ]

  const filtered = achievements.filter(
    (a) => selectedCategory === 'All' || a.category === selectedCategory
  )

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="space-y-5">
      {/* 1. Header with unlock progress badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Achievements & Badges
        </h3>
        <span className="text-[10px] font-bold text-accent bg-accent/15 border border-accent/20 px-2.5 py-1 rounded-full w-fit">
          UNLOCKED: {unlockedCount} / {achievements.length} BADGES
        </span>
      </div>

      {/* 2. Horizontal Filter Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted border border-border/40 overflow-x-auto select-none no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap outline-none',
              selectedCategory === cat
                ? 'bg-card text-foreground shadow-sm border border-border/40'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Grid of Cards */}
      {filtered.length === 0 ? (
        <div className="text-center p-10 border border-dashed border-border/40 rounded-xl text-xs text-muted-foreground">
          No achievements in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <AchievementCard key={item.id} achievement={item} />
          ))}
        </div>
      )}
    </div>
  )
}
