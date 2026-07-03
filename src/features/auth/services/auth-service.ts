import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { firebaseAuth, firebaseDb, googleAuthProvider } from '@/lib/firebase/client'
import { SignUpValues, LoginValues, UserProfile } from '../types'

// Helper to translate Firebase Auth errors into human-friendly strings
export function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This user account has been disabled.'
    case 'auth/user-not-found':
      return 'No account matches this email.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.'
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.'
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 8 characters.'
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed attempts. Please try again later.'
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completion. Please try again.'
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your connection.'
    case 'auth/expired-action-code':
      return 'The password reset link has expired. Please request a new one.'
    case 'auth/invalid-action-code':
      return 'The password reset link is invalid. Please request a new one.'
    default:
      return 'An unexpected authentication error occurred. Please try again.'
  }
}

// Generate a default user profile object
const buildDefaultProfile = (
  user: FirebaseUser,
  firstName: string,
  lastName: string,
  provider: string
): UserProfile => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const language = typeof navigator !== 'undefined' ? navigator.language : 'en'
  const displayName = `${firstName} ${lastName}`.trim()

  return {
    uid: user.uid,
    firstName,
    lastName,
    displayName,
    email: user.email ?? '',
    photoURL: user.photoURL ?? null,
    provider,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emailVerified: user.emailVerified,
    timezone: timeZone,
    theme: 'system',
    language,
    onboardingCompleted: false,
  }
}

export const authService = {
  // Check if Firebase is initialized in client
  isInitialized(): boolean {
    return !!firebaseAuth && !!firebaseDb
  },

  // 1. Sign Up
  async signUp({ email, password, firstName, lastName }: SignUpValues): Promise<FirebaseUser> {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check your environment settings.')
    }

    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth!, email, password)
    const user = userCredential.user

    // Send email verification
    await sendEmailVerification(user)

    // Save profile record in Firestore
    const profile = buildDefaultProfile(user, firstName, lastName, 'password')
    await setDoc(doc(firebaseDb!, 'users', user.uid), profile)

    return user
  },

  // 2. Login
  async login({ email, password, rememberMe }: LoginValues): Promise<FirebaseUser> {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check your environment settings.')
    }

    // Set token session persistence
    await setPersistence(
      firebaseAuth!,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    )

    const userCredential = await signInWithEmailAndPassword(firebaseAuth!, email, password)
    return userCredential.user
  },

  // 3. Google Sign In
  async loginWithGoogle(): Promise<FirebaseUser> {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check your environment settings.')
    }

    const userCredential = await signInWithPopup(firebaseAuth!, googleAuthProvider)
    const user = userCredential.user

    // Fetch existing document to check if we need to create it
    const docRef = doc(firebaseDb!, 'users', user.uid)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      const nameParts = user.displayName?.split(' ') ?? []
      const firstName = nameParts[0] || 'User'
      const lastName = nameParts.slice(1).join(' ') || ''
      const profile = buildDefaultProfile(user, firstName, lastName, 'google.com')
      await setDoc(docRef, profile)
    } else {
      // Sync verification states or update timeline
      await updateDoc(docRef, {
        emailVerified: user.emailVerified,
        updatedAt: new Date().toISOString(),
      })
    }

    return user
  },

  // 4. Logout
  async logout(): Promise<void> {
    if (this.isInitialized()) {
      await firebaseSignOut(firebaseAuth!)
    }
  },

  // 5. Send Forgot Password Reset Email
  async sendForgotPasswordEmail(email: string): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check your environment settings.')
    }
    await sendPasswordResetEmail(firebaseAuth!, email)
  },

  // 6. Confirm Custom Password Reset Link Action
  async confirmPasswordReset(code: string, password: string): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check your environment settings.')
    }
    await firebaseConfirmPasswordReset(firebaseAuth!, code, password)
  },

  // 7. Resend Verification Email
  async resendVerification(): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase Auth is not initialized. Check your environment settings.')
    }
    const user = firebaseAuth!.currentUser
    if (user) {
      await sendEmailVerification(user)
    } else {
      throw new Error('No user currently authenticated.')
    }
  },

  // 8. Fetch Firestore profile document
  async fetchUserProfile(uid: string): Promise<UserProfile | null> {
    if (!this.isInitialized()) return null
    const docSnap = await getDoc(doc(firebaseDb!, 'users', uid))
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null
  },

  // 9. Force refresh email verified status in Firestore
  async updateUserVerification(uid: string): Promise<void> {
    if (!this.isInitialized()) return
    await updateDoc(doc(firebaseDb!, 'users', uid), {
      emailVerified: true,
      updatedAt: new Date().toISOString(),
    })
  },
}
