import { supabase } from '../lib/supabase'
import { mockAuth } from '../lib/mockAuth'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthError {
  message: string
  status?: number
}

export interface SignUpData {
  email: string
  password: string
  clientName: string
  companyName?: string
  phoneNumber?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export class AuthService {
  // Check if we're in demo mode
  private static isDemoMode(): boolean {
    return import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' || 
           !import.meta.env.VITE_SUPABASE_URL || 
           !import.meta.env.VITE_SUPABASE_ANON_KEY
  }

  // Sign up new user
  static async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    if (this.isDemoMode()) {
      return await mockAuth.signUp(data)
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.clientName,
            company_name: data.companyName,
            phone_number: data.phoneNumber
          }
        }
      })

      if (error) {
        return { user: null, error: { message: error.message } }
      }

      return { user: authData.user, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: { message: 'An unexpected error occurred' } }
    }
  }

  // Sign in existing user
  static async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    if (this.isDemoMode()) {
      return await mockAuth.signInWithPassword(data)
    }

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) {
        return { user: null, error: { message: error.message } }
      }

      return { user: authData.user, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: { message: 'An unexpected error occurred' } }
    }
  }

  // Sign out user
  static async signOut(): Promise<{ error: AuthError | null }> {
    if (this.isDemoMode()) {
      await mockAuth.signOut()
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: { message: error.message } }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  // Get current session
  static async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    if (this.isDemoMode()) {
      const result = await mockAuth.getSession()
      return { session: result.data.session, error: result.error }
    }

    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        return { session: null, error: { message: error.message } }
      }

      return { session: data.session, error: null }
    } catch (error) {
      console.error('Get session error:', error)
      return { session: null, error: { message: 'An unexpected error occurred' } }
    }
  }

  // Reset password
  static async resetPassword(data: ResetPasswordData): Promise<{ error: AuthError | null }> {
    if (this.isDemoMode()) {
      const result = await mockAuth.resetPasswordForEmail(data.email)
      return { error: result.error }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        return { error: { message: error.message } }
      }

      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  // Update password
  static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    if (this.isDemoMode()) {
      return { error: { message: 'Password update not available in demo mode' } }
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        return { error: { message: error.message } }
      }

      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  // Update user metadata
  static async updateUserMetadata(metadata: Record<string, any>): Promise<{ error: AuthError | null }> {
    if (this.isDemoMode()) {
      return { error: { message: 'User metadata update not available in demo mode' } }
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: metadata
      })
      
      if (error) {
        return { error: { message: error.message } }
      }

      return { error: null }
    } catch (error) {
      console.error('Update user metadata error:', error)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  // Refresh session
  static async refreshSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    if (this.isDemoMode()) {
      return await this.getSession()
    }

    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        return { session: null, error: { message: error.message } }
      }

      return { session: data.session, error: null }
    } catch (error) {
      console.error('Refresh session error:', error)
      return { session: null, error: { message: 'An unexpected error occurred' } }
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (this.isDemoMode()) {
      // For demo mode, we'll simulate auth state changes
      const checkDemoAuth = () => {
        const demoSession = localStorage.getItem('demo_session')
        if (demoSession) {
          try {
            const session = JSON.parse(demoSession)
            if (session.expires_at > Date.now()) {
              callback('SIGNED_IN', session)
            } else {
              localStorage.removeItem('demo_session')
              localStorage.removeItem('demo_user')
              callback('SIGNED_OUT', null)
            }
          } catch (error) {
            callback('SIGNED_OUT', null)
          }
        } else {
          callback('SIGNED_OUT', null)
        }
      }

      // Check immediately
      checkDemoAuth()

      // Set up a listener for localStorage changes (for demo mode)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'demo_session') {
          checkDemoAuth()
        }
      }

      window.addEventListener('storage', handleStorageChange)

      // Return cleanup function
      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return () => subscription.unsubscribe()
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    if (this.isDemoMode()) {
      const demoUser = localStorage.getItem('demo_user')
      if (demoUser) {
        try {
          const user = JSON.parse(demoUser)
          return { user, error: null }
        } catch (error) {
          return { user: null, error: { message: 'Invalid demo user data' } }
        }
      }
      return { user: null, error: null }
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return { user: null, error: { message: error.message } }
      }

      return { user, error: null }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, error: { message: 'An unexpected error occurred' } }
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const { session } = await this.getSession()
    return !!session
  }

  // Get demo credentials (for demo mode)
  static getDemoCredentials() {
    return {
      email: 'demo@example.com',
      password: 'demo123'
    }
  }
}