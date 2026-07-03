'use client'

import React from 'react'
import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyCalendarState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center select-none">
      <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-5 animate-pulse">
        <Sprout className="h-8 w-8 text-green-500" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">Start building your first loop.</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
        No activity yet for this period. Complete habits every day and watch your calendar fill up.
      </p>
      <Link
        href="/dashboard/today"
        className={cn(buttonVariants({ size: 'sm' }), 'bg-accent hover:bg-accent/90 text-white font-semibold gap-2 cursor-pointer')}
      >
        Go to Today&apos;s Habits
      </Link>
    </div>
  )
}
