'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { firebaseAuth } from '@/lib/firebase/client'
import { authService } from '../services/auth-service'
import { useAuthStore } from '@/store/use-auth-store'
import { useUIStore } from '@/store/use-ui-store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Mail, CheckCircle2, RefreshCw, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

export function VerifyEmailView() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const logoutState = useAuthStore((state) => state.logout)
  const addToast = useUIStore((state) => state.addToast)

  const [isResending, setIsResending] = React.useState(false)
  const [resendCooldown, setResendCooldown] = React.useState(0)
  const [isVerified, setIsVerified] = React.useState(false)

  // Start countdown cooldown timer for resending verification email
  React.useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Poll Firebase user verification state
  React.useEffect(() => {
    if (!firebaseAuth) return

    const interval = setInterval(async () => {
      const user = firebaseAuth!.currentUser
      if (!user) {
        clearInterval(interval)
        return
      }

      try {
        await user.reload()
        if (user.emailVerified) {
          setIsVerified(true)
          clearInterval(interval)

          // Synchronize Firestore verified field
          await authService.updateUserVerification(user.uid)
          const profile = await authService.fetchUserProfile(user.uid)
          
          if (profile) {
            setUser(profile)
          }

          addToast({
            message: 'Email verified successfully! Welcome to Loop.',
            type: 'success',
          })
          
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('Error polling email verification status:', err)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [setUser, addToast, router])

  const handleResend = async () => {
    setIsResending(true)
    try {
      await authService.resendVerification()
      setResendCooldown(60) // Cooldown 1 minute
      addToast({
        message: 'Verification link resent. Please check your inbox.',
        type: 'success',
      })
    } catch {
      addToast({
        message: 'Failed to resend link. Please try again later.',
        type: 'error',
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      logoutState()
      addToast({
        message: 'Signed out successfully.',
        type: 'info',
      })
      router.push('/login')
    } catch {
      addToast({
        message: 'Failed to sign out.',
        type: 'error',
      })
    }
  }

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden relative text-center">
      <CardHeader className="space-y-1.5 pb-6">
        <CardTitle className="text-display text-center text-3xl font-extrabold tracking-tight">
          Verify Email
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Confirm your identity to start using Loop
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 py-2">
        <div className="mx-auto p-4 w-fit rounded-full bg-accent/10 text-accent mb-1 relative">
          <Mail className="h-10 w-10" />
          {isVerified && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute bottom-0 right-0 p-0.5 rounded-full bg-success text-white border-2 border-card"
            >
              <CheckCircle2 className="h-4 w-4" />
            </motion.span>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-lg">Verification email sent</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            We have sent a verification link to your email address. Please click the link to verify your account.
          </p>
        </div>

        <div className="p-3 bg-muted/40 dark:bg-muted/10 rounded-lg flex items-center justify-center gap-2 max-w-xs mx-auto">
          {isVerified ? (
            <span className="text-xs font-semibold text-success flex items-center gap-1.5 animate-pulse">
              Verified! Redirecting...
            </span>
          ) : (
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent" />
              Waiting for verification...
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4 pb-6">
        <Button
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0 || isVerified}
          className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-9 font-medium"
        >
          {isResending ? (
            <>
              <Spinner size="sm" className="mr-2 border-t-white" />
              Sending Link...
            </>
          ) : resendCooldown > 0 ? (
            `Resend in ${resendCooldown}s`
          ) : (
            'Resend Verification Email'
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full cursor-pointer gap-2 h-9 font-medium border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          disabled={isVerified}
        >
          <LogOut className="h-4 w-4" />
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  )
}
