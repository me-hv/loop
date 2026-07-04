'use client'

import React from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useGamification, useMilestones } from '@/features/gamification/hooks/use-gamification'
import { XPProgressCard } from '@/features/gamification/components/XPProgressCard'
import { BadgeGrid } from '@/features/gamification/components/BadgeGrid'
import { ChallengeCard } from '@/features/gamification/components/ChallengeCard'
import { CelebrationModal } from '@/features/gamification/components/CelebrationModal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Award, Compass, Sparkles, CheckCircle2 } from 'lucide-react'

export default function AchievementsPage() {
  const user = useAuthStore((s) => s.user)

  // Load gamification data
  const {
    levelProgress,
    achievements,
    challenges,
    currentCelebration,
    dismissCelebration,
    isDismissing,
    isLoading: gamificationLoading,
  } = useGamification(user?.uid)

  // Load milestones data
  const { milestones, isLoading: milestonesLoading } = useMilestones(user?.uid)

  const isLoading = gamificationLoading || milestonesLoading

  if (isLoading) {
    return <AchievementsSkeleton />
  }

  // Split challenges into daily and weekly
  const dailyChallenges = challenges.filter((c) => c.type === 'daily')
  const weeklyChallenges = challenges.filter((c) => c.type === 'weekly')

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Gamification & Progress
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Claim XP, track routine consistency milestones, and check off challenges.
          </p>
        </div>
      </div>

      {/* 2. XP & Level Overview Card */}
      {levelProgress && <XPProgressCard progress={levelProgress} />}

      {/* 3. Main Dashboard Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Badge Grid */}
        <div className="lg:col-span-2 space-y-6">
          <BadgeGrid achievements={achievements} />
        </div>

        {/* Right column: Challenges & Milestones */}
        <div className="space-y-6 select-none">
          {/* Active Challenges */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Active Challenges
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Deterministic daily and weekly consistency goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-3.5">
              {/* Daily section */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Daily Quests
                </span>
                {dailyChallenges.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} />
                ))}
              </div>

              {/* Weekly section */}
              <div className="space-y-2 pt-2 border-t border-border/10">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Weekly Milestones
                </span>
                {weeklyChallenges.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Milestones Card */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-indigo-500" />
                Lifetime Milestones
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Long-term trackers of your journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-3.5">
              {milestones.map((m) => {
                const percent = Math.min(100, Math.round((m.progress / m.target) * 100))
                return (
                  <div key={m.id} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        {m.label}
                      </span>
                      <span className="text-muted-foreground/75 font-bold">
                        {m.progress} / {m.target}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={percent} className="h-1.5" />
                      {m.completed && (
                        <div className="absolute right-0 top-0 -mt-0.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Celebrations trigger overlay */}
      <CelebrationModal
        celebration={currentCelebration}
        onDismiss={dismissCelebration}
        isDismissing={isDismissing}
      />
    </div>
  )
}

function AchievementsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse select-none">
      <div className="space-y-1">
        <div className="h-7 bg-muted/40 rounded w-1/4" />
        <div className="h-4 bg-muted/30 rounded w-1/3" />
      </div>

      {/* XP Card Skeleton */}
      <Card className="h-28 border-border/30 bg-muted/10" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-muted/30 rounded w-24" />
            <div className="h-5 bg-muted/30 rounded w-32" />
          </div>
          <div className="h-10 bg-muted/40 rounded w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-24 border-border/30 bg-muted/10" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="h-64 border-border/30 bg-muted/10" />
          <Card className="h-64 border-border/30 bg-muted/10" />
        </div>
      </div>
    </div>
  )
}
