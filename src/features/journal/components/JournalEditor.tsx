'use client'

import React from 'react'
import { Controller } from 'react-hook-form'
import { useJournal } from '../hooks/use-journal'
import { MoodSelector } from './MoodSelector'
import { EnergyStressSliders } from './EnergyStressSliders'
import { SleepRating } from './SleepRating'
import { GratitudeInputs, BulletListEditor, TomorrowFocus } from './ReflectionLists'
import { TagSelector } from './TagSelector'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, AlertCircle, Trash2, Save, Sparkles, BookOpen, Award } from 'lucide-react'

interface JournalEditorProps {
  userId: string | undefined
  date: string
}

export function JournalEditor({ userId, date }: JournalEditorProps) {
  const {
    register,
    control,
    watch,
    errors,
    saveStatus,
    isLoading,
    isDirty,
    handleManualSave,
    handleDelete,
    isDeleting,
    journalEntry,
  } = useJournal(userId, date)

  const notesVal = watch('notes') || ''
  const charCount = notesVal.length

  if (isLoading) {
    return (
      <Card className="border-border/40 bg-card/60 backdrop-blur-md animate-pulse select-none">
        <CardContent className="p-6 space-y-6">
          <div className="h-5 bg-muted/40 rounded w-1/4" />
          <div className="grid grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 bg-muted/30 rounded-xl" />
            ))}
          </div>
          <div className="h-20 bg-muted/30 rounded-xl" />
          <div className="h-40 bg-muted/30 rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-md relative overflow-hidden">
      {/* Decorative top border line matching mood quality */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <CardContent className="p-6 space-y-6">
        {/* Autosave Status indicators */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 select-none">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Daily Reflection</h3>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Autosave badge */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              {saveStatus === 'saving' && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin text-accent" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Error saving
                </span>
              )}
              {saveStatus === 'idle' && (
                <span className="text-muted-foreground/60">Auto-saved</span>
              )}
            </div>

            {/* Manual save icon button */}
            {isDirty && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleManualSave}
                className="h-7 w-7 text-accent hover:bg-accent/10 rounded-md cursor-pointer"
                title="Force Save Now"
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* 1. Mood selector */}
          <Controller
            name="mood"
            control={control}
            render={({ field }) => (
              <MoodSelector value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.mood && (
            <p className="text-[10px] text-destructive font-bold">{errors.mood.message}</p>
          )}

          {/* 2. Rating Sliders (Energy & Stress) */}
          <Controller
            name="energyLevel"
            control={control}
            render={({ field: energyField }) => (
              <Controller
                name="stressLevel"
                control={control}
                render={({ field: stressField }) => (
                  <EnergyStressSliders
                    energy={energyField.value}
                    stress={stressField.value}
                    onEnergyChange={energyField.onChange}
                    onStressChange={stressField.onChange}
                  />
                )}
              />
            )}
          />

          {/* 3. Sleep rating */}
          <Controller
            name="sleepQuality"
            control={control}
            render={({ field }) => (
              <SleepRating value={field.value} onChange={field.onChange} />
            )}
          />

          {/* 4. Gratitude input */}
          <Controller
            name="gratitude"
            control={control}
            render={({ field }) => (
              <GratitudeInputs items={field.value} onChange={field.onChange} />
            )}
          />

          {/* 5. Wins & Challenges Bullet List Editors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="wins"
              control={control}
              render={({ field }) => (
                <BulletListEditor
                  title="Wins Today"
                  items={field.value}
                  onChange={field.onChange}
                  placeholder="Completed project, cooked meals..."
                  icon={<Award className="h-4 w-4 text-green-500" />}
                  accentColor="hover:bg-green-500/10 hover:text-green-500"
                  ringColor="focus-visible:ring-green-500/30 focus-visible:border-green-500"
                />
              )}
            />

            <Controller
              name="challenges"
              control={control}
              render={({ field }) => (
                <BulletListEditor
                  title="Challenges Today"
                  items={field.value}
                  onChange={field.onChange}
                  placeholder="Procratinated, slept late..."
                  icon={<AlertCircle className="h-4 w-4 text-destructive" />}
                  accentColor="hover:bg-destructive/10 hover:text-destructive"
                  ringColor="focus-visible:ring-destructive/30 focus-visible:border-destructive"
                />
              )}
            />
          </div>

          {/* 6. Tomorrow's focus */}
          <Controller
            name="tomorrowFocus"
            control={control}
            render={({ field }) => (
              <TomorrowFocus value={field.value} onChange={field.onChange} />
            )}
          />

          {/* 7. Markdown Notes Textarea */}
          <div className="space-y-2 select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" />
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Notes & Reflections
                </label>
              </div>
              <span className="text-[9px] text-muted-foreground/60 font-bold">
                {charCount} characters
              </span>
            </div>
            <Textarea
              {...register('notes')}
              placeholder="What happened today? Write your feelings, thoughts, and reflections..."
              className="min-h-[160px] text-xs border-border/40 focus-visible:ring-accent/30 focus-visible:border-accent bg-card/40 leading-relaxed"
            />
          </div>

          {/* 8. Tag Selector */}
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagSelector value={field.value} onChange={field.onChange} />
            )}
          />

          {/* 9. Delete entry action strip */}
          {journalEntry && (
            <div className="pt-4 border-t border-border/40 flex justify-end select-none">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this reflection? This cannot be undone.')) {
                    handleDelete()
                  }
                }}
                disabled={isDeleting}
                className="h-8 text-xs font-semibold hover:bg-destructive/10 text-muted-foreground hover:text-destructive gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete Reflection
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
