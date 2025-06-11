import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  user_id: string
  client_name: string
  company_name?: string
  email: string
  phone_number?: string
  plan_name: 'starter' | 'professional' | 'enterprise'
  monthly_minute_limit: number
  minutes_used: number
  system_instruction: string
  voice_name: string
  language_code: string
  agent_type: string
  twilio_phone_number?: string
  twilio_webhook_url?: string
  is_active: boolean
  subscription_ends_at?: string
  created_at: string
  updated_at: string
}

export interface CallLog {
  id: string
  profile_id: string
  call_sid: string
  stream_sid?: string
  phone_number_from: string
  phone_number_to: string
  direction: 'inbound' | 'outbound'
  status: 'in_progress' | 'completed' | 'failed' | 'abandoned'
  duration_seconds: number
  started_at: string
  ended_at?: string
  transcript?: string
  call_summary?: string
  sentiment_score?: number
  intent_detected?: string
  outcome?: string
  recording_url?: string
  recording_duration?: number
  cost_cents: number
  campaign_id?: string
  lead_id?: string
  created_at: string
  updated_at: string
  outbound_campaigns?: {
    name: string
  }
}

export interface Campaign {
  id: string
  profile_id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  caller_id: string
  max_concurrent_calls: number
  call_timeout_seconds: number
  retry_attempts: number
  retry_delay_minutes: number
  start_time?: string
  end_time?: string
  timezone: string
  days_of_week: number[]
  custom_system_instruction?: string
  custom_voice_name?: string
  total_leads: number
  leads_called: number
  leads_answered: number
  leads_completed: number
  scheduled_start_at?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface CampaignLead {
  id: string
  campaign_id: string
  profile_id: string
  phone_number: string
  first_name?: string
  last_name?: string
  email?: string
  company?: string
  custom_data: Record<string, any>
  status: 'pending' | 'called' | 'answered' | 'no_answer' | 'busy' | 'failed' | 'completed'
  call_attempts: number
  last_call_at?: string
  next_call_at?: string
  call_log_id?: string
  outcome?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface AnalyticsData {
  totalCalls: number
  totalMinutes: number
  successfulCalls: number
  averageCallDuration: number
  callsByDay: Array<{ date: string; count: number }>
  callsByStatus: Array<{ status: string; count: number }>
  topOutcomes: Array<{ outcome: string; count: number }>
  minutesUsed: number
  minutesLimit: number
  campaignStats: {
    totalCampaigns: number
    activeCampaigns: number
    totalLeads: number
    leadsContacted: number
  }
}