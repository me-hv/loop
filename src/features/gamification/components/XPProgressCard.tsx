'use client'

import React from 'react'
import { UserLevelProgress } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface XPProgressCardProps {
  progress: UserLevelProgress
}

export function XPProgressCard({ progress }: XPProgressCardProps) {
  const { level, currentXp, xpToNextLevel, progressPercent, totalXp } = progress

  return (
    <Card className="relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-md hover:border-accent/40 transition-all duration-300 shadow-md group select-none">
      {/* Glow highlight */}
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/10 blur-3xl group-hover:bg-accent/15 transition-colors duration-500" />
      
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Level Emblem Badge */}
          <div className="relative shrink-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg border border-white/10"
            >
              <Shield className="h-10 w-10 text-white/90" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-none">LVL</span>
                <span className="text-2xl font-black text-white leading-none">{level}</span>
              </div>
            </motion.div>
            
            {/* Sparkle indicators */}
            <div className="absolute -right-1 -top-1 p-1 bg-background border border-border/40 rounded-full shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            </div>
          </div>

          {/* Level Progress Stats */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-1.5">
                  Level {level} Explorer
                </h3>
                <p className="text-xs text-muted-foreground">
                  Accumulated {totalXp.toLocaleString()} Total XP
                </p>
              </div>
              <span className="text-xs font-bold text-muted-foreground/80 sm:text-right shrink-0">
                {currentXp.toLocaleString()} <span className="text-foreground">/ { (currentXp + xpToNextLevel).toLocaleString() } XP</span>
              </span>
            </div>

            {/* Premium Animated Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden border border-border/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-accent via-indigo-500 to-violet-500"
                />
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                <span>{progressPercent}% Complete</span>
                <span>{xpToNextLevel.toLocaleString()} XP to Level {level + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
