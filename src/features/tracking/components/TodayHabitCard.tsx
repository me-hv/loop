'use client'

import React from 'react'
import { Habit } from '@/features/habits/types'
import { getHabitColor, getHabitIcon } from '@/features/habits/utils/icons'
import { Card, CardContent } from '@/components/ui/card'
import {
  Check,
  Flame,
  Loader2,
  MoreVertical,
  Eye,
  Edit2,
  Plus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

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

  const difficultyColors = {
    easy: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20',
    medium: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20',
    hard: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="w-full animate-in fade-in slide-in-from-bottom-2"
    >
      <Card
        className={cn(
          'border border-border/50 hover:border-border/90 hover:shadow-sm transition-all duration-300 relative group overflow-hidden select-none',
          isCompleted ? 'bg-muted/30 dark:bg-muted/10' : 'bg-card'
        )}
      >
        <CardContent className="px-4.5 py-3 flex items-center justify-between gap-4 h-[74px]">
          <div className="flex items-center gap-3.5 min-w-0 flex-grow">
            {/* Left: Completion button */}
            <button
              type="button"
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
              className={cn(
                'h-8.5 w-8.5 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 shrink-0 relative focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-75 disabled:cursor-not-allowed',
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
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  </motion.div>
                ) : isCompleted ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.6, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <Check className="h-4.5 w-4.5 stroke-[3px]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="plus"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover:scale-110" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Center: Habit title and Meta indicators */}
            <div className="min-w-0 space-y-0.5">
              <h3
                className={cn(
                  'font-sans font-bold text-sm truncate transition-all duration-300',
                  isCompleted
                    ? 'line-through text-muted-foreground/50'
                    : 'text-foreground group-hover:text-accent'
                )}
              >
                {habit.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground/90">
                <span className="truncate font-medium">
                  Goal: {habit.goal} {habit.unit.toLowerCase()} • {habit.frequency.toLowerCase()}
                </span>
                <span className="text-muted-foreground/30 font-light">•</span>
                <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground select-none">
                  {habit.category}
                </span>
                <span className="text-muted-foreground/30 font-light">•</span>
                <span className={cn('px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider select-none', difficultyColors[habit.difficulty])}>
                  {habit.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Streak, Icon, and Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Streak count */}
            {(habit.currentStreak ?? 0) > 0 && (
              <div
                className="flex items-center gap-1 font-bold text-xs text-orange-500"
                title="Current Streak"
              >
                <Flame className="h-4 w-4 animate-pulse" />
                <span>{habit.currentStreak}</span>
              </div>
            )}

            {/* Habit Icon bubble */}
            <div
              className={cn(
                'p-1.5 rounded-lg border text-center scale-90 shrink-0 hidden sm:flex transition-transform duration-300 group-hover:scale-95',
                colorPreset.bgClass,
                colorPreset.borderClass,
                colorPreset.textClass
              )}
            >
              {React.createElement(IconComponent, { className: 'h-3.5 w-3.5' })}
            </div>

            {/* Quick Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-8 w-8 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors focus:outline-none shrink-0"
                aria-label="Habit actions"
              >
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40" sideOffset={6}>
                <DropdownMenuItem className="p-0">
                  <Link
                    href={`/dashboard/habits/${habit.id}`}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 cursor-pointer text-xs font-semibold"
                  >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>View Details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Link
                    href={`/dashboard/habits/${habit.id}/edit`}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 cursor-pointer text-xs font-semibold"
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                    <span>Edit Habit</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
