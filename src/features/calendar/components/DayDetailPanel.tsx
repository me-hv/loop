'use client'

import React from 'react'
import { format, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, XCircle, BookOpen, Smile, StickyNote } from 'lucide-react'
import { DayDetailData } from '../types'
import { getHabitColor, getHabitIcon } from '@/features/habits/utils/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DayDetailPanelProps {
  date: string
  data: DayDetailData | undefined
  isLoading: boolean
  onClose: () => void
}

export function DayDetailPanel({ date, data, isLoading, onClose }: DayDetailPanelProps) {
  const dateObj = parseISO(date)
  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy')

  return (
    <AnimatePresence>
      <motion.aside
        key="day-panel"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col h-full border-l border-border bg-card overflow-hidden"
        aria-label={`Day detail for ${formattedDate}`}
        role="complementary"
      >
        {/* Panel Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-border bg-muted/30">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Day Detail
            </p>
            <h3 className="text-base font-bold text-foreground leading-tight">{formattedDate}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-muted cursor-pointer flex-shrink-0 mt-0.5"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading ? (
            <PanelSkeleton />
          ) : !data ? (
            <div className="text-center text-sm text-muted-foreground py-10">No data for this day.</div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Completed"
                  value={`${data.totalCompleted}/${data.totalScheduled}`}
                  icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                />
                <StatCard
                  label="Progress"
                  value={`${data.completionPercentage}%`}
                  icon={
                    <div className="h-4 w-4 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <div
                        className="rounded-full bg-green-500"
                        style={{
                          width: `${Math.round((data.completionPercentage / 100) * 8)}px`,
                          height: `${Math.round((data.completionPercentage / 100) * 8)}px`,
                        }}
                      />
                    </div>
                  }
                />
              </div>

              {/* Completed Habits */}
              {data.completed.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Completed ({data.completed.length})
                  </h4>
                  <div className="space-y-2">
                    {data.completed.map((item) => {
                      const colorPreset = getHabitColor(item.color)
                      const IconComp = getHabitIcon(item.icon)
                      return (
                        <div
                          key={item.habitId}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-green-500/5 border border-green-500/15"
                        >
                          <div
                            className={cn(
                              'h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 border',
                              colorPreset.bgClass,
                              colorPreset.borderClass,
                              colorPreset.textClass
                            )}
                          >
                            {React.createElement(IconComp, { className: 'h-3.5 w-3.5' })}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">{item.habitTitle}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {format(parseISO(item.completedAt), 'h:mm a')}
                            </p>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Missed Habits */}
              {data.missed.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <XCircle className="h-3.5 w-3.5 text-destructive/70" />
                    Missed ({data.missed.length})
                  </h4>
                  <div className="space-y-2">
                    {data.missed.map((item) => {
                      const colorPreset = getHabitColor(item.color)
                      const IconComp = getHabitIcon(item.icon)
                      return (
                        <div
                          key={item.habitId}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30 opacity-60"
                        >
                          <div
                            className={cn(
                              'h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 border grayscale',
                              colorPreset.bgClass,
                              colorPreset.borderClass,
                              colorPreset.textClass
                            )}
                          >
                            {React.createElement(IconComp, { className: 'h-3.5 w-3.5' })}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-muted-foreground truncate line-through">
                              {item.habitTitle}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60">{item.category}</p>
                          </div>
                          <XCircle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Placeholders for future phases */}
              <div className="space-y-3">
                <PlaceholderCard
                  icon={<Smile className="h-3.5 w-3.5 text-yellow-500" />}
                  label="Mood"
                  placeholder="Mood tracking coming soon"
                />
                <PlaceholderCard
                  icon={<BookOpen className="h-3.5 w-3.5 text-blue-500" />}
                  label="Journal"
                  placeholder="Journal feature coming soon"
                />
                <PlaceholderCard
                  icon={<StickyNote className="h-3.5 w-3.5 text-purple-500" />}
                  label="Notes"
                  placeholder="Notes feature coming soon"
                />
              </div>
            </>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-muted/30 border border-border/40">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl font-extrabold text-foreground">{value}</span>
    </div>
  )
}

function PlaceholderCard({
  icon,
  label,
  placeholder,
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/40 bg-muted/10 opacity-60">
      <div className="h-7 w-7 rounded-md bg-muted/40 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xs text-muted-foreground/60 italic">{placeholder}</p>
      </div>
    </div>
  )
}

function PanelSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 rounded-xl bg-muted/40" />
        <div className="h-16 rounded-xl bg-muted/40" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 rounded-lg bg-muted/30" />
      ))}
    </div>
  )
}
