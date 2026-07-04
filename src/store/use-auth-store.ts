import { create } from 'zustand'

export interface UserProfile {
  uid: string
  userId?: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  photoURL: string | null
  provider: string
  createdAt: string
  updatedAt: string
  emailVerified: boolean
  timezone: string
  theme: 'light' | 'dark' | 'system'
  language: string
  onboardingCompleted: boolean
}

type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  authStatus: AuthStatus
  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  authStatus: 'loading',
  setUser: (user) =>
    set({
      user,
      isLoading: false,
      authStatus: user ? 'authenticated' : 'unauthenticated',
    }),
  setLoading: (loading) =>
    set((state) => ({
      isLoading: loading,
      authStatus: loading ? 'loading' : state.user ? 'authenticated' : 'unauthenticated',
    })),
  logout: () =>
    set({
      user: null,
      isLoading: false,
      authStatus: 'unauthenticated',
    }),
}))
