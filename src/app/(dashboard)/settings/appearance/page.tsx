'use client'

import React from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useSettings } from '@/features/settings/hooks/use-settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ThemeMode, AccentColor, FontSize } from '@/features/settings/types'
import { cn } from '@/lib/utils'
import { Sun, Moon, Laptop, Check, Palette, Sparkles, LayoutGrid } from 'lucide-react'

const ACCENTS: { name: AccentColor; colorClass: string; hex: string }[] = [
  { name: 'indigo', colorClass: 'bg-[#6366F1]', hex: '#6366F1' },
  { name: 'emerald', colorClass: 'bg-[#10B981]', hex: '#10B981' },
  { name: 'rose', colorClass: 'bg-[#F43F5E]', hex: '#F43F5E' },
  { name: 'amber', colorClass: 'bg-[#F59E0B]', hex: '#F59E0B' },
  { name: 'violet', colorClass: 'bg-[#8B5CF6]', hex: '#8B5CF6' },
]

export default function AppearanceSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const { settings, updateSettings } = useSettings(user?.uid)

  const activeTheme = settings?.theme || 'system'
  const activeAccent = settings?.accentColor || 'indigo'
  const activeCompact = settings?.compactMode ?? false
  const activeAnimations = settings?.animationsEnabled ?? true
  const activeFontSize = settings?.fontSize || 'base'

  // Helper render toggle switch styling
  const renderToggle = (val: boolean, onToggle: (v: boolean) => void) => (
    <button
      type="button"
      onClick={() => onToggle(!val)}
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
        <h2 className="text-lg font-black text-foreground">Appearance settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Personalize the look, feel, and performance parameters of your dashboard.
        </p>
      </div>

      {settings && (
        <div className="space-y-6">
          {/* Theme Selector */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Theme Mode</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Choose a visual theme interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-3 gap-4">
              {[
                { name: 'light', label: 'Light', icon: Sun },
                { name: 'dark', label: 'Dark', icon: Moon },
                { name: 'system', label: 'System', icon: Laptop },
              ].map((t) => {
                const Icon = t.icon
                const active = activeTheme === t.name
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => updateSettings({ theme: t.name as ThemeMode })}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer',
                      active
                        ? 'bg-accent/10 border-accent text-accent font-black shadow-sm'
                        : 'border-border/40 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{t.label}</span>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* Accent Color Picker */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-accent" /> Accent Color
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Select your focus highlight color.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex gap-3">
              {ACCENTS.map((col) => {
                const active = activeAccent === col.name
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => updateSettings({ accentColor: col.name })}
                    className={cn(
                      'h-9 w-9 rounded-full flex items-center justify-center text-white transition-transform duration-200 hover:scale-110 shadow-sm border border-black/15 cursor-pointer relative',
                      col.colorClass
                    )}
                    aria-label={`Select ${col.name} accent`}
                  >
                    {active && <Check className="h-4.5 w-4.5" />}
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* Layout density (Compact Mode) & Font Size */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Density & Typography</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Fine-tune display padding heights and font text sizing.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Compact Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" /> Compact Mode
                  </label>
                  <p className="text-[10px] text-muted-foreground">Reduce paddings in habits grids and listings</p>
                </div>
                {renderToggle(activeCompact, (v) => updateSettings({ compactMode: v }))}
              </div>

              {/* Animations Switch */}
              <div className="flex items-center justify-between pt-3 border-t border-border/10">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-muted-foreground" /> Interface Animations
                  </label>
                  <p className="text-[10px] text-muted-foreground">Enable smooth hover motions and dashboard effects</p>
                </div>
                {renderToggle(activeAnimations, (v) => updateSettings({ animationsEnabled: v }))}
              </div>

              {/* Font Size Selectors */}
              <div className="space-y-2 pt-3 border-t border-border/10">
                <label className="text-xs font-semibold text-foreground">Font Size Scale</label>
                <div className="flex gap-2">
                  {[
                    { value: 'sm', label: 'Small' },
                    { value: 'base', label: 'Medium' },
                    { value: 'lg', label: 'Large' },
                  ].map((sz) => {
                    const active = activeFontSize === sz.value
                    return (
                      <button
                        key={sz.value}
                        type="button"
                        onClick={() => updateSettings({ fontSize: sz.value as FontSize })}
                        className={cn(
                          'px-4 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                          active
                            ? 'bg-accent/15 border-accent/20 text-accent font-extrabold shadow-sm'
                            : 'bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        {sz.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
