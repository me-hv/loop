'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/use-auth-store'
import { useJournalHistory } from '../hooks/use-journal'
import { JournalEditor } from './JournalEditor'
import { JournalHistory } from './JournalHistory'
import { JournalFilters } from '../types'
import { getLocalDateString } from '@/features/tracking/services/tracking-service'
import { addDays, subDays, format, parseISO, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface JournalDashboardProps {
  date?: string
}

export function JournalDashboard({ date }: JournalDashboardProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const todayStr = getLocalDateString()
  const selectedDate = date || todayStr

  // Formatted display date
  const dateObj = parseISO(selectedDate)
  const isTodayDate = isToday(new Date(selectedDate + 'T00:00:00'))
  const displayTitle = format(dateObj, 'eeee, MMMM d, yyyy')

  // History filtering state
  const [filters, setFilters] = useState<JournalFilters>({
    search: '',
    mood: '',
    tag: '',
    sortBy: 'newest',
  })

  const { history, isLoading: historyLoading } = useJournalHistory(user?.uid, filters)

  const handleUpdateFilters = (updates: Partial<JournalFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  // Date shifters using URL routing
  const navigateToDate = (newDateStr: string) => {
    if (newDateStr === todayStr) {
      router.push('/dashboard/journal')
    } else {
      router.push(`/dashboard/journal/${newDateStr}`)
    }
  }

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00')
    const prev = subDays(d, 1)
    navigateToDate(format(prev, 'yyyy-MM-dd'))
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00')
    const next = addDays(d, 1)
    navigateToDate(format(next, 'yyyy-MM-dd'))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Date Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 select-none print:hidden">
        <div className="flex items-center gap-3">
          {/* Back button if looking at past date */}
          {!isTodayDate && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateToDate(todayStr)}
              className="h-8 w-8 rounded-lg border-border/60 hover:bg-muted shrink-0 cursor-pointer"
              title="Back to Today"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevDay}
              className="h-8 w-8 rounded-lg border-border/60 hover:bg-muted cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-sm sm:text-base font-extrabold text-foreground min-w-[180px] text-center sm:text-left leading-none">
              {displayTitle} {isTodayDate && <span className="text-accent ml-1">(Today)</span>}
            </h2>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDay}
              className="h-8 w-8 rounded-lg border-border/60 hover:bg-muted cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Short page description */}
        <div className="text-xs text-muted-foreground/80 italic">
          Reflect, write down wins, and plan your focus area.
        </div>
      </div>

      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Journal Writer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between select-none">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Daily Entry
            </h3>
            {isTodayDate ? (
              <span className="text-[10px] bg-green-500/10 text-green-600 border border-green-500/15 font-bold px-2 py-0.5 rounded-full">
                Active Reflection
              </span>
            ) : (
              <span className="text-[10px] bg-muted text-muted-foreground border border-border/40 font-bold px-2 py-0.5 rounded-full">
                Historical Log
              </span>
            )}
          </div>
          <JournalEditor userId={user?.uid} date={selectedDate} />
        </div>

        {/* Right Column: Reflections Timeline history feed */}
        <div className="lg:col-span-5 space-y-4 print:hidden">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest select-none">
            Reflections Timeline
          </h3>
          <JournalHistory
            history={history}
            filters={filters}
            onUpdateFilters={handleUpdateFilters}
            isLoading={historyLoading}
          />
        </div>
      </div>
    </div>
  )
}
