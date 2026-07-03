'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema } from '../schemas'
import { ResetPasswordValues } from '../types'
import { authService, mapAuthError } from '../services/auth-service'
import { useUIStore } from '@/store/use-ui-store'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const addToast = useUIStore((state) => state.addToast)
  const oobCode = searchParams.get('oobCode')

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isReset, setIsReset] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const passwordVal = watch('password') || ''

  // Password strength calculation
  const calculatePasswordStrength = (pass: string): { score: number; label: string; colorClass: string } => {
    if (!pass) return { score: 0, label: 'Empty', colorClass: 'bg-muted' }
    let score = 0
    if (pass.length >= 8) score++
    if (/[a-z]/.test(pass)) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    switch (score) {
      case 1:
      case 2:
        return { score, label: 'Weak', colorClass: 'bg-destructive' }
      case 3:
        return { score, label: 'Fair', colorClass: 'bg-orange-500' }
      case 4:
        return { score, label: 'Strong', colorClass: 'bg-accent' }
      case 5:
        return { score, label: 'Excellent', colorClass: 'bg-success' }
      default:
        return { score: 0, label: 'Empty', colorClass: 'bg-muted' }
    }
  }

  const pwdStrength = calculatePasswordStrength(passwordVal)

  React.useEffect(() => {
    if (!oobCode) {
      setErrorMsg('This password reset link is invalid or missing. Please request a new link.')
    }
  }, [oobCode])

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!oobCode) {
      setErrorMsg('Invalid reset token. Please request a new link.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await authService.confirmPasswordReset(oobCode, data.password)
      setIsReset(true)
      addToast({
        message: 'Your password has been successfully reset.',
        type: 'success',
      })
    } catch (err) {
      const error = err as { code?: string }
      setErrorMsg(mapAuthError(error.code ?? ''))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden relative">
      <CardHeader className="space-y-1.5 pb-6">
        <CardTitle className="text-display text-center text-3xl font-extrabold tracking-tight">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          {isReset
            ? 'Your password has been changed successfully'
            : 'Enter a strong, secure new password below'}
        </CardDescription>
      </CardHeader>
      
      <AnimatePresence mode="wait">
        {isReset ? (
          <motion.div
            key="success-reset"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <CardContent className="space-y-4 text-center py-6">
              <div className="mx-auto p-3 w-fit rounded-full bg-success/10 text-success mb-2 animate-bounce">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="font-bold text-lg">Password Changed</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your account password was updated. You can now use your new password to sign into Loop.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link
                href="/login"
                className={buttonVariants({
                  variant: 'outline',
                  className: 'w-full gap-2 cursor-pointer h-9 font-medium',
                })}
              >
                <ArrowLeft className="h-4 w-4" />
                Sign In
              </Link>
            </CardFooter>
          </motion.div>
        ) : (
          <motion.form
            key="form-reset"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-xs font-semibold leading-relaxed">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {oobCode && (
                <>
                  <div className="space-y-1">
                    <label className="text-caption block mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground/60">
                        <Lock className="h-4 w-4" />
                      </span>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                        className={`pl-9 ${errors.password ? 'border-destructive focus-visible:ring-destructive/35' : ''}`}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {passwordVal && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                          <span>Strength: {pwdStrength.label}</span>
                          <span>{pwdStrength.score}/5</span>
                        </div>
                        <div className="flex gap-1 h-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`flex-1 rounded-full transition-colors duration-300 ${
                                level <= pwdStrength.score ? pwdStrength.colorClass : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p className="text-xs font-semibold text-destructive mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption block mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground/60">
                        <Lock className="h-4 w-4" />
                      </span>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...register('confirmPassword')}
                        className={`pl-9 ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive/35' : ''}`}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs font-semibold text-destructive mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3 pb-6">
              {oobCode && (
                <Button
                  type="submit"
                  className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-9 font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2 border-t-white" />
                      Saving Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              )}
              <Link
                href="/login"
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'w-full gap-2 cursor-pointer h-9 font-medium text-muted-foreground hover:text-foreground',
                })}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </CardFooter>
          </motion.form>
        )}
      </AnimatePresence>
    </Card>
  )
}
