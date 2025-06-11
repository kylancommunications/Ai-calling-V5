import { supabase } from '../lib/supabase'
import type { 
  Profile, 
  CallLog, 
  Campaign, 
  CampaignLead, 
  AnalyticsData,
  DNCEntry,
  WebhookEndpoint,
  WebhookDelivery,
  Subscription,
  UsageRecord,
  ComplianceReport,
  SystemStatus
} from '../lib/supabase'

export class DatabaseService {
  // Profile operations
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }

    return data
  }

  // Call logs operations
  static async getCallLogs(profileId: string, limit = 50, offset = 0): Promise<CallLog[]> {
    const { data, error } = await supabase
      .from('call_logs')
      .select(`
        *,
        outbound_campaigns(name)
      `)
      .eq('profile_id', profileId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching call logs:', error)
      return []
    }

    return data || []
  }

  static async getActiveCallLogs(profileId: string): Promise<CallLog[]> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('profile_id', profileId)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching active calls:', error)
      return []
    }

    return data || []
  }

  static async createCallLog(callLog: Omit<CallLog, 'id' | 'created_at' | 'updated_at'>): Promise<CallLog | null> {
    const { data, error } = await supabase
      .from('call_logs')
      .insert(callLog)
      .select()
      .single()

    if (error) {
      console.error('Error creating call log:', error)
      throw error
    }

    return data
  }

  static async updateCallLog(id: string, updates: Partial<CallLog>): Promise<CallLog | null> {
    const { data, error } = await supabase
      .from('call_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating call log:', error)
      throw error
    }

    return data
  }

  // Campaign operations
  static async getCampaigns(profileId: string): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('outbound_campaigns')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }

    return data || []
  }

  static async createCampaign(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('outbound_campaigns')
      .insert(campaign)
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', error)
      throw error
    }

    return data
  }

  static async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('outbound_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign:', error)
      throw error
    }

    return data
  }

  static async deleteCampaign(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('outbound_campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting campaign:', error)
      throw error
    }

    return true
  }

  // Campaign leads operations
  static async getCampaignLeads(campaignId: string, limit = 100, offset = 0): Promise<CampaignLead[]> {
    const { data, error } = await supabase
      .from('campaign_leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching campaign leads:', error)
      return []
    }

    return data || []
  }

  static async createCampaignLead(lead: Omit<CampaignLead, 'id' | 'created_at' | 'updated_at'>): Promise<CampaignLead | null> {
    const { data, error } = await supabase
      .from('campaign_leads')
      .insert(lead)
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign lead:', error)
      throw error
    }

    return data
  }

  static async bulkCreateCampaignLeads(leads: Omit<CampaignLead, 'id' | 'created_at' | 'updated_at'>[]): Promise<CampaignLead[]> {
    const { data, error } = await supabase
      .from('campaign_leads')
      .insert(leads)
      .select()

    if (error) {
      console.error('Error bulk creating campaign leads:', error)
      throw error
    }

    return data || []
  }

  static async updateCampaignLead(id: string, updates: Partial<CampaignLead>): Promise<CampaignLead | null> {
    const { data, error } = await supabase
      .from('campaign_leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign lead:', error)
      throw error
    }

    return data
  }

  static async deleteCampaignLead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('campaign_leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting campaign lead:', error)
      throw error
    }

    return true
  }

  // Analytics operations
  static async getAnalytics(profileId: string): Promise<AnalyticsData> {
    try {
      // Get basic call statistics
      const { data: callStats } = await supabase
        .from('call_logs')
        .select('*')
        .eq('profile_id', profileId)

      // Get profile for usage limits
      const { data: profile } = await supabase
        .from('profiles')
        .select('minutes_used, monthly_minute_limit')
        .eq('id', profileId)
        .single()

      // Get campaign statistics
      const { data: campaigns } = await supabase
        .from('outbound_campaigns')
        .select('*')
        .eq('profile_id', profileId)

      const { data: leads } = await supabase
        .from('campaign_leads')
        .select('*')
        .eq('profile_id', profileId)

      // Process the data
      const totalCalls = callStats?.length || 0
      const totalMinutes = callStats?.reduce((sum, call) => sum + (call.duration_seconds / 60), 0) || 0
      const successfulCalls = callStats?.filter(call => call.status === 'completed').length || 0
      const averageCallDuration = totalCalls > 0 ? totalMinutes / totalCalls * 60 : 0

      // Group calls by day (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const callsByDay = callStats
        ?.filter(call => new Date(call.started_at) >= thirtyDaysAgo)
        .reduce((acc: Record<string, number>, call) => {
          const date = new Date(call.started_at).toISOString().split('T')[0]
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {})

      const callsByDayArray = Object.entries(callsByDay || {}).map(([date, count]) => ({
        date,
        count
      }))

      // Group calls by status
      const callsByStatus = callStats?.reduce((acc: Record<string, number>, call) => {
        acc[call.status] = (acc[call.status] || 0) + 1
        return acc
      }, {})

      const callsByStatusArray = Object.entries(callsByStatus || {}).map(([status, count]) => ({
        status,
        count
      }))

      // Top outcomes
      const topOutcomes = callStats
        ?.filter(call => call.outcome)
        .reduce((acc: Record<string, number>, call) => {
          acc[call.outcome!] = (acc[call.outcome!] || 0) + 1
          return acc
        }, {})

      const topOutcomesArray = Object.entries(topOutcomes || {})
        .map(([outcome, count]) => ({ outcome, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        totalCalls,
        totalMinutes,
        successfulCalls,
        averageCallDuration,
        callsByDay: callsByDayArray,
        callsByStatus: callsByStatusArray,
        topOutcomes: topOutcomesArray,
        minutesUsed: profile?.minutes_used || 0,
        minutesLimit: profile?.monthly_minute_limit || 1000,
        campaignStats: {
          totalCampaigns: campaigns?.length || 0,
          activeCampaigns: campaigns?.filter(c => c.status === 'active').length || 0,
          totalLeads: leads?.length || 0,
          leadsContacted: leads?.filter(l => l.status !== 'pending').length || 0
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return {
        totalCalls: 0,
        totalMinutes: 0,
        successfulCalls: 0,
        averageCallDuration: 0,
        callsByDay: [],
        callsByStatus: [],
        topOutcomes: [],
        minutesUsed: 0,
        minutesLimit: 1000,
        campaignStats: {
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalLeads: 0,
          leadsContacted: 0
        }
      }
    }
  }

  // Real-time subscriptions
  static subscribeToCallLogs(profileId: string, callback: (payload: any) => void) {
    return supabase
      .channel('call_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_logs',
          filter: `profile_id=eq.${profileId}`
        },
        callback
      )
      .subscribe()
  }

  static subscribeToCampaigns(profileId: string, callback: (payload: any) => void) {
    return supabase
      .channel('campaigns_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'outbound_campaigns',
          filter: `profile_id=eq.${profileId}`
        },
        callback
      )
      .subscribe()
  }

  // Usage tracking
  static async updateUsage(profileId: string, minutesUsed: number, callsMade = 0, callsReceived = 0, costCents = 0) {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('usage_tracking')
      .upsert({
        profile_id: profileId,
        date: today,
        minutes_used: minutesUsed,
        calls_made: callsMade,
        calls_received: callsReceived,
        cost_cents: costCents
      }, {
        onConflict: 'profile_id,date'
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating usage:', error)
      throw error
    }

    // Also update the profile's total minutes used
    await supabase
      .from('profiles')
      .update({ minutes_used: minutesUsed })
      .eq('id', profileId)

    return data
  }

  // DNC List operations
  static async getDNCEntries(profileId: string): Promise<DNCEntry[]> {
    const { data, error } = await supabase
      .from('dnc_lists')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching DNC entries:', error)
      throw error
    }

    return data || []
  }

  static async addDNCEntry(entry: Omit<DNCEntry, 'id' | 'created_at'>): Promise<DNCEntry> {
    const { data, error } = await supabase
      .from('dnc_lists')
      .insert(entry)
      .select()
      .single()

    if (error) {
      console.error('Error adding DNC entry:', error)
      throw error
    }

    return data
  }

  static async bulkAddDNCEntries(entries: Omit<DNCEntry, 'id' | 'created_at'>[]): Promise<DNCEntry[]> {
    const { data, error } = await supabase
      .from('dnc_lists')
      .insert(entries)
      .select()

    if (error) {
      console.error('Error bulk adding DNC entries:', error)
      throw error
    }

    return data || []
  }

  static async deleteDNCEntry(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('dnc_lists')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting DNC entry:', error)
      throw error
    }

    return true
  }

  static async checkDNCStatus(phoneNumber: string, profileId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('dnc_lists')
      .select('id')
      .eq('profile_id', profileId)
      .eq('phone_number', phoneNumber)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking DNC status:', error)
      return false
    }

    return !!data
  }

  // Webhook operations
  static async getWebhookEndpoints(profileId: string): Promise<WebhookEndpoint[]> {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching webhook endpoints:', error)
      throw error
    }

    return data || []
  }

  static async createWebhookEndpoint(webhook: Omit<WebhookEndpoint, 'id' | 'created_at' | 'updated_at' | 'success_count' | 'failure_count'>): Promise<WebhookEndpoint> {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .insert({
        ...webhook,
        success_count: 0,
        failure_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating webhook endpoint:', error)
      throw error
    }

    return data
  }

  static async updateWebhookEndpoint(id: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating webhook endpoint:', error)
      throw error
    }

    return data
  }

  static async deleteWebhookEndpoint(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('webhook_endpoints')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting webhook endpoint:', error)
      throw error
    }

    return true
  }

  static async testWebhookEndpoint(id: string): Promise<boolean> {
    // In a real implementation, this would trigger a test webhook
    const { data: webhook } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('id', id)
      .single()

    if (!webhook) return false

    // Simulate sending a test webhook
    const testPayload = {
      event: 'webhook.test',
      data: {
        webhook_id: id,
        test: true,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      user_id: webhook.profile_id
    }

    // Log the test delivery
    await supabase.from('webhook_deliveries').insert({
      webhook_id: id,
      event_type: 'webhook.test',
      payload: testPayload,
      success: true,
      response_status: 200
    })

    return true
  }

  static async getWebhookDeliveries(profileId: string): Promise<WebhookDelivery[]> {
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select(`
        *,
        webhook_endpoints!inner(profile_id)
      `)
      .eq('webhook_endpoints.profile_id', profileId)
      .order('delivered_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching webhook deliveries:', error)
      throw error
    }

    return data || []
  }

  // Billing operations
  static async getSubscription(profileId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('profile_id', profileId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error)
      throw error
    }

    return data
  }

  static async getUsageRecords(profileId: string): Promise<UsageRecord[]> {
    const { data, error } = await supabase
      .from('usage_records')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching usage records:', error)
      throw error
    }

    return data || []
  }

  static async createCheckoutSession(profileId: string, planId: string): Promise<string> {
    // In a real implementation, this would call Stripe API
    // For now, return a mock URL
    return `https://checkout.stripe.com/pay/cs_test_${planId}_${profileId}`
  }

  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (error) {
      console.error('Error cancelling subscription:', error)
      throw error
    }

    return true
  }

  // System Status operations
  static async getSystemStatus(): Promise<SystemStatus[]> {
    const { data, error } = await supabase
      .from('system_status')
      .select('*')
      .is('resolved_at', null)
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching system status:', error)
      throw error
    }

    return data || []
  }

  static async updateSystemStatus(serviceName: string, status: 'operational' | 'degraded' | 'outage', message?: string): Promise<SystemStatus> {
    // Resolve any existing issues for this service
    await supabase
      .from('system_status')
      .update({ resolved_at: new Date().toISOString() })
      .eq('service_name', serviceName)
      .is('resolved_at', null)

    // Create new status entry if not operational
    if (status !== 'operational') {
      const { data, error } = await supabase
        .from('system_status')
        .insert({
          service_name: serviceName,
          status,
          message,
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error updating system status:', error)
        throw error
      }

      return data
    }

    // Return a mock operational status
    return {
      id: 'operational',
      service_name: serviceName,
      status: 'operational',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  }

  // Compliance operations
  static async generateComplianceReport(profileId: string, reportType: string, startDate: string, endDate: string): Promise<ComplianceReport> {
    // Get relevant data for the report
    const [calls, dncEntries] = await Promise.all([
      this.getCallLogs(profileId),
      this.getDNCEntries(profileId)
    ])

    // Generate report data based on type
    let reportData = {}
    
    switch (reportType) {
      case 'dnc_compliance':
        const dncNumbers = new Set(dncEntries.filter(e => e.is_active).map(e => e.phone_number))
        const violations = calls.filter(call => 
          call.direction === 'outbound' && 
          dncNumbers.has(call.phone_number_to) &&
          new Date(call.started_at) >= new Date(startDate) &&
          new Date(call.started_at) <= new Date(endDate)
        )
        
        reportData = {
          totalOutboundCalls: calls.filter(c => c.direction === 'outbound').length,
          dncViolations: violations.length,
          complianceRate: calls.length > 0 ? ((calls.length - violations.length) / calls.length * 100) : 100,
          violations: violations.map(v => ({
            callId: v.id,
            phoneNumber: v.phone_number_to,
            callDate: v.started_at
          }))
        }
        break
        
      default:
        reportData = { message: 'Report type not implemented' }
    }

    const { data, error } = await supabase
      .from('compliance_reports')
      .insert({
        profile_id: profileId,
        report_type: reportType,
        report_period_start: startDate,
        report_period_end: endDate,
        report_data: reportData,
        generated_by: profileId
      })
      .select()
      .single()

    if (error) {
      console.error('Error generating compliance report:', error)
      throw error
    }

    return data
  }

  // Additional helper methods
  static async getAllCallLogs(profileId: string): Promise<CallLog[]> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('profile_id', profileId)
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching all call logs:', error)
      throw error
    }

    return data || []
  }
}