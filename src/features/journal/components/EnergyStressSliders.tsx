'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StepSliderProps {
  label: string
  value: number
  onChange: (val: number) => void
  steps: string[]
  colorClass: string
}

function StepSlider({ label, value, onChange, steps, colorClass }: StepSliderProps) {
  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        <span className={cn('text-xs font-black px-2 py-0.5 rounded-full text-white', colorClass)}>
          {steps[value - 1]}
        </span>
      </div>

      {/* Horizontal Steps Selection bar */}
      <div className="relative flex items-center justify-between gap-1 w-full pt-1.5 pb-3">
        {/* Track Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border/40 rounded-full" />
        
        {/* Fill Line */}
        <div 
          className={cn('absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full transition-all duration-300')}
          style={{ 
            width: `${((value - 1) / (steps.length - 1)) * 100}%`,
            background: colorClass.includes('indigo') ? '#6366f1' : '#f43f5e'
          }}
        />

        {steps.map((_, idx) => {
          const stepVal = idx + 1
          const isActive = value === stepVal
          const isPassed = stepVal < value

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(stepVal)}
              className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              {/* Dot indicator */}
              <motion.div
                animate={{
                  scale: isActive ? 1.25 : 1,
                }}
                className={cn(
                  'h-4.5 w-4.5 rounded-full border-2 bg-background flex items-center justify-center transition-all duration-200',
                  isActive
                    ? colorClass.includes('indigo')
                      ? 'border-accent'
                      : 'border-destructive'
                    : isPassed
                      ? colorClass.includes('indigo')
                        ? 'border-accent bg-accent/10'
                        : 'border-destructive bg-destructive/10'
                      : 'border-border/60'
                )}
              >
                {/* Inner dot */}
                {isActive && (
                  <div 
                    className={cn(
                      'h-2 w-2 rounded-full',
                      colorClass.includes('indigo') ? 'bg-accent' : 'bg-destructive'
                    )} 
                  />
                )}
              </motion.div>
              
              {/* Label */}
              <span 
                className={cn(
                  'text-[8px] font-bold mt-2 select-none tracking-tight transition-colors',
                  isActive ? 'text-foreground font-black' : 'text-muted-foreground/60 group-hover:text-foreground'
                )}
              >
                {stepVal}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface EnergyStressSlidersProps {
  energy: number
  stress: number
  onEnergyChange: (val: number) => void
  onStressChange: (val: number) => void
}

const ENERGY_STEPS = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
const STRESS_STEPS = ['None', 'Low', 'Moderate', 'High', 'Extreme']

export function EnergyStressSliders({
  energy,
  stress,
  onEnergyChange,
  onStressChange,
}: EnergyStressSlidersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StepSlider
        label="Energy Level"
        value={energy}
        onChange={onEnergyChange}
        steps={ENERGY_STEPS}
        colorClass="bg-accent"
      />
      <StepSlider
        label="Stress Level"
        value={stress}
        onChange={onStressChange}
        steps={STRESS_STEPS}
        colorClass="bg-destructive"
      />
    </div>
  )
}
