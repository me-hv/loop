'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface SleepRatingProps {
  value: number
  onChange: (val: number) => void
}

const SLEEP_LABELS = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent']

export function SleepRating({ value, onChange }: SleepRatingProps) {
  const [hoverVal, setHoverVal] = useState<number | null>(null)

  const activeVal = hoverVal !== null ? hoverVal : value

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Sleep Quality
        </label>
        {activeVal > 0 && (
          <span className="text-xs font-black text-yellow-500 transition-all">
            {SLEEP_LABELS[activeVal - 1]}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 pt-1">
        {Array.from({ length: 5 }).map((_, idx) => {
          const starVal = idx + 1
          const isFilled = activeVal >= starVal

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(starVal)}
              onMouseEnter={() => setHoverVal(starVal)}
              onMouseLeave={() => setHoverVal(null)}
              className="relative p-0.5 group focus:outline-none cursor-pointer"
              aria-label={`Rate sleep ${starVal} out of 5`}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Star
                  className={cn(
                    'h-6 w-6 stroke-[1.5px] transition-all duration-200',
                    isFilled
                      ? 'text-yellow-500 fill-yellow-500/25 drop-shadow-[0_0_4px_rgba(234,179,8,0.25)] stroke-[2px]'
                      : 'text-border/60 hover:text-yellow-500/60'
                  )}
                />
              </motion.div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
