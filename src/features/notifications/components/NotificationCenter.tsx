'use client'

import React, { useState } from 'react'
import { InAppNotification, NotificationType } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Trophy,
  Flame,
  BookOpen,
  Check,
  Trash2,
  ExternalLink,
  Info,
} from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface NotificationCenterProps {
  notifications: InAppNotification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  isPending?: boolean
}

// Icon mappings based on Category
const CATEGORY_MAP: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  reminder: { icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  achievement: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  challenge: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  journal: { icon: BookOpen, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  system: { icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  isPending,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotificationType | 'all'>('all')

  const categories: { label: string; value: NotificationType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Reminders', value: 'reminder' },
    { label: 'Achievements', value: 'achievement' },
    { label: 'Challenges', value: 'challenge' },
    { label: 'Journals', value: 'journal' },
    { label: 'System', value: 'system' },
  ]

  const filtered = notifications.filter((n) => filter === 'all' || n.type === filter)
  const unreadList = filtered.filter((n) => !n.read)

  // Format time ago cleanly
  const getTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
    } catch {
      return 'just now'
    }
  }

  return (
    <div className="space-y-5 select-none">
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted border border-border/40 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap outline-none',
                filter === cat.value
                  ? 'bg-card text-foreground shadow-sm border border-border/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick action buttons */}
        {unreadList.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={onMarkAllAsRead}
            disabled={isPending}
            className="h-8 text-[10px] font-black cursor-pointer self-end sm:self-auto shrink-0 flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {/* 2. Notifications List */}
      {filtered.length === 0 ? (
        <Card className="border border-dashed border-border/40 bg-muted/5 py-12 text-center select-none">
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <Bell className="h-8 w-8 text-muted-foreground/45" />
            <span className="text-xs font-bold text-foreground mt-2">All Caught Up!</span>
            <span className="text-[10px] text-muted-foreground/75 leading-normal max-w-xs">
              No notifications found in this category. You are perfectly in loop.
            </span>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const mapInfo = CATEGORY_MAP[item.type] || CATEGORY_MAP.system
            const Icon = mapInfo.icon
            return (
              <Card
                key={item.id}
                className={cn(
                  'border-border/40 bg-card/60 backdrop-blur-md transition-all duration-200 relative overflow-hidden',
                  !item.read && 'border-accent/20 bg-accent/5'
                )}
              >
                {/* Unread dot indicator */}
                {!item.read && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-accent" />
                )}

                <CardContent className="p-4 flex gap-4 items-start">
                  {/* Category icon */}
                  <div
                    className={cn(
                      'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-border/10',
                      mapInfo.bg
                    )}
                  >
                    <Icon className={cn('h-5 w-5', mapInfo.color)} />
                  </div>

                  {/* Body text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-foreground leading-tight flex items-center gap-2">
                          {item.title}
                          {!item.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                          )}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                      
                      {/* Timestamp */}
                      <span className="text-[9px] font-bold text-muted-foreground/70 shrink-0 whitespace-nowrap">
                        {getTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    {/* Notification Actions panel */}
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border/5">
                      {!item.read && (
                        <button
                          type="button"
                          onClick={() => onMarkAsRead(item.id)}
                          className="text-[9px] font-black text-accent hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          Mark read
                        </button>
                      )}
                      {item.actionUrl && (
                        <Link
                          href={item.actionUrl}
                          className="text-[9px] font-black text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View details
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="text-[9px] font-black text-muted-foreground hover:text-destructive flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
