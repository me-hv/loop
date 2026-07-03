'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUIStore } from '@/store/use-ui-store'
import {
  useHabitQuery,
  useUpdateHabitMutation,
  useDeleteHabitMutation,
} from '@/features/habits/hooks/use-habits'
import { getHabitColor, getHabitIcon } from '@/features/habits/utils/icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Edit,
  Archive,
  ArchiveRestore,
  Trash2,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HabitDetailPage() {
  const router = useRouter()
  const params = useParams()
  const habitId = params.habitId as string
  const addToast = useUIStore((state) => state.addToast)

  // Queries & Mutations
  const { data: habit, isLoading, isError } = useHabitQuery(habitId)
  const updateMutation = useUpdateHabitMutation()
  const deleteMutation = useDeleteHabitMutation()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const handleArchiveToggle = async () => {
    if (!habit) return
    try {
      const nextArchiveState = !habit.isArchived
      await updateMutation.mutateAsync({
        habitId,
        data: { isArchived: nextArchiveState },
      })
      addToast({
        message: nextArchiveState ? 'Habit archived successfully.' : 'Habit unarchived successfully.',
        type: 'success',
      })
    } catch {
      addToast({ message: 'Failed to update archive status.', type: 'error' })
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(habitId)
      addToast({ message: 'Habit deleted successfully.', type: 'success' })
      router.push('/dashboard/habits')
    } catch {
      addToast({ message: 'Failed to delete habit.', type: 'error' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Spinner size="lg" className="border-t-accent" />
        <span className="text-xs text-muted-foreground animate-pulse">Loading habit details...</span>
      </div>
    )
  }

  if (isError || !habit) {
    return (
      <Card className="max-w-md mx-auto border-destructive/20 bg-destructive/5 text-center mt-12 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="mx-auto p-3 w-fit rounded-full bg-destructive/10 text-destructive">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Habit not found</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The habit you are trying to view does not exist or has been deleted.
          </p>
          <Link href="/dashboard/habits" className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer gap-2')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Habits
          </Link>
        </CardContent>
      </Card>
    )
  }

  const colorPreset = getHabitColor(habit.color)

  const difficultyColors = {
    easy: 'border-success/30 bg-success/5 text-success dark:text-success/90',
    medium: 'border-amber-500/30 bg-amber-500/5 text-amber-500 dark:text-amber-400',
    hard: 'border-destructive/30 bg-destructive/5 text-destructive dark:text-destructive/90',
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 select-none">
      {/* Back Button */}
      <Link
        href="/dashboard/habits"
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group mb-2"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Habits
      </Link>

      {/* Header Info Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border/55 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn('p-3.5 rounded-xl flex items-center justify-center border shrink-0', colorPreset.bgClass, colorPreset.borderClass, colorPreset.textClass)}>
            {React.createElement(getHabitIcon(habit.icon), { className: 'h-6 w-6' })}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-display text-2xl font-extrabold tracking-tight text-foreground truncate">
                {habit.title}
              </h1>
              {habit.isArchived && (
                <Badge variant="outline" className="text-[9px] border-muted text-muted-foreground py-0.5 px-2">
                  Archived
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Category: <strong className="text-foreground uppercase tracking-wide">{habit.category}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/habits/${habitId}/edit`}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'cursor-pointer gap-1.5 h-9 text-xs border-border/60 hover:bg-muted'
            )}
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchiveToggle}
            className="cursor-pointer gap-1.5 h-9 text-xs border-border/60 hover:bg-muted"
          >
            {habit.isArchived ? (
              <>
                <ArchiveRestore className="h-3.5 w-3.5" />
                <span>Unarchive</span>
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5" />
                <span>Archive</span>
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer gap-1.5 h-9 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Detail breakdown grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Habit Info & Notes) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/55">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                About this routine
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Description
                </h4>
                <p className="text-sm leading-relaxed text-foreground">
                  {habit.description || 'No description provided.'}
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-1.5 pt-4 border-t border-border/40">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Extra Notes
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {habit.notes || 'No extra notes.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Parameters Sidebar) */}
        <div className="space-y-6">
          <Card className="border-border/55">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Frequency details */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Frequency</span>
                <span className="font-semibold text-foreground">{habit.frequency}</span>
              </div>

              {/* Target Goal details */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Target Goal</span>
                <span className="font-semibold text-foreground">
                  {habit.goal} {habit.unit}
                </span>
              </div>

              {/* Difficulty details */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Difficulty</span>
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

              {/* Time stamps */}
              <div className="pt-4 border-t border-border/40 space-y-2.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span>Created: {new Date(habit.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span>Updated: {new Date(habit.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
    </div>
  )
}
