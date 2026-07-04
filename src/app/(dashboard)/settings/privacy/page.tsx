'use client'

import React from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useSettings } from '@/features/settings/hooks/use-settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, BarChart, Bug, Sparkles, Share2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PrivacySettingsPage() {
  const user = useAuthStore((s) => s.user)
  const { settings, updateSettings, isUpdating } = useSettings(user?.uid)

  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(true)
  const [crashReportingEnabled, setCrashReportingEnabled] = React.useState(true)
  const [personalizedInsights, setPersonalizedInsights] = React.useState(true)
  const [dataSharingEnabled, setDataSharingEnabled] = React.useState(false)

  // Sync state on load
  React.useEffect(() => {
    if (settings) {
      const timer = setTimeout(() => {
        setAnalyticsEnabled(settings.analyticsEnabled ?? true)
        setCrashReportingEnabled(settings.crashReportingEnabled ?? true)
        setPersonalizedInsights(settings.personalizedInsights ?? true)
        setDataSharingEnabled(settings.dataSharingEnabled ?? false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      analyticsEnabled,
      crashReportingEnabled,
      personalizedInsights,
      dataSharingEnabled,
    })
  }

  // Toggle switch helper styling
  const renderToggle = (val: boolean, setVal: (v: boolean) => void) => (
    <button
      type="button"
      onClick={() => setVal(!val)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out outline-none',
        val ? 'bg-accent' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
          val ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )

  return (
    <div className="space-y-6 select-none">
      <div>
        <h2 className="text-lg font-black text-foreground">Privacy settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Control your telemetry data collection, crash logs reporting, and insights sharing options.
        </p>
      </div>

      {settings && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Privacy settings switches */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent" /> Telemetry & Security
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Decide what telemetry data we collect to improve product performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Analytics Collection */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <BarChart className="h-4 w-4 text-muted-foreground" /> Analytics Collection
                  </label>
                  <p className="text-[10px] text-muted-foreground">Collect usage metrics to improve Loop habit modules</p>
                </div>
                {renderToggle(analyticsEnabled, setAnalyticsEnabled)}
              </div>

              {/* Crash Reporting */}
              <div className="flex items-center justify-between pt-3 border-t border-border/10">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Bug className="h-4 w-4 text-muted-foreground" /> Crash Logs Reporting
                  </label>
                  <p className="text-[10px] text-muted-foreground">Send automated debug diagnostics reports on failures</p>
                </div>
                {renderToggle(crashReportingEnabled, setCrashReportingEnabled)}
              </div>

              {/* Personalized Insights */}
              <div className="flex items-center justify-between pt-3 border-t border-border/10">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-muted-foreground" /> Personalized AI Insights
                  </label>
                  <p className="text-[10px] text-muted-foreground">Receive custom recommendations based on habit completion logs</p>
                </div>
                {renderToggle(personalizedInsights, setPersonalizedInsights)}
              </div>

              {/* Data Sharing */}
              <div className="flex items-center justify-between pt-3 border-t border-border/10">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Share2 className="h-4 w-4 text-muted-foreground" /> Third-party Data Sharing
                  </label>
                  <p className="text-[10px] text-muted-foreground">Share anonymous insights with research partners</p>
                </div>
                {renderToggle(dataSharingEnabled, setDataSharingEnabled)}
              </div>
            </CardContent>
          </Card>

          {/* SaaS profile visibility placeholder */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Profile Visibility (SaaS Placeholder)</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Set who can view your level accomplishments and habit boards.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-semibold text-muted-foreground">Private Mode</label>
                <p className="text-[10px] text-muted-foreground/60">Only you can view your streaks and calendar charts</p>
              </div>
              {renderToggle(true, () => {})}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isUpdating}
              className="font-bold text-xs h-9 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" /> Save Privacy
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
