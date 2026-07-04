'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  User,
  ShieldCheck,
  Settings,
  Palette,
  Sliders,
  Database,
  Bell,
  ChevronRight,
} from 'lucide-react'

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'Account', href: '/settings/account', icon: Settings },
    { name: 'Appearance', href: '/settings/appearance', icon: Palette },
    { name: 'Preferences', href: '/settings/preferences', icon: Sliders },
    { name: 'Notifications', href: '/settings/notifications', icon: Bell },
    { name: 'Privacy', href: '/settings/privacy', icon: ShieldCheck },
    { name: 'Data Management', href: '/settings/data', icon: Database },
  ]

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 select-none">
      {/* Settings Navigation Sidebar */}
      <aside className="w-full md:w-60 shrink-0 space-y-1 md:border-r md:border-border/30 md:pr-6 md:min-h-[70vh]">
        <div className="px-3 pb-3 hidden md:block">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Personal Settings
          </h2>
        </div>
        
        {/* Navigation list */}
        <nav className="flex flex-row md:flex-col overflow-x-auto no-scrollbar md:overflow-visible gap-1.5 p-1 md:p-0 bg-muted/30 md:bg-transparent rounded-xl border border-border/20 md:border-0">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap md:w-full group',
                  isActive
                    ? 'bg-accent/15 text-accent border border-accent/20'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground')} />
                <span>{tab.name}</span>
                <ChevronRight className="ml-auto h-3.5 w-3.5 hidden md:block text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Settings Sub-page Content */}
      <main className="flex-1 min-w-0 bg-card/10 rounded-2xl border border-border/10 p-5 sm:p-6 md:p-8 backdrop-blur-md">
        {children}
      </main>
    </div>
  )
}
