import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { habitsService } from '../services/habits-service'
import { Habit } from '../types'

// 1. Hook to fetch all habits for a user
export function useHabitsQuery(userId: string | undefined) {
  return useQuery<Habit[]>({
    queryKey: ['habits', userId],
    queryFn: () => habitsService.getHabits(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}

// 2. Hook to fetch a single habit by ID
export function useHabitQuery(habitId: string | undefined) {
  return useQuery<Habit | null>({
    queryKey: ['habit', habitId],
    queryFn: () => habitsService.getHabit(habitId!),
    enabled: !!habitId,
    staleTime: 1000 * 60 * 5,
  })
}

// 3. Hook to create a new habit
export function useCreateHabitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string
      data: Omit<Habit, 'id' | 'userId' | 'isDeleted' | 'createdAt' | 'updatedAt'>
    }) => habitsService.createHabit(userId, data),
    onSuccess: (newHabit) => {
      // Invalidate list queries for this user
      queryClient.invalidateQueries({ queryKey: ['habits', newHabit.userId] })
    },
  })
}

// 4. Hook to update an existing habit
export function useUpdateHabitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      habitId,
      data,
    }: {
      habitId: string
      data: Partial<Omit<Habit, 'id' | 'userId'>>
    }) => habitsService.updateHabit(habitId, data),
    onSuccess: (_, variables) => {
      // Refetch specific habit and list queries
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['habit', variables.habitId] })
    },
  })
}

// 5. Hook to soft-delete a habit
export function useDeleteHabitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (habitId: string) => habitsService.deleteHabit(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}

// 6. Hook to duplicate a habit
export function useDuplicateHabitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (habitId: string) => habitsService.duplicateHabit(habitId),
    onSuccess: (newHabit) => {
      queryClient.invalidateQueries({ queryKey: ['habits', newHabit.userId] })
    },
  })
}
