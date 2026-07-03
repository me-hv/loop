import {
  Dumbbell,
  BookOpen,
  Flame,
  Heart,
  Brain,
  Code,
  Coins,
  Coffee,
  Sparkles,
  Smile,
  Compass,
  Target,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'

export interface ColorPreset {
  value: string
  name: string
  bgClass: string
  textClass: string
  borderClass: string
  ringClass: string
}

export const HABIT_COLORS: ColorPreset[] = [
  {
    value: 'indigo',
    name: 'Indigo',
    bgClass: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    textClass: 'text-indigo-500 dark:text-indigo-400',
    borderClass: 'border-indigo-500/30',
    ringClass: 'focus-visible:ring-indigo-500/30',
  },
  {
    value: 'emerald',
    name: 'Emerald',
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    textClass: 'text-emerald-500 dark:text-emerald-400',
    borderClass: 'border-emerald-500/30',
    ringClass: 'focus-visible:ring-emerald-500/30',
  },
  {
    value: 'rose',
    name: 'Rose',
    bgClass: 'bg-rose-500/10 dark:bg-rose-500/15',
    textClass: 'text-rose-500 dark:text-rose-400',
    borderClass: 'border-rose-500/30',
    ringClass: 'focus-visible:ring-rose-500/30',
  },
  {
    value: 'amber',
    name: 'Amber',
    bgClass: 'bg-amber-500/10 dark:bg-amber-500/15',
    textClass: 'text-amber-500 dark:text-amber-400',
    borderClass: 'border-amber-500/30',
    ringClass: 'focus-visible:ring-amber-500/30',
  },
  {
    value: 'blue',
    name: 'Blue',
    bgClass: 'bg-blue-500/10 dark:bg-blue-500/15',
    textClass: 'text-blue-500 dark:text-blue-400',
    borderClass: 'border-blue-500/30',
    ringClass: 'focus-visible:ring-blue-500/30',
  },
  {
    value: 'violet',
    name: 'Violet',
    bgClass: 'bg-violet-500/10 dark:bg-violet-500/15',
    textClass: 'text-violet-500 dark:text-violet-400',
    borderClass: 'border-violet-500/30',
    ringClass: 'focus-visible:ring-violet-500/30',
  },
  {
    value: 'cyan',
    name: 'Cyan',
    bgClass: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    textClass: 'text-cyan-500 dark:text-cyan-400',
    borderClass: 'border-cyan-500/30',
    ringClass: 'focus-visible:ring-cyan-500/30',
  },
  {
    value: 'orange',
    name: 'Orange',
    bgClass: 'bg-orange-500/10 dark:bg-orange-500/15',
    textClass: 'text-orange-500 dark:text-orange-400',
    borderClass: 'border-orange-500/30',
    ringClass: 'focus-visible:ring-orange-500/30',
  },
]

export const HABIT_ICONS: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  book: BookOpen,
  flame: Flame,
  heart: Heart,
  brain: Brain,
  code: Code,
  coins: Coins,
  coffee: Coffee,
  sparkles: Sparkles,
  smile: Smile,
  compass: Compass,
  target: Target,
}

export function getHabitIcon(iconName: string): LucideIcon {
  return HABIT_ICONS[iconName] || HelpCircle
}

export function getHabitColor(colorValue: string): ColorPreset {
  return (
    HABIT_COLORS.find((c) => c.value === colorValue) || {
      value: 'zinc',
      name: 'Zinc',
      bgClass: 'bg-zinc-500/10',
      textClass: 'text-zinc-500',
      borderClass: 'border-zinc-500/30',
      ringClass: 'focus-visible:ring-zinc-500/30',
    }
  )
}
