'use client'

import React from 'react'
import { Logo } from '@/components/common/logo'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/use-auth-store'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading } = useAuthStore()

  React.useEffect(() => {
    if (isLoading) return

    if (user) {
      if (user.emailVerified) {
        router.push('/dashboard')
      } else if (pathname !== '/verify-email') {
        router.push('/verify-email')
      }
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-screen bg-background">
        <Logo className="h-10 w-auto" />
        <span className="text-xs text-muted-foreground mt-3 animate-pulse">Loading Loop...</span>
      </div>
    )
  }

  // Prevent flashing form if redirect is imminent
  if (user && (user.emailVerified || pathname !== '/verify-email')) {
    return null
  }

  return (
    <div className="flex-grow flex min-h-screen">
      {/* Left side - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 text-white p-12 flex-col justify-between relative overflow-hidden border-r border-zinc-800">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Floating gradient orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="relative z-10">
          <Link href="/">
            <Logo className="h-9 w-auto text-indigo-400" withText />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold tracking-tight text-white leading-tight"
          >
            Build consistency. Stay in the loop.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-zinc-400 mt-4 leading-relaxed font-sans text-sm"
          >
            Track routines, visualize progress, and celebrate streaks on a platform built for focus and aesthetic precision.
          </motion.p>
        </div>

        <div className="relative z-10 text-xs text-zinc-500 font-medium">
          © {new Date().getFullYear()} Loop Inc. All rights reserved.
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-background relative">
        <div className="lg:hidden absolute top-8 left-8">
          <Link href="/">
            <Logo className="h-8 w-auto text-indigo-500" withText />
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
