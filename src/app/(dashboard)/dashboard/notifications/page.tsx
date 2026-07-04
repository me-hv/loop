'use client'

import React from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useNotifications, useNotificationPermission } from '@/features/notifications/hooks/use-notifications'
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotificationsCenterPage() {
  const user = useAuthStore((s) => s.user)

  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarking,
    isDeleting,
  } = useNotifications(user?.uid)

  const {
    permission,
    requestPermission,
    isLoading: permissionLoading,
  } = useNotificationPermission(user?.uid)

  if (isLoading) {
    return <NotificationsSkeleton />
  }

  const showPermissionBanner = permission === 'default' || permission === 'denied'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Notification Center
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your daily routine alerts, streak milestones, and achievements log history.
          </p>
        </div>
      </div>

      {/* 2. Permission Banner Gating */}
      {showPermissionBanner && (
        <Card
          className={cn(
            'border-border/40 select-none overflow-hidden transition-all duration-300 relative',
            permission === 'denied'
              ? 'border-destructive/20 bg-destructive/5'
              : 'border-accent/20 bg-accent/5'
          )}
        >
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-border/10',
                  permission === 'denied' ? 'bg-destructive/10' : 'bg-accent/15'
                )}
              >
                {permission === 'denied' ? (
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                ) : (
                  <Bell className="h-5 w-5 text-accent animate-bounce" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground leading-tight">
                  {permission === 'denied'
                    ? 'Browser Notifications Suppressed'
                    : 'Enable Real-time Desktop Reminders'}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-xl leading-normal">
                  {permission === 'denied'
                    ? "You've blocked notification permissions. To receive timely daily habit checks, update your browser site settings."
                    : 'Get browser push reminders so you never forget to complete your scheduled daily routines and streaks.'}
                </p>
              </div>
            </div>

            {permission !== 'denied' && (
              <Button
                type="button"
                onClick={requestPermission}
                disabled={permissionLoading}
                className="font-bold text-xs shrink-0 cursor-pointer h-8 select-none"
              >
                Allow Notifications
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3. Notification Center List */}
      <NotificationCenter
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        isPending={isMarking || isDeleting}
      />
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse select-none">
      <div className="space-y-1">
        <div className="h-7 bg-muted/40 rounded w-1/4" />
        <div className="h-4 bg-muted/30 rounded w-1/3" />
      </div>
      <div className="h-14 bg-muted/10 border border-border/30 rounded-xl" />
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center h-8 bg-muted/20 rounded w-full" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-20 border-border/30 bg-muted/10" />
        ))}
      </div>
    </div>
  )
}
