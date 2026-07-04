'use client'

import React from 'react'
import { ChallengeItem } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, Flame, CalendarRange } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChallengeCardProps {
  challenge: ChallengeItem
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { title, description, progress, target, completed, xpReward, type } = challenge
  
  // Calculate percentage
  const percentage = Math.min(100, Math.round((progress / target) * 100))

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-md transition-all duration-300 select-none hover:border-accent/30',
        completed && 'border-emerald-500/20 bg-emerald-500/5'
      )}
    >
      <CardContent className="p-4 flex items-start gap-3.5">
        {/* Status Indicator check */}
        <div className="mt-0.5 shrink-0">
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground/45" />
          )}
        </div>

        {/* Text descriptions */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex justify-between items-start gap-2">
            <div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider mb-1 px-1.5 py-0.5 rounded-md border',
                  type === 'daily'
                    ? 'bg-amber-500/10 border-amber-500/15 text-amber-500'
                    : 'bg-indigo-500/10 border-indigo-500/15 text-indigo-500'
                )}
              >
                {type === 'daily' ? (
                  <>
                    <Flame className="h-2.5 w-2.5" /> Daily
                  </>
                ) : (
                  <>
                    <CalendarRange className="h-2.5 w-2.5" /> Weekly
                  </>
                )}
              </span>
              
              <h4 className="text-xs font-bold text-foreground">{title}</h4>
              <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                {description}
              </p>
            </div>

            {/* Reward XP */}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 border select-none',
                completed
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : 'bg-accent/10 border-accent/15 text-accent'
              )}
            >
              +{xpReward} XP
            </span>
          </div>

          {/* Progress bar */}
          {!completed && (
            <div className="space-y-1">
              <Progress value={percentage} className="h-1" />
              <div className="flex justify-between items-center text-[9px] text-muted-foreground/80 font-semibold">
                <span>{percentage}% complete</span>
                <span>
                  {progress} / {target}
                  {title.includes('rate') ? '%' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
