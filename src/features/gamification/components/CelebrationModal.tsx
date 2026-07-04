'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Trophy, CheckCircle2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AchievementItem } from '../types'

interface CelebrationModalProps {
  celebration: {
    type: 'level' | 'achievement'
    value: number | AchievementItem
  } | null
  onDismiss: () => void
  isDismissing?: boolean
}

// Custom Confetti particle generator
interface ConfettiParticle {
  id: number
  x: number // start X position in percentage
  y: number // start Y position in percentage
  destX: number // random end X offset
  color: string
  size: number
  delay: number
  duration: number
  rotate: number
  borderRadius: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export function CelebrationModal({ celebration, onDismiss, isDismissing }: CelebrationModalProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([])

  useEffect(() => {
    if (celebration) {
      // Generate 60 random particles spraying from center
      const items = Array.from({ length: 60 }).map((_, idx) => {
        const angle = Math.random() * Math.PI * 2
        const distance = 100 + Math.random() * 300
        const destX = Math.cos(angle) * distance
        return {
          id: idx,
          x: 50, // center X
          y: 40, // center Y
          destX,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 6 + Math.random() * 8,
          delay: Math.random() * 0.1,
          duration: 1.5 + Math.random() * 1.5,
          rotate: Math.random() * 720,
          borderRadius: Math.random() > 0.4 ? '50%' : '3px',
        }
      })
      const handle = requestAnimationFrame(() => {
        setParticles(items)
      })
      return () => cancelAnimationFrame(handle)
    } else {
      const handle = requestAnimationFrame(() => {
        setParticles([])
      })
      return () => cancelAnimationFrame(handle)
    }
  }, [celebration])

  if (!celebration) return null

  const isLevel = celebration.type === 'level'
  const val = celebration.value

  // Safely extract values based on type
  const titleText = isLevel ? `Reached Level ${val}!` : (val as AchievementItem).title
  const descText = isLevel 
    ? `Congratulations! You've unlocked Level ${val}. Keep completing your daily routines to progress further.` 
    : (val as AchievementItem).description
  const rewardXp = isLevel ? 50 : (val as AchievementItem).xpReward

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop filter blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="absolute inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
        />

        {/* Confetti particles container */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 1,
                scale: 0,
                x: `${p.x}vw`,
                y: `${p.y}vh`,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0.5, 1.2, 0.4],
                x: `calc(${p.x}vw + ${p.destX}px)`,
                y: `calc(${p.y}vh + 45vh)`, // falls down
                rotate: p.rotate,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.borderRadius,
              }}
            />
          ))}
        </div>

        {/* Celebrations Card Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative max-w-sm w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6 overflow-hidden text-center select-none"
        >
          {/* Top close trigger */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-1 rounded-lg border border-border/40 hover:bg-muted/80 text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Golden glow decoration */}
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

          {/* Celebration Logo/Badge */}
          <div className="flex justify-center mb-5">
            {isLevel ? (
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent to-indigo-600 flex items-center justify-center shadow-lg border border-white/10"
              >
                <Shield className="h-10 w-10 text-white" />
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest leading-none">LVL</span>
                  <span className="text-2xl font-black text-white leading-none">{(val as number)}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg border border-white/10"
              >
                <Trophy className="h-10 w-10 text-white" />
              </motion.div>
            )}
          </div>

          {/* Subtitles */}
          <span className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {isLevel ? 'New Progression Unlocked' : 'Achievement Unlocked!'}
          </span>

          <h2 className="text-xl font-black text-foreground leading-snug">
            {titleText}
          </h2>

          <p className="text-xs text-muted-foreground mt-2 leading-relaxed px-2">
            {descText}
          </p>

          {/* Reward highlights */}
          <div className="my-5 p-3 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold text-foreground">
              +{rewardXp} XP Reward Claimed
            </span>
          </div>

          <Button
            onClick={onDismiss}
            disabled={isDismissing}
            className="w-full font-bold select-none cursor-pointer"
          >
            {isDismissing ? 'Claiming...' : 'Collect Reward'}
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
