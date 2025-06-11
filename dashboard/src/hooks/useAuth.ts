import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { mockAuth } from '../lib/mockAuth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for demo session in localStorage first
    const checkDemoAuth = () => {
      const demoSession = localStorage.getItem('demo_session')
      if (demoSession) {
        try {
          const session = JSON.parse(demoSession)
          if (session.expires_at > Date.now()) {
            setSession(session)
            setUser(session.user)
            setLoading(false)
            return true
          } else {
            // Session expired, clean up
            localStorage.removeItem('demo_session')
            localStorage.removeItem('demo_user')
          }
        } catch (error) {
          console.error('Error parsing demo session:', error)
        }
      }
      return false
    }

    // Check demo auth first
    if (checkDemoAuth()) {
      return
    }

    // Get initial session - try Supabase
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.log('Supabase not available, using demo mode')
        setSession(null)
        setUser(null)
      }
      setLoading(false)
    }

    initAuth()

    // Listen for auth changes (Supabase only)
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      // If Supabase is not available, just return empty cleanup
      return () => {}
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      // Fallback to mock auth
      await mockAuth.signOut()
    }
    // Force reload to clear state
    window.location.reload()
  }

  return {
    user,
    session,
    loading,
    signOut,
  }
}