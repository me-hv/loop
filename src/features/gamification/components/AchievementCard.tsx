'use client'

import React from 'react'
import { AchievementItem } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Flame,
  CheckCircle2,
  BookOpen,
  Crown,
  Target,
  Star,
  Award,
  Smile,
  Moon,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AchievementCardProps {
  achievement: AchievementItem
}

// Icon mappings based on Achievement ID
const ICON_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; colorClass: string; bgClass: string }> = {
  first_step: { icon: CheckCircle2, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10' },
  habit_apprentice: { icon: Target, colorClass: 'text-cyan-500', bgClass: 'bg-cyan-500/10' },
  habit_master: { icon: Crown, colorClass: 'text-yellow-500', bgClass: 'bg-yellow-500/10' },
  streak_7d: { icon: Flame, colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10' },
  streak_30d: { icon: Flame, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10' },
  streak_100d: { icon: Flame, colorClass: 'text-violet-500', bgClass: 'bg-violet-500/10' },
  perfect_day: { icon: Star, colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10' },
  consistency_champion: { icon: Trophy, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
  reflector: { icon: BookOpen, colorClass: 'text-teal-500', bgClass: 'bg-teal-500/10' },
  reflection_master: { icon: Award, colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10' },
  early_bird: { icon: Smile, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
  night_owl: { icon: Moon, colorClass: 'text-sky-500', bgClass: 'bg-sky-500/10' },
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { id, title, description, progress, target, unlocked, xpReward } = achievement
  const percentage = Math.min(100, Math.round((progress / target) * 100))

  const iconInfo = ICON_MAP[id] || { icon: Trophy, colorClass: 'text-muted-foreground', bgClass: 'bg-muted/10' }
  const IconComponent = iconInfo.icon

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-border/40 transition-all duration-300 select-none bg-card/60 backdrop-blur-md',
        unlocked
          ? 'hover:border-accent/40 shadow-sm'
          : 'opacity-70 bg-card/40'
      )}
    >
      <CardContent className="p-4 flex gap-4 items-start">
        {/* Badge Icon Grid */}
        <div
          className={cn(
            'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-border/10',
            unlocked ? iconInfo.bgClass : 'bg-muted/10'
          )}
        >
          {unlocked ? (
            <IconComponent className={cn('h-6 w-6', iconInfo.colorClass)} />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground/60" />
          )}
        </div>

        {/* Text descriptions */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className="text-xs font-bold text-foreground truncate">{title}</h4>
              <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                {description}
              </p>
            </div>
            
            {/* XP Award Pill */}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 border select-none',
                unlocked
                  ? 'bg-accent/15 border-accent/20 text-accent'
                  : 'bg-muted/20 border-border/40 text-muted-foreground'
              )}
            >
              +{xpReward} XP
            </span>
          </div>

          {/* Progress bar info */}
          {!unlocked && (
            <div className="space-y-1">
              <Progress value={percentage} className="h-1" />
              <div className="flex justify-between items-center text-[9px] text-muted-foreground/80 font-semibold">
                <span>{percentage}% complete</span>
                <span>{progress} / {target}</span>
              </div>
            </div>
          )}

          {unlocked && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
              <CheckCircle2 className="h-3 w-3" /> Unlocked
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
