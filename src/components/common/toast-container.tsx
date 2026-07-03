'use client'

import { useUIStore, Toast } from '@/store/use-ui-store'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react'

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts)
  const removeToast = useUIStore((state) => state.removeToast)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-accent" />
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className="flex items-center gap-3 w-full p-4 bg-card border border-border rounded-lg shadow-lg pointer-events-auto"
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className="text-sm font-medium text-foreground flex-grow">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}
