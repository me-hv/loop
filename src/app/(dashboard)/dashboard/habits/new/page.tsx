'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/use-auth-store'
import { useUIStore } from '@/store/use-ui-store'
import { useCreateHabitMutation } from '@/features/habits/hooks/use-habits'
import { HabitForm, HabitFormValues } from '@/features/habits/components/HabitForm'
import { PageHeader } from '@/components/common/page-header'

export default function NewHabitPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const addToast = useUIStore((state) => state.addToast)
  const createMutation = useCreateHabitMutation()

  const handleSubmit = async (data: HabitFormValues) => {
    if (!user) return
    try {
      await createMutation.mutateAsync({ userId: user.uid, data })
      addToast({
        message: `Habit "${data.title}" created successfully! 🔁`,
        type: 'success',
      })
      router.push('/dashboard/habits')
    } catch (error) {
      console.error('Error creating habit:', error)
      addToast({
        message: 'Failed to create habit. Please try again.',
        type: 'error',
      })
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Create Habit"
        description="Establish a new routine and set your consistency goals."
      />
      <HabitForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel="Create Habit"
      />
    </div>
  )
}
