'use client'

import React from 'react'
import { useNotifications } from '../hooks/use-notifications'
import { useAuthStore } from '@/store/use-auth-store'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationBadge() {
  const user = useAuthStore((s) => s.user)
  const { unreadCount } = useNotifications(user?.uid)

  if (unreadCount === 0) return null

  return (
    <AnimatePresence>
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-black text-white shadow-sm ring-2 ring-background select-none"
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </motion.span>
    </AnimatePresence>
  )
}
