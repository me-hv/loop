'use client'

import React from 'react'
import { Habit } from '@/features/habits/types'
import { getHabitColor, getHabitIcon } from '@/features/habits/utils/icons'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Flame, Trophy, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TodayHabitCardProps {
  habit: Habit
  isCompleted: boolean
  onToggle: () => void
  isPending?: boolean
  index: number
}

export function TodayHabitCard({
  habit,
  isCompleted,
  onToggle,
  isPending = false,
  index,
}: TodayHabitCardProps) {
  const IconComponent = getHabitIcon(habit.icon)
  const colorPreset = getHabitColor(habit.color)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="w-full"
    >
      <Card
        className={cn(
          'border border-border/50 hover:border-border/95 transition-all duration-300 relative group overflow-hidden shadow-sm select-none',
          isCompleted ? 'bg-muted/30 dark:bg-muted/10' : 'bg-card'
        )}
      >
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Completion checkbox button */}
            <button
              type="button"
              disabled={isPending}
              onClick={onToggle}
              className={cn(
                'h-10 w-10 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 shrink-0 relative focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-75 disabled:cursor-not-allowed',
                isCompleted
                  ? 'bg-success hover:bg-success/90 border-transparent text-white shadow-sm'
                  : 'border-muted-foreground/30 hover:border-accent hover:bg-accent/10 hover:text-accent'
              )}
              aria-label={isCompleted ? `Mark ${habit.title} incomplete` : `Mark ${habit.title} complete`}
            >
              <AnimatePresence mode="wait">
                {isPending ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </motion.div>
                ) : isCompleted ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.6, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <Check className="h-5 w-5 stroke-[3px]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="plus"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="h-2 w-2 rounded-full bg-accent"
                  />
                )}
              </AnimatePresence>
            </button>

            {/* Habit Information Details */}
            <div className="min-w-0">
              <h3
                className={cn(
                  'font-sans font-bold text-sm sm:text-base truncate transition-all duration-300',
                  isCompleted
                    ? 'line-through text-muted-foreground/60'
                    : 'text-foreground group-hover:text-accent'
                )}
              >
                {habit.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground mt-0.5">
                <span className="truncate">
                  Goal: {habit.goal} {habit.unit.toLowerCase()} • {habit.frequency.toLowerCase()}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="capitalize px-1.5 py-0.5 rounded bg-muted/65 text-[10px] font-bold tracking-wider">
                  {habit.category}
                </span>
              </div>
            </div>
          </div>

          {/* Habit Icon Swatch & Streaks indicators */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Streaks counters */}
            <div className="flex items-center gap-3 text-xs">
              {/* Current Streak */}
              <div
                className={cn(
                  'flex items-center gap-1.5 font-bold',
                  (habit.currentStreak ?? 0) > 0 ? 'text-orange-500' : 'text-muted-foreground/50'
                )}
                title="Current Streak"
              >
                <Flame className={cn('h-4.5 w-4.5', (habit.currentStreak ?? 0) > 0 && 'animate-pulse')} />
                <span>{habit.currentStreak ?? 0}</span>
              </div>

              {/* Longest Streak */}
              <div
                className={cn(
                  'hidden sm:flex items-center gap-1.5 font-bold text-yellow-500',
                  (habit.longestStreak ?? 0) > 0 ? 'opacity-100' : 'opacity-30'
                )}
                title="Longest Streak"
              >
                <Trophy className="h-4 w-4" />
                <span>{habit.longestStreak ?? 0}</span>
              </div>
            </div>

            {/* Custom Icon bubble */}
            <div
              className={cn(
                'p-2 rounded-lg border text-center scale-95 shrink-0 hidden sm:flex',
                colorPreset.bgClass,
                colorPreset.borderClass,
                colorPreset.textClass
              )}
            >
              {React.createElement(IconComponent, { className: 'h-4 w-4' })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
