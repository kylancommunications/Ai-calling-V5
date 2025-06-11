import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Profile } from '../lib/supabase'
import { DatabaseService } from '../services/database'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface UserContextType {
  user: Profile | null
  loading: boolean
  updateUser: (updates: Partial<Profile>) => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Demo user data for fallback
const demoUser: Profile = {
  id: 'demo-user-1',
  user_id: 'demo-user-1',
  client_name: 'Demo User',
  company_name: 'AI Call Center Demo',
  email: 'demo@example.com',
  phone_number: '+1 (555) 123-4567',
  plan_name: 'professional',
  monthly_minute_limit: 1000,
  minutes_used: 752,
  system_instruction: 'You are a professional AI assistant for customer service calls. Be helpful, polite, and efficient.',
  voice_name: 'Puck',
  language_code: 'en-US',
  agent_type: 'customer_service',
  twilio_phone_number: '+1 (555) 987-6543',
  twilio_webhook_url: 'https://demo.callcenter.ai/webhook',
  is_active: true,
  subscription_ends_at: '2024-12-31T23:59:59Z',
  can_use_inbound: true,
  can_use_outbound_dialer: true,
  max_agent_configurations: 3,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-10T00:00:00Z'
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user: authUser } = useAuth()

  const loadUser = async () => {
    if (!authUser) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Check if we're in demo mode
      if (authUser.email === 'demo@example.com') {
        setUser(demoUser)
        setLoading(false)
        return
      }

      const profile = await DatabaseService.getProfile(authUser.id)
      
      if (profile) {
        setUser(profile)
      } else {
        // Profile doesn't exist, this shouldn't happen with the trigger
        // but let's handle it gracefully
        console.warn('Profile not found for user:', authUser.id)
        setUser(null)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Fallback to demo user in case of error
      if (authUser.email === 'demo@example.com') {
        setUser(demoUser)
      } else {
        toast.error('Failed to load user profile')
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [authUser])

  const updateUser = async (updates: Partial<Profile>) => {
    if (!user || !authUser) {
      toast.error('No user to update')
      return
    }

    try {
      // For demo user, just update locally
      if (authUser.email === 'demo@example.com') {
        setUser({ ...user, ...updates })
        toast.success('Profile updated successfully')
        return
      }

      const updatedProfile = await DatabaseService.updateProfile(authUser.id, updates)
      
      if (updatedProfile) {
        setUser(updatedProfile)
        toast.success('Profile updated successfully')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating user profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const refreshUser = async () => {
    await loadUser()
  }

  return (
    <UserContext.Provider value={{ user, loading, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Hook for checking permissions
export function usePermissions() {
  const { user } = useUser()
  
  return {
    canUseInbound: user?.can_use_inbound ?? false,
    canUseOutboundDialer: user?.can_use_outbound_dialer ?? false,
    maxAgentConfigurations: user?.max_agent_configurations ?? 1,
    hasReachedAgentLimit: (currentCount: number) => 
      currentCount >= (user?.max_agent_configurations ?? 1),
    planName: user?.plan_name ?? 'starter'
  }
}