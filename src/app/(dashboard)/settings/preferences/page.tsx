'use client'

import React from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useSettings } from '@/features/settings/hooks/use-settings'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, LayoutGrid, Clock, Settings, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PreferencesSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const { settings, updateSettings, isUpdating } = useSettings(user?.uid)

  const [weekStart, setWeekStart] = React.useState<0 | 1>(1)
  const [defaultDashboard, setDefaultDashboard] = React.useState<'today' | 'habits' | 'analytics'>('today')
  const [defaultCalendarView, setDefaultCalendarView] = React.useState<'month' | 'week'>('month')
  const [measurementUnit, setMeasurementUnit] = React.useState<'metric' | 'imperial'>('metric')
  const [clockFormat, setClockFormat] = React.useState<'12h' | '24h'>('12h')

  // Sync state on load
  React.useEffect(() => {
    if (settings) {
      const timer = setTimeout(() => {
        setWeekStart(settings.weekStart ?? 1)
        setDefaultDashboard(settings.defaultDashboard ?? 'today')
        setDefaultCalendarView(settings.defaultCalendarView ?? 'month')
        setMeasurementUnit(settings.measurementUnit ?? 'metric')
        setClockFormat(settings.clockFormat ?? '12h')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      weekStart,
      defaultDashboard,
      defaultCalendarView,
      measurementUnit,
      clockFormat,
    })
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h2 className="text-lg font-black text-foreground">Preferences settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure calendar start formats, regional measurement units, and default workspace views.
        </p>
      </div>

      {settings && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
              {/* Week Start Day */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/10 pb-3">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" /> Week Start Day
                  </label>
                  <p className="text-[10px] text-muted-foreground">Define which day starts a new calendar week</p>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { value: 1, label: 'Monday' },
                    { value: 0, label: 'Sunday' },
                  ].map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setWeekStart(d.value as 0 | 1)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                        weekStart === d.value
                          ? 'bg-accent/15 border-accent/20 text-accent font-extrabold shadow-sm'
                          : 'bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default landing dashboard */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/10 pb-3">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" /> Default Dashboard View
                  </label>
                  <p className="text-[10px] text-muted-foreground">Select your default screen on application load</p>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { value: 'today', label: 'Today' },
                    { value: 'habits', label: 'Habits' },
                    { value: 'analytics', label: 'Analytics' },
                  ].map((dash) => (
                    <button
                      key={dash.value}
                      type="button"
                      onClick={() => setDefaultDashboard(dash.value as 'today' | 'habits' | 'analytics')}
                      className={cn(
                        'px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                        defaultDashboard === dash.value
                          ? 'bg-accent/15 border-accent/20 text-accent font-extrabold shadow-sm'
                          : 'bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {dash.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Calendar View */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/10 pb-3">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" /> Default Calendar View
                  </label>
                  <p className="text-[10px] text-muted-foreground">Configure view interval defaults</p>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { value: 'month', label: 'Month' },
                    { value: 'week', label: 'Week' },
                  ].map((cv) => (
                    <button
                      key={cv.value}
                      type="button"
                      onClick={() => setDefaultCalendarView(cv.value as 'month' | 'week')}
                      className={cn(
                        'px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                        defaultCalendarView === cv.value
                          ? 'bg-accent/15 border-accent/20 text-accent font-extrabold shadow-sm'
                          : 'bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {cv.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Measurement Units */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/10 pb-3">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Settings className="h-4 w-4 text-muted-foreground" /> Measurement Units
                  </label>
                  <p className="text-[10px] text-muted-foreground">Select regional units parameter</p>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { value: 'metric', label: 'Metric' },
                    { value: 'imperial', label: 'Imperial' },
                  ].map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => setMeasurementUnit(unit.value as 'metric' | 'imperial')}
                      className={cn(
                        'px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                        measurementUnit === unit.value
                          ? 'bg-accent/15 border-accent/20 text-accent font-extrabold shadow-sm'
                          : 'bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 12h / 24h Clock */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" /> Clock Format
                  </label>
                  <p className="text-[10px] text-muted-foreground">Configure time display hour divisions</p>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { value: '12h', label: '12-hour (AM/PM)' },
                    { value: '24h', label: '24-hour' },
                  ].map((clk) => (
                    <button
                      key={clk.value}
                      type="button"
                      onClick={() => setClockFormat(clk.value as '12h' | '24h')}
                      className={cn(
                        'px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                        clockFormat === clk.value
                          ? 'bg-accent/15 border-accent/20 text-accent font-extrabold shadow-sm'
                          : 'bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {clk.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isUpdating}
              className="font-bold text-xs h-9 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" /> Save Preferences
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
