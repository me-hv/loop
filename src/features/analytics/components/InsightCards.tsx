'use client'

import React from 'react'
import { ProgressInsight } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Zap, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface InsightCardsProps {
  insights: ProgressInsight[]
}

const ICON_MAP: Record<string, React.ElementType> = {
  Trophy: Trophy,
  Zap: Zap,
  TrendingUp: TrendingUp,
  TrendingDown: TrendingDown,
  Info: Info,
}

const TYPE_CLASSES = {
  success: {
    border: 'border-green-500/20 bg-green-500/5',
    iconColor: 'text-green-500',
    iconBg: 'bg-green-500/10',
  },
  warning: {
    border: 'border-destructive/20 bg-destructive/5',
    iconColor: 'text-destructive',
    iconBg: 'bg-destructive/10',
  },
  info: {
    border: 'border-blue-500/20 bg-blue-500/5',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
  },
}

export function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 select-none">
        <SparklesIcon className="h-4.5 w-4.5 text-accent animate-pulse" />
        <h2 className="text-sm font-bold text-foreground">Behavioral Insights</h2>
        <span className="text-[10px] text-muted-foreground/60">— Pattern analysis</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => {
          const classes = TYPE_CLASSES[insight.type]
          const Icon = insight.icon ? (ICON_MAP[insight.icon] || Info) : Info

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={cn('border border-border/40 hover:border-border/60 transition-colors shadow-sm select-none', classes.border)}>
                <CardContent className="p-4 flex gap-3.5 items-start">
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0', classes.iconBg)}>
                    <Icon className={cn('h-4.5 w-4.5', classes.iconColor)} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-foreground leading-tight">
                      {insight.title}
                    </h4>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  )
}
