'use client'

import React from 'react'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyAnalyticsState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center select-none max-w-md mx-auto">
      <div className="h-16 w-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-6 animate-bounce">
        <BarChart3 className="h-8 w-8 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">
        Keep tracking your habits to unlock detailed insights.
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-8">
        We require at least a few days of completions to compute streaks, weekday consistency profiles, progress insights, and behavior trends. Start checking off routines from today!
      </p>
      <Link
        href="/dashboard/today"
        className={cn(
          buttonVariants({ size: 'sm' }),
          'bg-accent hover:bg-accent/90 text-white font-semibold gap-2 cursor-pointer transition-all'
        )}
      >
        Go to Today&apos;s Habits
      </Link>
    </div>
  )
}
