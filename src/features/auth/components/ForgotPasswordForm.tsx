'use client'

import React from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema } from '../schemas'
import { ForgotPasswordValues } from '../types'
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
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

export function ForgotPasswordForm() {
  const addToast = useUIStore((state) => state.addToast)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSent, setIsSent] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await authService.sendForgotPasswordEmail(data.email)
      setIsSent(true)
      addToast({
        message: 'Password reset link sent to your email.',
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
          Forgot Password
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          {isSent
            ? 'Instructions sent to your email address'
            : 'Enter your email to receive a password reset action link'}
        </CardDescription>
      </CardHeader>
      
      <AnimatePresence mode="wait">
        {isSent ? (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <CardContent className="space-y-4 text-center py-6">
              <div className="mx-auto p-3 w-fit rounded-full bg-success/10 text-success mb-2 animate-bounce">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="font-bold text-lg">Check your inbox</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                We have emailed a secure password reset link to your email. Click the link inside the message to choose a new password.
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
                Back to Sign In
              </Link>
            </CardFooter>
          </motion.div>
        ) : (
          <motion.form
            key="form-card"
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

              <div className="space-y-1">
                <label className="text-caption block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground/60">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    className={`pl-9 ${errors.email ? 'border-destructive focus-visible:ring-destructive/35' : ''}`}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-semibold text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3 pb-6">
              <Button
                type="submit"
                className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-9 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2 border-t-white" />
                    Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
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
