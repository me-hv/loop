'use client'

import React from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase/client'
import { useAuthStore } from '@/store/use-auth-store'
import { authService } from '@/features/auth/services/auth-service'

export function AuthListener() {
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)

  React.useEffect(() => {
    // If Firebase Auth is not initialized (e.g. offline/mock environment), stop loading
    if (!firebaseAuth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      setLoading(true)
      try {
        if (firebaseUser) {
          // Fetch synced profile details from Cloud Firestore
          let profile = await authService.fetchUserProfile(firebaseUser.uid)

          // Fallback if firestore document hasn't been created yet or isn't synchronized
          if (!profile) {
            const nameParts = firebaseUser.displayName?.split(' ') ?? []
            const firstName = nameParts[0] || 'User'
            const lastName = nameParts.slice(1).join(' ') || ''
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
            const language = typeof navigator !== 'undefined' ? navigator.language : 'en'

            profile = {
              uid: firebaseUser.uid,
              firstName,
              lastName,
              displayName: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || null,
              provider: firebaseUser.providerData[0]?.providerId || 'password',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              emailVerified: firebaseUser.emailVerified,
              timezone: timeZone,
              theme: 'system',
              language,
              onboardingCompleted: false,
            }
          }

          // If email is verified in Auth, but marked false in profile, sync update
          if (firebaseUser.emailVerified && !profile.emailVerified) {
            profile.emailVerified = true
            await authService.updateUserVerification(firebaseUser.uid)
          }

          setUser(profile)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error synchronizing authenticated user profile:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [setUser, setLoading])

  return null
}
