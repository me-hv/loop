'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../schemas'
import { LoginValues } from '../types'
import { authService, mapAuthError } from '../services/auth-service'
import { useAuthStore } from '@/store/use-auth-store'
import { useUIStore } from '@/store/use-ui-store'
import { Button } from '@/components/ui/button'
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
import { Mail, Lock, AlertCircle } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const addToast = useUIStore((state) => state.addToast)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginValues) => {
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      const user = await authService.login(data)
      
      // If email is not verified, redirect to verification screen
      if (!user.emailVerified) {
        addToast({
          message: 'Please verify your email address to continue.',
          type: 'info',
        })
        router.push('/verify-email')
        return
      }

      const profile = await authService.fetchUserProfile(user.uid)
      if (profile) {
        setUser(profile)
      }
      
      addToast({
        message: 'Successfully logged in. Welcome back!',
        type: 'success',
      })
      router.push('/dashboard')
    } catch (err) {
      const error = err as { code?: string }
      setErrorMsg(mapAuthError(error.code ?? ''))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true)
    setErrorMsg(null)
    try {
      const user = await authService.loginWithGoogle()
      const profile = await authService.fetchUserProfile(user.uid)
      if (profile) {
        setUser(profile)
      }
      
      addToast({
        message: 'Successfully signed in with Google.',
        type: 'success',
      })
      router.push('/dashboard')
    } catch (err) {
      const error = err as { code?: string }
      setErrorMsg(mapAuthError(error.code ?? ''))
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden relative">
      <CardHeader className="space-y-1.5 pb-6">
        <CardTitle className="text-display text-center text-3xl font-extrabold tracking-tight">
          Sign In
        </CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Enter your email and password to stay in the loop
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-xs font-semibold leading-relaxed"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

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
                disabled={isSubmitting || isGoogleSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-semibold text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-caption block">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground/60">
                <Lock className="h-4 w-4" />
              </span>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={`pl-9 ${errors.password ? 'border-destructive focus-visible:ring-destructive/35' : ''}`}
                autoComplete="current-password"
                disabled={isSubmitting || isGoogleSubmitting}
              />
            </div>
            {errors.password && (
              <p className="text-xs font-semibold text-destructive mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
              disabled={isSubmitting || isGoogleSubmitting}
            />
            <label
              htmlFor="rememberMe"
              className="text-xs font-semibold text-muted-foreground cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-9 font-medium"
            disabled={isSubmitting || isGoogleSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2 border-t-white" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Extensible SSO divider */}
          <div className="relative w-full flex items-center justify-center my-1 select-none">
            <span className="absolute inset-x-0 border-t border-border" />
            <span className="relative z-10 px-3 bg-card text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full cursor-pointer gap-2 h-9 font-medium border-border hover:bg-muted/80"
            disabled={isSubmitting || isGoogleSubmitting}
          >
            {isGoogleSubmitting ? (
              <Spinner size="sm" />
            ) : (
              <>
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </>
            )}
          </Button>

          <div className="text-xs text-center text-muted-foreground mt-2">
            New to Loop?{' '}
            <Link href="/signup" className="font-semibold text-accent hover:underline">
              Create account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
