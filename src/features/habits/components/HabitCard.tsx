'use client'

import React from 'react'
import Link from 'next/link'
import { Habit } from '../types'
import { getHabitColor, getHabitIcon } from '../utils/icons'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  MoreVertical,
  Eye,
  Edit2,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface HabitCardProps {
  habit: Habit
  onArchive: (id: string, isArchived: boolean) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  index: number
}

export function HabitCard({ habit, onArchive, onDelete, onDuplicate, index }: HabitCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const colorPreset = getHabitColor(habit.color)

  const difficultyColors = {
    easy: 'border-success/30 bg-success/5 text-success dark:text-success/90',
    medium: 'border-amber-500/30 bg-amber-500/5 text-amber-500 dark:text-amber-400',
    hard: 'border-destructive/30 bg-destructive/5 text-destructive dark:text-destructive/90',
  }

  const handleDeleteConfirm = () => {
    onDelete(habit.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group relative"
      >
        <div className="border border-border/55 bg-card hover:border-border/95 hover:shadow-md hover:-translate-y-0.5 rounded-xl p-5 transition-all duration-300 flex flex-col justify-between h-[200px] overflow-hidden">
          {/* Header (Icon + Dropdown Actions) */}
          <div className="flex items-start justify-between">
            <div className={cn('p-2.5 rounded-lg flex items-center justify-center border', colorPreset.bgClass, colorPreset.borderClass, colorPreset.textClass)}>
              {React.createElement(getHabitIcon(habit.icon), { className: 'h-5 w-5' })}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'h-8 w-8 rounded-full border border-transparent hover:border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none'
                )}
                aria-label="Habit Actions"
              >
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="p-0">
                  <Link
                    href={`/dashboard/habits/${habit.id}`}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 cursor-pointer text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Link
                    href={`/dashboard/habits/${habit.id}/edit`}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 cursor-pointer text-sm font-medium"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit habit</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(habit.id)} className="cursor-pointer">
                  <Copy className="h-4 w-4" />
                  <span>Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onArchive(habit.id, !habit.isArchived)}
                  className="cursor-pointer"
                >
                  {habit.isArchived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4" />
                      <span>Unarchive</span>
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />
                      <span>Archive</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="destructive"
                  className="cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span>Delete habit</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title & Category */}
          <div className="mt-3 space-y-1 select-none flex-grow">
            <h3 className="font-sans font-bold text-sm tracking-tight text-foreground truncate group-hover:text-accent transition-colors">
              {habit.title}
            </h3>
            {habit.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 truncate">
                {habit.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {habit.category}
              </span>
              {habit.isArchived && (
                <Badge variant="outline" className="text-[9px] border-muted text-muted-foreground py-0 px-1 text-center scale-90">
                  Archived
                </Badge>
              )}
            </div>
          </div>

          {/* Footer (Goal & Frequency Badge + Difficulty Badge) */}
          <div className="mt-4 pt-3 border-t border-border/45 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span>
                {habit.goal} {habit.unit.toLowerCase()} / {habit.frequency.toLowerCase()}
              </span>
            </div>

            <Badge
              variant="outline"
              className={cn(
                'text-[10px] font-semibold capitalize py-0 px-2 border',
                difficultyColors[habit.difficulty]
              )}
            >
              {habit.difficulty}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete &quot;{habit.title}&quot;? This action will archive and hide the habit. You can restore it later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="cursor-pointer"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
