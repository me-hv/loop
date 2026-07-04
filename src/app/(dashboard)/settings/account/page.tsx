'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  KeyRound,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Clock,
  LogOut,
  Calendar,
  Lock,
} from 'lucide-react'
import { firebaseAuth } from '@/lib/firebase/client'
import { updatePassword, sendPasswordResetEmail } from 'firebase/auth'

import { useUIStore } from '@/store/use-ui-store'

export default function AccountSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const addToast = useUIStore((s) => s.addToast)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const provider = user?.provider || 'password'
  const createdTime = user?.createdAt
    ? new Date(user.createdAt).toLocaleString()
    : 'Unknown'
  const lastLoginTime = user?.updatedAt
    ? new Date(user.updatedAt).toLocaleString()
    : 'Unknown'

  // Update Password Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    const currentUser = firebaseAuth?.currentUser
    if (!currentUser) return

    try {
      setIsUpdating(true)
      await updatePassword(currentUser, newPassword)
      setNewPassword('')
      setConfirmPassword('')
      setSuccessMsg('Password updated successfully!')
      addToast({ message: 'Password updated successfully!', type: 'success' })
      setIsUpdating(false)
    } catch (err) {
      console.error(err)
      const errCode = (err as { code?: string })?.code
      const errMessage = err instanceof Error ? err.message : 'Failed to update password.'
      if (errCode === 'auth/requires-recent-login') {
        setErrorMsg('Please log out and log back in to perform this security action.')
      } else {
        setErrorMsg(errMessage)
      }
      addToast({ message: 'Failed to update password.', type: 'error' })
      setIsUpdating(false)
    }
  }

  // Trigger password reset email
  const handleSendResetEmail = async () => {
    if (!user?.email) return
    setErrorMsg('')
    setSuccessMsg('')
    try {
      setIsUpdating(true)
      await sendPasswordResetEmail(firebaseAuth!, user.email)
      setSuccessMsg('Reset password instructions sent to your email!')
      addToast({ message: 'Reset link sent to your email.', type: 'success' })
      setIsUpdating(false)
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'Failed to send reset email.'
      setErrorMsg(errMessage)
      addToast({ message: 'Failed to send reset email.', type: 'error' })
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h2 className="text-lg font-black text-foreground">Account settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your email address, verification credentials, and password security.
        </p>
      </div>

      {user && (
        <div className="space-y-6">
          {/* Account details card */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Security Credentials</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Details about your registered account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Address */}
              <div className="flex items-center justify-between border-b border-border/10 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </span>
                  <span className="text-xs font-semibold text-foreground">{user.email}</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-border/40 bg-muted/40">
                  {user.emailVerified ? (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 text-success" />
                      <span className="text-[10px] font-bold text-success">Verified</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-[10px] font-bold text-destructive">Unverified</span>
                    </>
                  )}
                </div>
              </div>

              {/* Created Time & Last Login */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/10 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Account Created
                  </span>
                  <span className="text-xs font-semibold text-foreground">{createdTime}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Last SignIn
                  </span>
                  <span className="text-xs font-semibold text-foreground">{lastLoginTime}</span>
                </div>
              </div>

              {/* Login Method */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" /> Sign-In Provider
                </span>
                <span className="text-xs font-semibold text-foreground uppercase">
                  {provider === 'google.com' ? 'Google Authentication' : 'Email / Password'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Form (only for email/password provider) */}
          {provider === 'password' && (
            <Card className="border-border/40 bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground">Update Password</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Update your authentication password credentials securely.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-xs font-bold text-destructive">
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 rounded-lg border border-success/20 bg-success/5 text-xs font-bold text-success">
                      {successMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="text-xs h-9"
                        placeholder="At least 6 characters"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="text-xs h-9"
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendResetEmail}
                      disabled={isUpdating}
                      className="font-bold text-xs h-9 cursor-pointer"
                    >
                      Reset via Email link
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="font-bold text-xs h-9 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5" /> Change Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Sessions Card placeholder */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Sessions Management</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Logout of all other device sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                type="button"
                variant="outline"
                className="font-bold text-xs h-9 flex items-center gap-1.5 cursor-not-allowed opacity-50"
                disabled
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out all other sessions (SaaS Placeholder)
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
