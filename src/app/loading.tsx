'use client'

import { Logo } from '@/components/common/logo'
import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <Logo className="h-12 w-auto" />
        <span className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading Loop...
        </span>
      </motion.div>
    </div>
  )
}
