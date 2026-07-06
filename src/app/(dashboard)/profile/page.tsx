'use client'

import React from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useQuery } from '@tanstack/react-query'
import { habitsService } from '@/features/habits/services/habits-service'
import { trackingService } from '@/features/tracking/services/tracking-service'
import { useGamification } from '@/features/gamification/hooks/use-gamification'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Flame,
  CheckSquare,
  Trophy,
  Calendar,
  Mail,
  Settings as SettingsIcon,
  Edit2,
  CalendarDays,
  Sparkles,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { calculateStreakFromDates, getLocalDateString } from '@/features/tracking/services/tracking-service'
import Link from 'next/link'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  // Fetch habits
  const { data: habits = [], isLoading: habitsLoading } = useQuery({
    queryKey: ['habits', user?.uid],
    queryFn: () => habitsService.getHabits(user!.uid),
    enabled: !!user?.uid,
  })

  // Fetch completions
  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['completions', user?.uid],
    queryFn: () => trackingService.getUserCompletions(user!.uid),
    enabled: !!user?.uid,
  })

  // Fetch gamification profile
  const { levelProgress, achievements, isLoading: gamificationLoading } = useGamification(user?.uid)

  const isLoading = habitsLoading || completionsLoading || gamificationLoading

  if (isLoading || !user) {
    return <ProfileSkeleton />
  }

  // Calculate streaks
  const completionDates = Array.from(new Set(completions.map((c) => c.date))).sort()
  const todayStr = getLocalDateString()
  const { currentStreak } = calculateStreakFromDates(completionDates, todayStr)

  // Format member since
  let memberSince = 'June 2026'
  if (user.createdAt) {
    try {
      memberSince = format(parseISO(user.createdAt), 'MMMM yyyy')
    } catch {
      memberSince = 'June 2026'
    }
  }

  const activeAchievements = achievements.filter((a) => a.unlocked)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-border bg-card/50 backdrop-blur-md relative shadow-xl">
        <div className="h-32 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 absolute inset-0 -z-10" />
        <CardContent className="pt-8 pb-6 px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="bg-accent/15 text-accent text-3xl font-extrabold">
                  {user.displayName?.substring(0, 2).toUpperCase() ?? 'US'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-background shadow-md">
                LVL {levelProgress.level}
              </div>
            </div>

            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-foreground truncate">
                    {user.displayName || 'Loop Achiever'}
                  </h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{user.email}</span>
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <Link href="/settings/profile">
                    <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer text-xs">
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit Profile</span>
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer text-xs">
                      <SettingsIcon className="h-3.5 w-3.5" />
                      <span>Settings</span>
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground pt-2 justify-center sm:justify-start border-t border-border/30">
                <p className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Member since {memberSince}</span>
                </p>
                <p className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                  <span>Level {levelProgress.level} ({levelProgress.currentXp} XP)</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/40 border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-500">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-0.5">
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Habits</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-0.5">
                {habits.length} {habits.length === 1 ? 'habit' : 'habits'}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-500">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completions</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-0.5">
                {completions.length} times
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="bg-card/40 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex justify-between items-center">
            <span>Leveling Progress</span>
            <span className="text-xs text-muted-foreground">
              {levelProgress.currentXp} / {levelProgress.xpToNextLevel} XP
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden border border-border/30">
            <div
              className="h-full bg-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${levelProgress.progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Earn 10 XP per habit completion, 150 XP per challenge milestone! Reach next level to unlock new icons and styling.
          </p>
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card className="bg-card/40 border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Achievements Unlocked</span>
          </CardTitle>
          <CardDescription>
            You have unlocked {activeAchievements.length} of {achievements.length} milestones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAchievements.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-border/50 rounded-xl">
              <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No achievements unlocked yet</p>
              <p className="text-xs text-muted-foreground/75 mt-1">Keep completing habits daily to unlock special badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex gap-4 p-4 rounded-xl border border-border/40 bg-card/60 backdrop-blur-xs relative overflow-hidden"
                >
                  <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-500 h-fit">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                    <p className="text-[10px] text-indigo-500 mt-2 font-semibold">
                      Unlocked on {format(parseISO(achievement.unlockedDate || new Date().toISOString().split('T')[0]), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-44 bg-card/40 border border-border/50 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-24 bg-card/40 border border-border/50 rounded-xl" />
        <div className="h-24 bg-card/40 border border-border/50 rounded-xl" />
        <div className="h-24 bg-card/40 border border-border/50 rounded-xl" />
      </div>
      <div className="h-20 bg-card/40 border border-border/50 rounded-xl" />
      <div className="h-48 bg-card/40 border border-border/50 rounded-xl" />
    </div>
  )
}
