'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUIStore } from '@/store/use-ui-store'
import { useAuthStore } from '@/store/use-auth-store'
import { Logo } from '@/components/common/logo'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  CheckSquare,
  CalendarDays,
  BookOpen,
  Trophy,
  Bell,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge'
import { useSettings, useTheme } from '@/features/settings/hooks/use-settings'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const sidebarExpanded = useUIStore((state) => state.sidebarExpanded)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const mobileMenuOpen = useUIStore((state) => state.mobileMenuOpen)
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu)
  const { user, logout } = useAuthStore()
  const { settings } = useSettings(user?.uid)
  useTheme(user?.uid)

  const isLoading = useAuthStore((state) => state.isLoading)

  // Enforce route guarding
  React.useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
    } else if (!user.emailVerified) {
      router.push('/verify-email')
    }
  }, [user, isLoading, router])

  // Register background push Messaging Service Worker
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((reg) => {
          console.log('FCM Service Worker registered:', reg)
        })
        .catch((err) => {
          console.warn('FCM Service Worker registration failed:', err)
        })
    }
  }, [])

  if (isLoading || !user || !user.emailVerified) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-screen bg-background">
        <Logo className="h-12 w-auto animate-pulse" />
        <span className="text-xs text-muted-foreground mt-3 animate-pulse">Loading Loop...</span>
      </div>
    )
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Today', href: '/dashboard/today', icon: CheckSquare },
    { name: 'Journal', href: '/dashboard/journal', icon: BookOpen },
    { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
    { name: 'Habits', href: '/dashboard/habits', icon: Calendar },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
    { name: 'AI Coach', href: '/dashboard/ai', icon: Sparkles },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Profile', href: '/dashboard/profile/progress', icon: User },
    { name: 'Settings', href: '/settings/profile', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const list = [{ name: 'Loop', href: '/dashboard', isLast: segments.length === 0 }]

    segments.forEach((seg, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/')
      const isLast = idx === segments.length - 1
      let name = seg.charAt(0).toUpperCase() + seg.slice(1)

      if (seg === 'dashboard') name = 'Dashboard'
      else if (seg === 'habits') name = 'Habits'
      else if (seg === 'today') name = 'Today'
      else if (seg === 'calendar') name = 'Calendar'
      else if (seg === 'analytics') name = 'Analytics'
      else if (seg === 'journal') name = 'Journal'
      else if (seg === 'achievements') name = 'Achievements'
      else if (seg === 'notifications') name = 'Notifications'
      else if (seg === 'settings') name = 'Settings'
      else if (seg === 'ai') name = 'AI Coach'
      else if (seg === 'profile') name = 'Profile'
      else if (seg === 'progress') name = 'Progress'
      else if (seg === 'new') name = 'New'
      else if (seg === 'edit') name = 'Edit'
      else if (seg.length > 15) name = 'Details'

      list.push({ name, href, isLast })
    })

    return list
  }

  return (
    <div className={cn(
      "flex-grow flex h-screen overflow-hidden bg-background print:h-auto print:overflow-visible",
      settings?.accentColor ? `accent-${settings.accentColor}` : 'accent-indigo',
      settings?.compactMode && 'theme-compact',
      settings?.fontSize === 'sm' && 'text-sm',
      settings?.fontSize === 'lg' && 'text-lg'
    )}>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out relative z-20 print:hidden',
          sidebarExpanded ? 'w-64' : 'w-20'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-7 w-auto text-indigo-500" />
            {sidebarExpanded && (
              <span className="font-sans font-bold text-lg tracking-tight text-foreground transition-opacity duration-300">
                Loop
              </span>
            )}
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group',
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground')} />
                {sidebarExpanded && <span className="truncate">{item.name}</span>}
                {item.name === 'Notifications' && <NotificationBadge />}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer with Toggle */}
        <div className="p-3 border-t border-border flex items-center justify-between">
          {sidebarExpanded && (
            <div className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL ?? ''} />
                <AvatarFallback className="bg-accent/15 text-accent text-xs font-semibold">
                  {user.displayName?.substring(0, 2).toUpperCase() ?? 'US'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {user.displayName ?? 'User'}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn('h-9 w-9 rounded-full cursor-pointer hover:bg-muted', !sidebarExpanded && 'mx-auto')}
            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:h-auto print:overflow-visible">
        {/* Top Navbar */}
        <header className="h-16 md:h-20 border-b border-border bg-card/60 backdrop-blur-md px-4 sm:px-6 md:px-8 flex items-center justify-between relative z-10 print:hidden transition-all duration-300">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden h-10 w-10 rounded-md cursor-pointer hover:bg-muted flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* Dynamic Breadcrumbs */}
            <div className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2 select-none">
              {getBreadcrumbs().map((b, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-muted-foreground/30">/</span>}
                  {b.isLast ? (
                    <span className="text-foreground font-semibold tracking-tight">{b.name}</span>
                  ) : (
                    <Link href={b.href} className="hover:text-foreground transition-colors">
                      {b.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3.5 md:gap-5">
            {/* Quick Search UI Trigger (Placeholder) */}
            <div className="hidden md:flex items-center gap-2.5 h-10 w-52 md:w-60 px-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 hover:border-border/80 transition-all duration-200 text-sm text-muted-foreground/80 cursor-pointer select-none">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              <span className="text-xs font-medium">Search...</span>
              <kbd className="ml-auto font-sans text-[10px] font-medium bg-card px-2 py-0.5 rounded border border-border shadow-xs text-muted-foreground/75">
                ⌘K
              </kbd>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 md:h-11 md:w-11 rounded-full cursor-pointer flex items-center justify-center hover:bg-muted/80 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none">
                <Avatar className="h-10 w-10 md:h-11 md:w-11 border border-border/10">
                  <AvatarImage src={user.photoURL ?? ''} />
                  <AvatarFallback className="bg-accent/15 text-accent text-sm font-bold">
                    {user.displayName?.substring(0, 2).toUpperCase() ?? 'US'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user.displayName ?? 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-grow overflow-y-auto bg-background p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
          {children}
        </main>

        {/* Mobile Navigation Menu Dropdown overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-30 bg-background/95 backdrop-blur-sm flex flex-col pt-20 px-6 space-y-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="absolute top-4 left-4 h-9 w-9 rounded-md cursor-pointer"
              aria-label="Close mobile menu"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={toggleMobileMenu}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer',
                    isActive ? 'bg-accent text-white' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span>{item.name}</span>
                  {item.name === 'Notifications' && <NotificationBadge />}
                </Link>
              )
            })}
            <div className="border-t border-border pt-4 mt-6">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full justify-start gap-4 cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
