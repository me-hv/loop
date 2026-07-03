'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface DailyProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
}

export function DailyProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
}: DailyProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Track Circle */}
        <circle
          className="text-muted/20"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Animated Foreground Circle */}
        <circle
          className="text-accent transition-all duration-700 ease-out"
          stroke="currentColor"
          strokeLinecap="round"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transitionProperty: 'stroke-dashoffset' }}
        />
      </svg>

      {/* Central text displaying percentage */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={percentage}
          className="text-2xl font-black tracking-tight text-foreground"
        >
          {percentage}%
        </motion.span>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
          Completed
        </span>
      </div>
    </div>
  )
}
