'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { settingsService } from '@/features/settings/services/settings-service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase/client'
import { useRouter } from 'next/navigation'

type DestructiveAction = 'delete_journals' | 'delete_habits' | 'delete_account' | null

export default function DataSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()

  const [activeModal, setActiveModal] = useState<DestructiveAction>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // 1. Export Data Trigger
  const handleExportData = async () => {
    if (!user) return
    try {
      setIsProcessing(true)
      await settingsService.exportUserData(user.uid)
      setIsProcessing(false)
    } catch (err) {
      console.error(err)
      setIsProcessing(false)
    }
  }

  // 2. Destructive Actions Runner
  const handleExecuteAction = async () => {
    if (!user || !activeModal) return
    setErrorMsg('')
    setSuccessMsg('')

    // Validate confirmation string input
    if (confirmInput.toLowerCase() !== 'confirm') {
      setErrorMsg('Please type "CONFIRM" to proceed.')
      return
    }

    try {
      setIsProcessing(true)
      const db = firebaseDb!

      if (activeModal === 'delete_journals') {
        const q = query(collection(db, 'journal'), where('userId', '==', user.uid))
        const snap = await getDocs(q)
        if (!snap.empty) {
          const batch = writeBatch(db)
          snap.docs.forEach((doc) => batch.delete(doc.ref))
          await batch.commit()
        }
        setSuccessMsg('All journal entries have been deleted.')
      } else if (activeModal === 'delete_habits') {
        const qHab = query(collection(db, 'habits'), where('userId', '==', user.uid))
        const snapHab = await getDocs(qHab)
        if (!snapHab.empty) {
          const batch = writeBatch(db)
          snapHab.docs.forEach((doc) => batch.delete(doc.ref))
          await batch.commit()
        }
        
        // Also delete completions
        const qComp = query(collection(db, 'habitCompletions'), where('userId', '==', user.uid))
        const snapComp = await getDocs(qComp)
        if (!snapComp.empty) {
          const batch = writeBatch(db)
          snapComp.docs.forEach((doc) => batch.delete(doc.ref))
          await batch.commit()
        }
        setSuccessMsg('All habits and completions have been deleted.')
      } else if (activeModal === 'delete_account') {
        // Delete all firestore items & auth account
        await settingsService.deleteAccount(user.uid)
        
        // Redirect to register
        router.push('/signup')
        return
      }

      setIsProcessing(false)
      setActiveModal(null)
      setConfirmInput('')
    } catch (err) {
      console.error(err)
      const errCode = (err as { code?: string })?.code
      const errMessage = err instanceof Error ? err.message : 'Failed to complete destructive action.'
      if (errCode === 'auth/requires-recent-login') {
        setErrorMsg('Security Action Failed. Please log out and back in to delete your account.')
      } else {
        setErrorMsg(errMessage)
      }
      setIsProcessing(false)
    }
  }

  const openConfirmationModal = (action: DestructiveAction) => {
    setErrorMsg('')
    setSuccessMsg('')
    setConfirmInput('')
    setActiveModal(action)
  }

  return (
    <div className="space-y-6 select-none relative">
      <div>
        <h2 className="text-lg font-black text-foreground">Data Management</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Export your routine records or reset logs inside the security Danger Zone.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl border border-success/20 bg-success/5 text-xs font-bold text-success flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5" />
          {successMsg}
        </div>
      )}

      {/* Export / Import Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-widest text-muted-foreground">
              <Download className="h-4 w-4 text-accent" /> Export Workspace Data
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Download all your habits, journal logs, and preferences in JSON format.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              type="button"
              onClick={handleExportData}
              disabled={isProcessing}
              className="w-full text-xs font-bold h-9 cursor-pointer"
            >
              Export JSON File
            </Button>
          </CardContent>
        </Card>

        {/* Import Card placeholder */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-widest text-muted-foreground">
              <Upload className="h-4 w-4 text-muted-foreground" /> Import Habits (Placeholder)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Import pre-made routine templates to start tracking immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs font-bold h-9 cursor-not-allowed opacity-50"
              disabled
            >
              Import Templates
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-destructive flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-xs text-destructive/80">
            Irreversible destructive modifications. Please handle with care.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Delete Journals */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-destructive/10 pb-3">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground">Delete All Journals</label>
              <p className="text-[10px] text-muted-foreground">Wipe out all daily reflections and mood records</p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => openConfirmationModal('delete_journals')}
              disabled={isProcessing}
              className="text-[10px] font-black h-8 cursor-pointer shrink-0"
            >
              Reset Journals
            </Button>
          </div>

          {/* Delete Habits */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-destructive/10 pb-3">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground">Delete All Habits & Streaks</label>
              <p className="text-[10px] text-muted-foreground">Wipe out habits list and active completion calendars</p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => openConfirmationModal('delete_habits')}
              disabled={isProcessing}
              className="text-[10px] font-black h-8 cursor-pointer shrink-0"
            >
              Reset Habits
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-destructive font-black">Delete Account Permanently</label>
              <p className="text-[10px] text-muted-foreground">Wipe out settings, data, and delete user login credentials</p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => openConfirmationModal('delete_account')}
              disabled={isProcessing}
              className="text-[10px] font-black h-8 cursor-pointer shrink-0"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Double Confirmation Modal overlay */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border/50 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-destructive" /> Double Confirmation
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg border border-border/40 hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg border border-destructive/20 bg-destructive/5 text-[10px] font-bold text-destructive">
                  {errorMsg}
                </div>
              )}

              <p className="text-xs text-muted-foreground leading-normal">
                This modification is irreversible. To proceed, please type{' '}
                <span className="font-extrabold text-destructive">CONFIRM</span> below.
              </p>

              <Input
                type="text"
                placeholder="Type CONFIRM here..."
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="text-xs h-9 uppercase tracking-widest font-black text-center"
              />

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveModal(null)}
                  className="h-8 text-[10px] font-black cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleExecuteAction}
                  disabled={isProcessing}
                  className="h-8 text-[10px] font-black cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Execute Deletion
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
