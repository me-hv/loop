'use client'

import React from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useQuery } from '@tanstack/react-query'
import { habitsService } from '@/features/habits/services/habits-service'
import { Habit } from '@/features/habits/types'
import { trackingService } from '@/features/tracking/services/tracking-service'
import { useGamification } from '@/features/gamification/hooks/use-gamification'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Trophy,
  Flame,
  Award,
  CheckSquare,
  TrendingUp,
  ArrowRight,
  Shield,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { format, parseISO, getDay, eachDayOfInterval, startOfWeek } from 'date-fns'
import { calculateStreakFromDates, getLocalDateString } from '@/features/tracking/services/tracking-service'
import Link from 'next/link'

export default function ProfileProgressPage() {
  const user = useAuthStore((s) => s.user)

  // Load raw data
  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits', user?.uid],
    queryFn: () => habitsService.getHabits(user!.uid),
    enabled: !!user?.uid,
  })

  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['completions', user?.uid],
    queryFn: () => trackingService.getUserCompletions(user!.uid),
    enabled: !!user?.uid,
  })

  // Load gamification progress
  const { levelProgress, achievements, perfectDaysCount, isLoading: gamificationLoading } = useGamification(user?.uid)

  const isLoading = habitsLoading || completionsLoading || gamificationLoading

  if (isLoading) {
    return <ProfileSkeleton />
  }

  // ─── 1. Calculate Favorite Habit ──────────────────────────────────────────
  const habitCompletionsCount: Record<string, number> = {}
  completions.forEach((c) => {
    habitCompletionsCount[c.habitId] = (habitCompletionsCount[c.habitId] || 0) + 1
  })

  let favoriteHabitId = ''
  let maxCompletions = 0
  Object.entries(habitCompletionsCount).forEach(([id, count]) => {
    if (count > maxCompletions) {
      maxCompletions = count
      favoriteHabitId = id
    }
  })

  const favoriteHabit = habits.find((h) => h.id === favoriteHabitId)

  // ─── 2. Calculate Most Productive Category ──────────────────────────────
  const categoryCounts: Record<string, number> = {}
  completions.forEach((c) => {
    const parentHabit = habits.find((h) => h.id === c.habitId)
    if (parentHabit) {
      const cat = parentHabit.category
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    }
  })

  let favoriteCategory = '—'
  let maxCategoryCompletions = 0
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCategoryCompletions) {
      maxCategoryCompletions = count
      favoriteCategory = cat
    }
  })

  // ─── 3. Calculate Streak Stats ────────────────────────────────────────────
  const completionDates = Array.from(new Set(completions.map((c) => c.date))).sort()
  const todayStr = getLocalDateString()
  const { currentStreak, longestStreak } = calculateStreakFromDates(completionDates, todayStr)

  // ─── 4. Calculate Perfect Weeks & Months count ────────────────────────────
  let perfectWeeksCount = 0
  let perfectMonthsCount = 0

  function isHabitScheduledOnDate(habit: Habit, date: Date): boolean {
    const createdDate = new Date(habit.createdAt.split('T')[0] + 'T00:00:00')
    const checkDate = new Date(format(date, 'yyyy-MM-dd') + 'T00:00:00')
    if (checkDate < createdDate) return false
    const dayOfWeek = getDay(date)
    if (habit.frequency === 'Daily') return true
    if (habit.frequency === 'Weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
    if (habit.frequency === 'Weekends') return dayOfWeek === 0 || dayOfWeek === 6
    return true
  }

  if (habits.length > 0 && completions.length > 0) {
    const activeHabitIds = new Set(habits.filter((h) => !h.isDeleted).map((h) => h.id))
    const validCompletions = completions.filter((c) => activeHabitIds.has(c.habitId))
    const completionsMap = new Map<string, Set<string>>()
    validCompletions.forEach((c) => {
      if (!completionsMap.has(c.date)) completionsMap.set(c.date, new Set())
      completionsMap.get(c.date)!.add(c.habitId)
    })

    const earliestDateStr = habits.reduce((acc, h) => {
      const dStr = h.createdAt.split('T')[0]
      return dStr < acc ? dStr : acc
    }, getLocalDateString())

    const rangeDays = eachDayOfInterval({ start: new Date(earliestDateStr + 'T00:00:00'), end: new Date() })
    const perfectDates = new Set<string>()

    const activeHabits = habits.filter((h) => !h.isDeleted && !h.isArchived)
    rangeDays.forEach((dateObj) => {
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const scheduled = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateObj))
      const dayCompletions = completionsMap.get(dateStr) || new Set()
      
      const schedCount = scheduled.length
      const compCount = scheduled.filter((h) => dayCompletions.has(h.id)).length
      if (schedCount > 0 && compCount === schedCount) {
        perfectDates.add(dateStr)
      }
    })

    // Perfect Weeks
    const weeksMap = new Map<string, number>()
    perfectDates.forEach((dateStr) => {
      const dObj = new Date(dateStr + 'T00:00:00')
      const weekStartStr = format(startOfWeek(dObj, { weekStartsOn: 0 }), 'yyyy-MM-dd')
      weeksMap.set(weekStartStr, (weeksMap.get(weekStartStr) || 0) + 1)
    })
    weeksMap.forEach((perfectCount) => {
      if (perfectCount >= 7) perfectWeeksCount++
    })

    // Perfect Months
    const monthsMap = new Map<string, { perfect: number; scheduledDays: number }>()
    rangeDays.forEach((dateObj) => {
      const dateStr = format(dateObj, 'yyyy-MM-dd')
      const monthStr = format(dateObj, 'yyyy-MM')
      const scheduled = activeHabits.filter((h) => isHabitScheduledOnDate(h, dateObj))

      if (!monthsMap.has(monthStr)) {
        monthsMap.set(monthStr, { perfect: 0, scheduledDays: 0 })
      }
      const data = monthsMap.get(monthStr)!
      if (scheduled.length > 0) {
        data.scheduledDays++
        if (perfectDates.has(dateStr)) {
          data.perfect++
        }
      }
    })
    monthsMap.forEach((data) => {
      if (data.scheduledDays > 0 && data.perfect === data.scheduledDays) {
        perfectMonthsCount++
      }
    })
  }

  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length
  const initials = user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'LO'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Profile Banner Header Card */}
      <Card className="relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-md shadow-md select-none">
        {/* Glow decoration */}
        <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-accent/20 shadow-md">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="bg-accent/10 text-accent font-black text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-3.5">
              <div>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                  {user?.displayName || 'Loop Member'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Joined on {user?.createdAt ? format(parseISO(user.createdAt), 'MMMM d, yyyy') : 'Recently'}
                </p>
              </div>

              {/* LVL Badge & progress bar inline */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-indigo-600 border border-white/10 shadow-md">
                  <Shield className="h-6 w-6 text-white/90" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-1.5">
                    <span className="text-[7px] font-bold text-white/70 uppercase leading-none">LVL</span>
                    <span className="text-sm font-black text-white leading-none">{levelProgress?.level}</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-1">
                  <div className="flex justify-between items-baseline text-[10px] text-muted-foreground font-semibold">
                    <span>Level {levelProgress?.level} Explorer</span>
                    <span>{levelProgress?.currentXp} / {levelProgress?.currentXp + levelProgress?.xpToNextLevel} XP</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-indigo-500"
                      style={{ width: `${levelProgress?.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Lifetime Achievements Grid (Consistency Metrics) */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 select-none">
          Consistency Milestones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatProgressCard
            label="Current Streak"
            value={`${currentStreak} days`}
            subValue={`Longest: ${longestStreak}d`}
            icon={<Flame className="h-4 w-4 text-orange-500" />}
          />
          <StatProgressCard
            label="Perfect Days"
            value={perfectDaysCount}
            subValue="Completed schedules"
            icon={<Star className="h-4 w-4 text-amber-500" />}
          />
          <StatProgressCard
            label="Perfect Weeks"
            value={perfectWeeksCount}
            subValue="7 perfect days"
            icon={<Trophy className="h-4 w-4 text-yellow-500" />}
          />
          <StatProgressCard
            label="Perfect Months"
            value={perfectMonthsCount}
            subValue="Full months completed"
            icon={<Award className="h-4 w-4 text-purple-500" />}
          />
        </div>
      </div>

      {/* 3. Habit Profile Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
        {/* Favorite Habit */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Favorite Habit
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Most completed routine in Loop
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex items-center justify-between">
            {favoriteHabit ? (
              <div>
                <span className="text-base font-extrabold text-foreground leading-tight">
                  {favoriteHabit.title}
                </span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                  {favoriteHabit.category} &bull; {maxCompletions} Completions
                </p>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No habit logged yet</span>
            )}
            <CheckSquare className="h-8 w-8 text-accent/20" />
          </CardContent>
        </Card>

        {/* Most Productive Category */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Productive Focus
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Category with highest logs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex items-center justify-between">
            <div>
              <span className="text-base font-extrabold text-foreground leading-tight capitalize">
                {favoriteCategory}
              </span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                {maxCategoryCompletions} Total Logs
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-500/20" />
          </CardContent>
        </Card>
      </div>

      {/* 4. Unlocked Badges Showcase */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md select-none">
        <CardHeader className="pb-2 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Badges Showcase
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Unlocked badges representing your achievements
            </CardDescription>
          </div>
          <Link
            href="/dashboard/achievements"
            className="text-[10px] font-black text-accent hover:underline flex items-center gap-1 shrink-0"
          >
            All Badges
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="pt-2">
          {unlockedAchievementsCount === 0 ? (
            <div className="text-center p-6 border border-dashed border-border/40 rounded-xl text-xs text-muted-foreground">
              No badges unlocked yet. Start completing habits!
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {achievements
                .filter((a) => a.unlocked)
                .slice(0, 6)
                .map((ach) => (
                  <div
                    key={ach.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-accent/5 border border-accent/10 text-xs shrink-0"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="font-bold text-foreground">{ach.title}</span>
                  </div>
                ))}
              {unlockedAchievementsCount > 6 && (
                <div className="flex items-center justify-center p-2 rounded-xl bg-muted border border-border/40 text-[10px] font-black text-muted-foreground shrink-0">
                  +{unlockedAchievementsCount - 6} MORE
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatProgressCard({
  label,
  value,
  subValue,
  icon,
}: {
  label: string
  value: string | number
  subValue: string
  icon: React.ReactNode
}) {
  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-sm">
      <CardContent className="p-4 flex flex-col gap-3 select-none">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            {label}
          </span>
          <div className="p-1 rounded bg-muted border border-border/30 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div>
          <span className="text-base font-extrabold text-foreground leading-none">{value}</span>
          <span className="block text-[9px] text-muted-foreground/80 mt-1.5 font-semibold">{subValue}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse select-none">
      <Card className="h-32 border-border/30 bg-muted/10" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-24 border-border/30 bg-muted/10" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-24 border-border/30 bg-muted/10" />
        <Card className="h-24 border-border/30 bg-muted/10" />
      </div>
      <Card className="h-28 border-border/30 bg-muted/10" />
    </div>
  )
}
