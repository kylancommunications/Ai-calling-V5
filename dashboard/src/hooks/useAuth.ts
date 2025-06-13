import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { AuthService } from '../services/auth'
import { supabase } from '../lib/supabase'

// Helper function to ensure profile exists
async function ensureProfileExists(user: User) {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      console.log('Profile already exists')
      return
    }

    // Create profile if it doesn't exist
    const isAdmin = ['gamblerspassion@gmail.com', 'admin@example.com'].includes(user.email || '')
    const isDemoUser = user.email === 'demo@example.com'
    
    const profileData = {
      id: user.id,
      email: user.email || '',
      client_name: isAdmin ? 'Admin User' : isDemoUser ? 'Demo User' : 'User',
      company_name: isAdmin ? 'AI Call Center Admin' : 'AI Call Center',
      phone_number: '+1 (555) 000-0001',
      plan_name: isAdmin ? 'enterprise' : 'professional',
      monthly_minute_limit: isAdmin ? 0 : 1000, // 0 = unlimited for admin
      minutes_used: 0,
      is_active: true,
      can_use_inbound: true,
      can_use_outbound_dialer: true,
      max_concurrent_calls: isAdmin ? 10 : 3,
      permissions: {
        dashboard: true,
        agents: true,
        calls: true,
        campaigns: true,
        analytics: true,
        appointments: true,
        billing: true,
        settings: true,
        webhooks: true,
        dnc: true,
        status: true
      },
      usage_cap: isAdmin ? 0 : 1000,
      used_minutes: 0
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)

    if (insertError) {
      console.error('Error creating profile:', insertError)
    } else {
      console.log('Profile created successfully')
    }
  } catch (error) {
    console.error('Error in ensureProfileExists:', error)
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { session } = await AuthService.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setSession(null)
        setUser(null)
      }
      setLoading(false)
    }

    initAuth()

    // Listen for auth state changes
    const unsubscribe = AuthService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      setSession(session)
      setUser(session?.user ?? null)
      
      // Create profile if user just signed in and profile doesn't exist
      if (event === 'SIGNED_IN' && session?.user) {
        await ensureProfileExists(session.user)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
      // Force redirect to login page to clear state
      window.location.href = '/'
    }
  }

  return {
    user,
    session,
    loading,
    signOut,
  }
}