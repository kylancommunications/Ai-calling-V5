import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Profile } from '../lib/supabase'

interface UserContextType {
  user: Profile | null
  loading: boolean
  updateUser: (updates: Partial<Profile>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Mock user data for demo
const mockUser: Profile = {
  id: 'demo-user-1',
  user_id: 'demo-user-1',
  client_name: 'Demo User',
  company_name: 'AI Call Center Demo',
  email: 'demo@callcenter.ai',
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
  // Feature gating - Professional plan permissions (restored)
  can_use_inbound: true,
  can_use_outbound_dialer: true,
  max_agent_configurations: 3,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-10T00:00:00Z'
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUser(mockUser)
      setLoading(false)
    }, 500)
  }, [])

  const updateUser = (updates: Partial<Profile>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, updateUser }}>
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