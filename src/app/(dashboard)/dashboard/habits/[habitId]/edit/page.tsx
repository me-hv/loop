'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUIStore } from '@/store/use-ui-store'
import { useHabitQuery, useUpdateHabitMutation } from '@/features/habits/hooks/use-habits'
import { HabitForm, HabitFormValues } from '@/features/habits/components/HabitForm'
import { PageHeader } from '@/components/common/page-header'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EditHabitPage() {
  const router = useRouter()
  const params = useParams()
  const habitId = params.habitId as string
  const addToast = useUIStore((state) => state.addToast)

  // 1. Queries & Mutations
  const { data: habit, isLoading, isError } = useHabitQuery(habitId)
  const updateMutation = useUpdateHabitMutation()

  const handleSubmit = async (data: HabitFormValues) => {
    try {
      await updateMutation.mutateAsync({ habitId, data })
      addToast({
        message: `Habit "${data.title}" updated successfully.`,
        type: 'success',
      })
      router.push('/dashboard/habits')
    } catch (error) {
      console.error('Error updating habit:', error)
      addToast({
        message: 'Failed to update habit. Please try again.',
        type: 'error',
      })
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
      <Card className="max-w-md mx-auto border-destructive/20 bg-destructive/5 text-center mt-12">
        <CardContent className="p-6 space-y-4">
          <div className="mx-auto p-3 w-fit rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">Habit not found</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The habit you are trying to edit does not exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/dashboard/habits')} className="cursor-pointer gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Habits
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title={`Edit ${habit.title}`}
        description="Update your routine parameters, frequencies, or measurement goals."
      />
      <HabitForm
        onSubmit={handleSubmit}
        initialValues={habit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Save Changes"
      />
    </div>
  )
}
