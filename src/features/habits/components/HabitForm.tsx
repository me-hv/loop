'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { habitSchema } from '../schemas'
import { Habit, HabitCategory, HabitDifficulty, HabitFrequency, GoalUnit } from '../types'
import { HABIT_COLORS, HABIT_ICONS, getHabitIcon } from '../utils/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { Check, Info } from 'lucide-react'

// Pre-defined categories
const CATEGORIES: HabitCategory[] = [
  'Health',
  'Fitness',
  'Reading',
  'Coding',
  'Learning',
  'Meditation',
  'Finance',
  'Business',
  'Personal',
  'Custom',
]

// Pre-defined frequencies
const FREQUENCIES: HabitFrequency[] = [
  'Daily',
  'Weekly',
  'Monthly',
  'Weekdays',
  'Weekends',
  'Custom',
]

// Pre-defined units
const UNITS: GoalUnit[] = ['Times', 'Minutes', 'Hours', 'Pages', 'Kilometers', 'Liters', 'Custom']

export type HabitFormValues = z.infer<typeof habitSchema>

interface HabitFormProps {
  onSubmit: (data: HabitFormValues) => void
  initialValues?: Partial<Habit>
  isSubmitting?: boolean
  submitLabel?: string
}

export function HabitForm({
  onSubmit,
  initialValues,
  isSubmitting = false,
  submitLabel = 'Save Habit',
}: HabitFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      category: initialValues?.category || 'Health',
      color: initialValues?.color || 'indigo',
      icon: initialValues?.icon || 'target',
      frequency: initialValues?.frequency || 'Daily',
      goal: initialValues?.goal || 1,
      unit: initialValues?.unit || 'Times',
      difficulty: initialValues?.difficulty || 'medium',
      isArchived: initialValues?.isArchived || false,
      notes: initialValues?.notes || '',
    },
  })

  const currentCategory = watch('category')
  const currentColor = watch('color')
  const currentIcon = watch('icon')
  const currentDifficulty = watch('difficulty')
  const currentFrequency = watch('frequency')
  const currentUnit = watch('unit')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFormSubmit = (data: any) => {
    onSubmit(data as HabitFormValues)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Title & Description */}
      <div className="space-y-4 bg-card p-6 rounded-xl border border-border/50 shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Habit Title
          </label>
          <Input
            type="text"
            placeholder="e.g. Morning Meditation, Read Books"
            {...register('title')}
            className={cn(
              'h-10 text-sm font-medium',
              errors.title ? 'border-destructive focus-visible:ring-destructive/35' : ''
            )}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="text-xs font-semibold text-destructive mt-1">
              {errors.title.message as string}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Description (Optional)
          </label>
          <Input
            type="text"
            placeholder="e.g. Keep my mind focused and clear for the day"
            {...register('description')}
            className="h-10 text-sm"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Category Grid */}
      <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Select Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setValue('category', cat)}
              disabled={isSubmitting}
              className={cn(
                'py-2 px-3 text-xs font-semibold rounded-lg border cursor-pointer transition-all flex items-center justify-center',
                currentCategory === cat
                  ? 'bg-accent text-white border-transparent'
                  : 'bg-card text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Colors & Icons Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Preset Selector */}
        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Choose Color
          </label>
          <div className="flex flex-wrap gap-2.5">
            {HABIT_COLORS.map((col) => {
              const isActive = currentColor === col.value
              return (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setValue('color', col.value)}
                  disabled={isSubmitting}
                  className={cn(
                    'h-8 w-8 rounded-full border flex items-center justify-center cursor-pointer transition-all relative',
                    col.bgClass,
                    col.textClass,
                    isActive ? 'border-foreground border-2 scale-110' : col.borderClass
                  )}
                  title={col.name}
                >
                  {isActive && <Check className="h-4 w-4 stroke-[3px]" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Icon Preset Grid */}
        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Choose Icon
          </label>
          <div className="grid grid-cols-6 gap-2">
            {Object.keys(HABIT_ICONS).map((iconKey) => {
              const IconComp = getHabitIcon(iconKey)
              const isActive = currentIcon === iconKey
              return (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => setValue('icon', iconKey)}
                  disabled={isSubmitting}
                  className={cn(
                    'h-10 rounded-lg flex items-center justify-center cursor-pointer border transition-all',
                    isActive
                      ? 'bg-accent/15 border-accent text-accent scale-105'
                      : 'border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <IconComp className="h-4 w-4" />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Goal & Unit Picker */}
      <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Daily Target / Goal
            </label>
            <Input
              type="number"
              min="0.1"
              step="any"
              placeholder="e.g. 20, 1, 30"
              {...register('goal')}
              className={cn(
                'h-10 text-sm font-medium',
                errors.goal ? 'border-destructive focus-visible:ring-destructive/35' : ''
              )}
              disabled={isSubmitting}
            />
            {errors.goal && (
              <p className="text-xs font-semibold text-destructive mt-1">
                {errors.goal.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Measurement Unit
            </label>
            <select
              value={currentUnit}
              onChange={(e) => setValue('unit', e.target.value as GoalUnit)}
              disabled={isSubmitting}
              className="w-full h-10 px-3 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-transparent transition-all cursor-pointer"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 bg-muted/40 dark:bg-muted/10 rounded-lg flex items-start gap-2.5">
          <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Example logic: Your goal will be to complete <strong>{Number(watch('goal')) || 0}</strong>{' '}
            <strong>{currentUnit.toLowerCase()}</strong> per day.
          </p>
        </div>
      </div>

      {/* Frequency & Difficulty Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frequency Tabs */}
        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setValue('frequency', freq)}
                disabled={isSubmitting}
                className={cn(
                  'py-2 px-3 text-xs font-semibold rounded-lg border cursor-pointer transition-all flex items-center justify-center',
                  currentFrequency === freq
                    ? 'bg-accent/15 text-accent border-accent'
                    : 'bg-card text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground'
                )}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Control */}
        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as HabitDifficulty[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setValue('difficulty', level)}
                disabled={isSubmitting}
                className={cn(
                  'py-2 px-3 text-xs font-semibold rounded-lg border capitalize cursor-pointer transition-all flex items-center justify-center',
                  currentDifficulty === level
                    ? cn(
                        'border-transparent text-white',
                        level === 'easy' && 'bg-success',
                        level === 'medium' && 'bg-amber-500',
                        level === 'hard' && 'bg-destructive'
                      )
                    : 'bg-card text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reminder Placeholder & Archiving options */}
      <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-4">
        {/* Toggle Reminders (UI Only) */}
        <div className="flex items-center justify-between pb-3 border-b border-border/55">
          <div>
            <label className="text-sm font-semibold text-foreground block">Daily Reminder</label>
            <span className="text-xs text-muted-foreground block">
              Enable custom push notifications (Placeholder UI)
            </span>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
            disabled
          />
        </div>

        {/* Archive Toggle Option */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-foreground block">Archive Habit</label>
            <span className="text-xs text-muted-foreground block">
              Hide this habit from the default home lists
            </span>
          </div>
          <Controller
            name="isArchived"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                id="isArchived"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
                disabled={isSubmitting}
              />
            )}
          />
        </div>
      </div>

      {/* Notes Field */}
      <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Extra Notes / Details
        </label>
        <Textarea
          placeholder="e.g. Read physical book, drink room-temperature water..."
          {...register('notes')}
          className="min-h-[80px] text-sm resize-none"
          disabled={isSubmitting}
        />
      </div>

      {/* Form Submission Actions */}
      <div className="flex items-center gap-3 justify-end pt-2">
        <Button
          type="submit"
          className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px] font-medium h-9"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2 border-t-white" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
