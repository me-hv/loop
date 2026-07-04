'use client'

import React, { useState, useRef } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useSettings } from '@/features/settings/hooks/use-settings'
import { settingsService } from '@/features/settings/services/settings-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Image as ImageIcon, Trash2, Camera, Save } from 'lucide-react'
import { useUIStore } from '@/store/use-ui-store'

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Chinese', value: 'zh' },
]

const COUNTRIES = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Canada', value: 'CA' },
  { label: 'Germany', value: 'DE' },
  { label: 'India', value: 'IN' },
  { label: 'Australia', value: 'AU' },
]

const DATE_FORMATS = [
  { label: 'YYYY-MM-DD (2026-07-04)', value: 'yyyy-MM-dd' },
  { label: 'MM/DD/YYYY (07/04/2026)', value: 'MM/dd/yyyy' },
  { label: 'DD/MM/YYYY (04/07/2026)', value: 'dd/MM/yyyy' },
]

export default function ProfileSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const addToast = useUIStore((s) => s.addToast)
  const { settings, updateSettings, isUpdating } = useSettings(user?.uid)

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [country, setCountry] = useState('US')
  const [language, setLanguage] = useState('en')
  const [dateFormat, setDateFormat] = useState('yyyy-MM-dd')
  const [timeFormat, setTimeFormat] = useState('12h')

  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync state once settings load
  React.useEffect(() => {
    if (settings) {
      const timer = setTimeout(() => {
        setDisplayName(settings.displayName || '')
        setUsername(settings.username || '')
        setBio(settings.bio || '')
        setTimezone(settings.timezone || 'UTC')
        setCountry(settings.country || 'US')
        setLanguage(settings.language || 'en')
        setDateFormat(settings.dateFormat || 'yyyy-MM-dd')
        setTimeFormat(settings.timeFormat || '12h')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [settings])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      displayName,
      username,
      bio,
      timezone,
      country,
      language,
      dateFormat,
      timeFormat,
    }, {
      onSuccess: () => {
        addToast({ message: 'Profile updated successfully!', type: 'success' })
      },
      onError: () => {
        addToast({ message: 'Failed to update profile.', type: 'error' })
      }
    })
  }

  // Handle avatar upload click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Process file upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setIsUploading(true)
      await settingsService.uploadAvatar(user.uid, file)
      setIsUploading(false)
      addToast({ message: 'Profile picture updated successfully!', type: 'success' })
    } catch (err) {
      console.error(err)
      setIsUploading(false)
      addToast({ message: 'Failed to upload profile picture.', type: 'error' })
    }
  }

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (!user) return
    try {
      setIsUploading(true)
      await settingsService.updateSettings(user.uid, { photoURL: '' })
      setIsUploading(false)
      addToast({ message: 'Profile picture removed successfully.', type: 'success' })
    } catch (err) {
      console.error(err)
      setIsUploading(false)
      addToast({ message: 'Failed to remove profile picture.', type: 'error' })
    }
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h2 className="text-lg font-black text-foreground">Profile Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure how you appear to others and format date/time preferences.
        </p>
      </div>

      {settings && (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Avatar upload card */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group select-none">
                <Avatar className="h-20 w-20 border-2 border-border/50">
                  <AvatarImage src={settings.photoURL || ''} />
                  <AvatarFallback className="bg-accent/15 text-accent text-lg font-bold">
                    {(displayName || user?.displayName || 'US').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Upload Hover Overlay */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black tracking-wider transition-opacity cursor-pointer border border-white/10"
                >
                  <Camera className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-grow">
                <h3 className="text-xs font-bold text-foreground">Profile Picture</h3>
                <p className="text-[10px] text-muted-foreground max-w-sm leading-normal">
                  Upload an image (PNG, JPG, max 2MB). If storage is not configured, it fallback to base64 encoding.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className="h-8 text-[10px] font-black cursor-pointer"
                  >
                    <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Upload Image
                  </Button>
                  {settings.photoURL && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleRemoveAvatar}
                      disabled={isUploading}
                      className="h-8 text-[10px] font-black cursor-pointer"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form fields */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-xs h-9"
                    placeholder="e.g. Harry"
                    required
                  />
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-xs h-9"
                    placeholder="e.g. harry_loop"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5 pt-2 border-t border-border/10">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Biography (Bio)
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="text-xs min-h-[80px]"
                  placeholder="Share a short bio..."
                  maxLength={150}
                />
                <span className="text-[9px] text-muted-foreground/80 font-bold block text-right">
                  {bio.length}/150 characters
                </span>
              </div>

              {/* Preferences selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/10">
                {/* Timezone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-9 px-3 py-1 rounded-lg border border-border/40 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-accent outline-none"
                    placeholder="America/New_York"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-9 px-3 py-1 rounded-lg border border-border/40 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-accent outline-none"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Formats settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/10">
                {/* Language */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-9 px-3 py-1 rounded-lg border border-border/40 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-accent outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Format */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Date Format
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full h-9 px-3 py-1 rounded-lg border border-border/40 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-accent outline-none"
                  >
                    {DATE_FORMATS.map((df) => (
                      <option key={df.value} value={df.value}>
                        {df.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Format */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Time Format
                  </label>
                  <select
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value)}
                    className="w-full h-9 px-3 py-1 rounded-lg border border-border/40 bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-accent outline-none"
                  >
                    <option value="12h">12-hour Clock (08:30 PM)</option>
                    <option value="24h">24-hour Clock (20:30)</option>
                  </select>
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
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
