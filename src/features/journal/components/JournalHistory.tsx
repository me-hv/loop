'use client'

import React, { useState } from 'react'
import { JournalEntry, JournalFilters, MoodType } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { Search, Trophy, ArrowRight, Tag, BookOpen, ChevronDown, ChevronUp, AlertCircle, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface JournalHistoryProps {
  history: JournalEntry[]
  filters: JournalFilters
  onUpdateFilters: (updates: Partial<JournalFilters>) => void
  isLoading?: boolean
}

const EMOJI_MAP: Record<MoodType, string> = {
  excellent: '😁',
  happy: '😊',
  neutral: '😐',
  sad: '😔',
  stressed: '😣',
  exhausted: '😴',
}

export function JournalHistory({ history, filters, onUpdateFilters, isLoading }: JournalHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleResetFilters = () => {
    onUpdateFilters({ search: '', mood: '', tag: '', sortBy: 'newest' })
  }

  return (
    <div className="space-y-6">
      {/* A. Search and Filters controls */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md select-none">
        <CardContent className="p-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              type="text"
              value={filters.search}
              onChange={(e) => onUpdateFilters({ search: e.target.value })}
              placeholder="Search by gratitude, wins, notes, tags..."
              className="pl-9 text-xs border-border/40 focus-visible:ring-accent/30 focus-visible:border-accent"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Mood Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground/75 font-semibold">Mood:</span>
                <select
                  value={filters.mood}
                  onChange={(e) => onUpdateFilters({ mood: e.target.value })}
                  className="bg-muted hover:bg-muted/80 text-foreground border border-border/40 rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
                >
                  <option value="">All Moods</option>
                  <option value="excellent">😁 Excellent</option>
                  <option value="happy">😊 Happy</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="sad">😔 Sad</option>
                  <option value="stressed">😣 Stressed</option>
                  <option value="exhausted">😴 Exhausted</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground/75 font-semibold">Sort:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => onUpdateFilters({ sortBy: e.target.value as 'newest' | 'oldest' })}
                  className="bg-muted hover:bg-muted/80 text-foreground border border-border/40 rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filters.search || filters.mood || filters.tag) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-7 text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* B. Timeline / Diary List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/20 border border-border/30" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/40 rounded-2xl bg-muted/10">
          <BookOpen className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-xs font-bold text-foreground">No matching reflections.</p>
          <p className="text-[10px] text-muted-foreground mt-1 max-w-xs mx-auto">
            Try adjusting your search filters or start logging today&apos;s routine!
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {history.map((entry) => {
            const dateObj = parseISO(entry.date)
            const formattedDate = format(dateObj, 'EEEE, MMM d, yyyy')
            const isExpanded = expandedId === entry.id

            return (
              <Card
                key={entry.id}
                className={cn(
                  'border-border/40 bg-card/60 backdrop-blur-md hover:border-border/80 transition-all duration-200 select-none overflow-hidden'
                )}
              >
                {/* Card Header (Clickable strip) */}
                <div
                  onClick={() => toggleExpand(entry.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Emoji */}
                    <span className="text-2xl filter drop-shadow-sm select-none">
                      {EMOJI_MAP[entry.mood]}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground leading-snug">
                        {formattedDate}
                      </h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider flex items-center gap-1.5 mt-0.5">
                        <span>Energy: {entry.energyLevel}/5</span>
                        <span>•</span>
                        <span>Sleep: {entry.sleepQuality}/5</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Action buttons */}
                    <Link
                      href={`/dashboard/journal/${entry.date}`}
                      className="text-[10px] font-black text-accent hover:underline hidden sm:inline-block print:hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit Entry
                    </Link>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground/60" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
                    )}
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <CardContent className="p-4 pt-0 border-t border-border/10 bg-muted/5 space-y-4 text-xs">
                    {/* 1. Gratitude list */}
                    {entry.gratitude && entry.gratitude.filter(Boolean).length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-pink-500 font-bold text-[10px] uppercase tracking-wider">
                          <Heart className="h-3.5 w-3.5 fill-pink-500/10" />
                          <span>Grateful For</span>
                        </div>
                        <ul className="pl-4 space-y-1 text-muted-foreground">
                          {entry.gratitude.filter(Boolean).map((g, i) => (
                            <li key={i} className="list-decimal leading-relaxed">
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 2. Wins / Accomplishments */}
                    {entry.wins && entry.wins.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-green-500 font-bold text-[10px] uppercase tracking-wider">
                          <Trophy className="h-3.5 w-3.5" />
                          <span>Today&apos;s Wins</span>
                        </div>
                        <ul className="pl-4 space-y-1 text-muted-foreground">
                          {entry.wins.map((w, i) => (
                            <li key={i} className="list-disc leading-relaxed">
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 3. Challenges */}
                    {entry.challenges && entry.challenges.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-destructive font-bold text-[10px] uppercase tracking-wider">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Today&apos;s Challenges</span>
                        </div>
                        <ul className="pl-4 space-y-1 text-muted-foreground">
                          {entry.challenges.map((c, i) => (
                            <li key={i} className="list-disc leading-relaxed">
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 4. Tomorrow focus */}
                    {entry.tomorrowFocus && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-purple-500 font-bold text-[10px] uppercase tracking-wider">
                          <ArrowRight className="h-3.5 w-3.5" />
                          <span>Tomorrow&apos;s Focus</span>
                        </div>
                        <p className="pl-4 text-muted-foreground leading-relaxed italic">
                          &ldquo;{entry.tomorrowFocus}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* 5. Notes / Free-form diary */}
                    {entry.notes && (
                      <div className="space-y-1.5 pt-1.5 border-t border-border/10">
                        <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                          Journal Reflection
                        </p>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap pl-1.5 border-l-2 border-border/60">
                          {entry.notes}
                        </p>
                      </div>
                    )}

                    {/* 6. Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/15 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateFilters({ tag: tag === filters.tag ? '' : tag })
                            }}
                          >
                            <Tag className="h-2 w-2" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
