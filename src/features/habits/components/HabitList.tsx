'use client'

import React from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/use-auth-store'
import { useUIStore } from '@/store/use-ui-store'
import {
  useHabitsQuery,
  useUpdateHabitMutation,
  useDeleteHabitMutation,
  useDuplicateHabitMutation,
} from '../hooks/use-habits'
import { HabitCategory } from '../types'
import { HabitCard } from './HabitCard'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/common/page-header'
import {
  Search,
  Plus,
  SlidersHorizontal,
  RotateCcw,
  Inbox,
  AlertTriangle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function HabitList() {
  const user = useAuthStore((state) => state.user)
  const addToast = useUIStore((state) => state.addToast)

  // 1. Fetch habits query
  const { data: habits = [], isLoading, isError, refetch } = useHabitsQuery(user?.uid)

  // 2. Mutations
  const updateMutation = useUpdateHabitMutation()
  const deleteMutation = useDeleteHabitMutation()
  const duplicateMutation = useDuplicateHabitMutation()

  // 3. State management for filters/sorting
  const [searchTerm, setSearchTerm] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>('all')
  const [frequencyFilter, setFrequencyFilter] = React.useState<string>('all')
  const [showArchived, setShowArchived] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<string>('newest')
  const [showFiltersPanel, setShowFiltersPanel] = React.useState(false)

  // Handlers for mutations
  const handleArchive = async (id: string, isArchived: boolean) => {
    try {
      await updateMutation.mutateAsync({ habitId: id, data: { isArchived } })
      addToast({
        message: isArchived ? 'Habit archived successfully.' : 'Habit unarchived successfully.',
        type: 'success',
      })
    } catch {
      addToast({ message: 'Failed to archive habit.', type: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      addToast({ message: 'Habit deleted successfully.', type: 'success' })
    } catch {
      addToast({ message: 'Failed to delete habit.', type: 'error' })
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMutation.mutateAsync(id)
      addToast({ message: 'Habit duplicated successfully.', type: 'success' })
    } catch {
      addToast({ message: 'Failed to duplicate habit.', type: 'error' })
    }
  }

  // Clear all active filters
  const handleResetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setDifficultyFilter('all')
    setFrequencyFilter('all')
    setShowArchived(false)
    setSortBy('newest')
  }

  // 4. Filtering logic
  const filteredHabits = React.useMemo(() => {
    return habits
      .filter((habit) => {
        // Search term check
        const matchesSearch =
          habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (habit.description &&
            habit.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          habit.category.toLowerCase().includes(searchTerm.toLowerCase())

        // Category filter check
        const matchesCategory = categoryFilter === 'all' || habit.category === categoryFilter

        // Difficulty filter check
        const matchesDifficulty =
          difficultyFilter === 'all' || habit.difficulty === difficultyFilter

        // Frequency filter check
        const matchesFrequency = frequencyFilter === 'all' || habit.frequency === frequencyFilter

        // Archive status filter check
        // If showArchived is true, show ONLY archived. Else show ONLY active.
        const matchesArchive = habit.isArchived === showArchived

        return matchesSearch && matchesCategory && matchesDifficulty && matchesFrequency && matchesArchive
      })
      .sort((a, b) => {
        // 5. Sorting logic
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
        if (sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title)
        }
        if (sortBy === 'updated') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        }
        return 0
      })
  }, [habits, searchTerm, categoryFilter, difficultyFilter, frequencyFilter, showArchived, sortBy])

  // Category list for filters
  const categories: HabitCategory[] = [
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

  // Skeletons rendering during query loading states
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <PageHeader title="Habits" description="Organize and review your loops." />
        <div className="h-10 bg-muted/30 rounded-lg animate-pulse w-full max-w-lg mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[200px] rounded-xl border border-border/40 bg-muted/10 animate-pulse p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-10 w-10 bg-muted/40 rounded-lg" />
                <div className="h-8 w-8 bg-muted/40 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted/40 rounded w-2/3" />
                <div className="h-3 bg-muted/40 rounded w-1/2" />
              </div>
              <div className="pt-4 border-t border-muted/20 flex justify-between">
                <div className="h-3 bg-muted/40 rounded w-1/3" />
                <div className="h-4 bg-muted/40 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state view
  if (isError) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <div className="mx-auto p-3 w-fit rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Failed to load habits</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          An error occurred while fetching your habit documents. Please check your Firestore database or network connection.
        </p>
        <Button onClick={() => refetch()} className="cursor-pointer">
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={showArchived ? 'Archived Habits' : 'Your Habits'}
        description={
          showArchived
            ? 'Review and restore previously tracked routines.'
            : 'Track routines and build consistency.'
        }
        actions={
          <Link href="/dashboard/habits/new" className={cn(buttonVariants(), 'cursor-pointer gap-2 bg-accent hover:bg-accent/90 text-white font-medium')}>
            <Plus className="h-4 w-4" />
            New Habit
          </Link>
        }
      />

      {/* Filters & Actions Bar */}
      <div className="space-y-3 bg-card p-4 rounded-xl border border-border/55 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-muted-foreground/60" />
            <Input
              type="text"
              placeholder="Search habits by title, description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={cn('gap-1.5 h-9 cursor-pointer border-border/60', showFiltersPanel && 'bg-muted')}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-2 text-xs rounded-md border border-input bg-card text-foreground focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A-Z Title</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Expandable Advanced Filters Panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-3 border-t border-border/40"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* Category select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full h-8 px-2 rounded border border-input bg-card text-foreground cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Difficulty</label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full h-8 px-2 rounded border border-input bg-card text-foreground cursor-pointer"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Frequency select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Frequency</label>
                  <select
                    value={frequencyFilter}
                    onChange={(e) => setFrequencyFilter(e.target.value)}
                    className="w-full h-8 px-2 rounded border border-input bg-card text-foreground cursor-pointer"
                  >
                    <option value="all">All Frequencies</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Custom">Custom Days</option>
                  </select>
                </div>

                {/* Toggle Archive status */}
                <div className="flex items-end justify-between gap-2 h-8 pb-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="toggleArchived"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
                    />
                    <label htmlFor="toggleArchived" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                      View Archived Habits
                    </label>
                  </div>
                  
                  {(searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all' || frequencyFilter !== 'all' || showArchived) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetFilters}
                      className="h-6 px-2 text-[10px] font-bold text-accent cursor-pointer hover:bg-accent/10 flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Habits Grid / Empty State */}
      <AnimatePresence mode="popLayout">
        {filteredHabits.length === 0 ? (
          <motion.div
            key="empty-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="border border-border/55 bg-card/60 backdrop-blur-md rounded-xl p-12 text-center max-w-lg mx-auto py-16 space-y-4 shadow-sm"
          >
            <div className="mx-auto p-4 w-fit rounded-full bg-accent/10 text-accent mb-2 animate-pulse">
              <Inbox className="h-10 w-10 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Your journey starts here</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {showArchived
                  ? 'No archived habits matched your current filters.'
                  : 'Start building consistency. Define your routines, set goals, and stay in the loop.'}
              </p>
            </div>
            {!showArchived && (
              <Link href="/dashboard/habits/new" className={cn(buttonVariants({ size: 'sm' }), 'cursor-pointer inline-flex bg-accent hover:bg-accent/90 text-white font-medium')}>
                Create your first habit
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredHabits.map((habit, idx) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                index={idx}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
