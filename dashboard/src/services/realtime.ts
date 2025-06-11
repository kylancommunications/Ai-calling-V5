import { supabase } from '../lib/supabase'
import type { CallLog, Campaign, DNCEntry, WebhookEndpoint, Appointment } from '../lib/supabase'

export interface RealtimeCallUpdate {
  id: string
  status: 'in_progress' | 'completed' | 'failed' | 'abandoned'
  duration_seconds: number
  transcript?: string
  call_summary?: string
  sentiment_score?: number
  intent_detected?: string
  outcome?: string
}

export interface RealtimeCampaignUpdate {
  id: string
  leads_called: number
  leads_answered: number
  leads_completed: number
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
}

export class RealtimeService {
  private static channels: Map<string, any> = new Map()

  // Subscribe to call log updates for a specific profile
  static subscribeToCallUpdates(
    profileId: string, 
    onUpdate: (call: CallLog) => void,
    onInsert: (call: CallLog) => void,
    onDelete: (callId: string) => void
  ) {
    const channelName = `call_logs_${profileId}`
    
    // Unsubscribe from existing channel if it exists
    this.unsubscribe(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_logs',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('Call updated:', payload.new)
          onUpdate(payload.new as CallLog)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_logs',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('New call:', payload.new)
          onInsert(payload.new as CallLog)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'call_logs',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('Call deleted:', payload.old)
          onDelete(payload.old.id)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channelName
  }

  // Subscribe to campaign updates
  static subscribeToCampaignUpdates(
    profileId: string,
    onUpdate: (campaign: Campaign) => void,
    onInsert: (campaign: Campaign) => void,
    onDelete: (campaignId: string) => void
  ) {
    const channelName = `campaigns_${profileId}`
    
    // Unsubscribe from existing channel if it exists
    this.unsubscribe(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'outbound_campaigns',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('Campaign updated:', payload.new)
          onUpdate(payload.new as Campaign)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'outbound_campaigns',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('New campaign:', payload.new)
          onInsert(payload.new as Campaign)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'outbound_campaigns',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('Campaign deleted:', payload.old)
          onDelete(payload.old.id)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channelName
  }

  // Subscribe to campaign lead updates
  static subscribeToCampaignLeadUpdates(
    campaignId: string,
    onUpdate: (lead: any) => void
  ) {
    const channelName = `campaign_leads_${campaignId}`
    
    // Unsubscribe from existing channel if it exists
    this.unsubscribe(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaign_leads',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          console.log('Campaign lead updated:', payload.new)
          onUpdate(payload.new)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channelName
  }

  // Unsubscribe from a specific channel
  static unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  // Unsubscribe from all channels
  static unsubscribeAll() {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
  }

  // Send real-time call update (for external services to call)
  static async sendCallUpdate(callId: string, update: Partial<RealtimeCallUpdate>) {
    try {
      const { error } = await supabase
        .from('call_logs')
        .update(update)
        .eq('id', callId)

      if (error) {
        console.error('Error sending call update:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Failed to send call update:', error)
      return false
    }
  }

  // Send real-time campaign update
  static async sendCampaignUpdate(campaignId: string, update: Partial<RealtimeCampaignUpdate>) {
    try {
      const { error } = await supabase
        .from('outbound_campaigns')
        .update(update)
        .eq('id', campaignId)

      if (error) {
        console.error('Error sending campaign update:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Failed to send campaign update:', error)
      return false
    }
  }

  // Broadcast custom events (for app-specific real-time events)
  static broadcastEvent(channel: string, event: string, payload: any) {
    return supabase.channel(channel).send({
      type: 'broadcast',
      event,
      payload
    })
  }

  // Subscribe to custom broadcast events
  static subscribeToBroadcast(
    channel: string, 
    event: string, 
    callback: (payload: any) => void
  ) {
    const channelName = `broadcast_${channel}_${event}`
    
    // Unsubscribe from existing channel if it exists
    this.unsubscribe(channelName)

    const channelInstance = supabase
      .channel(channel)
      .on('broadcast', { event }, callback)
      .subscribe()

    this.channels.set(channelName, channelInstance)
    return channelName
  }

  // Get connection status
  static getConnectionStatus() {
    return supabase.realtime.isConnected()
  }

  // Manually reconnect
  static reconnect() {
    return supabase.realtime.connect()
  }

  // Disconnect
  static disconnect() {
    this.unsubscribeAll()
    return supabase.realtime.disconnect()
  }

  // Subscribe to DNC list updates
  static subscribeToDNCUpdates(
    profileId: string,
    onUpdate: (entry: DNCEntry) => void,
    onInsert: (entry: DNCEntry) => void,
    onDelete: (entryId: string) => void
  ) {
    const channelName = `dnc_${profileId}`
    
    // Unsubscribe from existing channel if it exists
    this.unsubscribe(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dnc_lists',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('DNC entry updated:', payload.new)
          onUpdate(payload.new as DNCEntry)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dnc_lists',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('New DNC entry:', payload.new)
          onInsert(payload.new as DNCEntry)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'dnc_lists',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('DNC entry deleted:', payload.old)
          onDelete(payload.old.id)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channelName
  }

  // Subscribe to webhook updates
  static subscribeToWebhookUpdates(
    profileId: string,
    onUpdate: (webhook: WebhookEndpoint) => void,
    onInsert: (webhook: WebhookEndpoint) => void,
    onDelete: (webhookId: string) => void
  ) {
    const channelName = `webhooks_${profileId}`
    
    // Unsubscribe from existing channel if it exists
    this.unsubscribe(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'webhook_endpoints',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('Webhook updated:', payload.new)
          onUpdate(payload.new as WebhookEndpoint)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_endpoints',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('New webhook:', payload.new)
          onInsert(payload.new as WebhookEndpoint)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'webhook_endpoints',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('Webhook deleted:', payload.old)
          onDelete(payload.old.id)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channelName
  }

  // Subscribe to appointment updates
  static subscribeToAppointmentUpdates(
    profileId: string,
    onUpdate: (appointment: Appointment) => void,
    onInsert: (appointment: Appointment) => void,
    onDelete: (appointmentId: string) => void
  ) {
    const channelName = `appointments_${profileId}`
    
    // Unsubscribe from existing channel if it exists
    this.unsubscribe(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('Appointment updated:', payload.new)
          onUpdate(payload.new as Appointment)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('New appointment:', payload.new)
          onInsert(payload.new as Appointment)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'appointments',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('Appointment deleted:', payload.old)
          onDelete(payload.old.id)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channelName
  }

  // Subscribe to system status updates (global)
  static subscribeToSystemStatusUpdates(
    onUpdate: (status: any) => void,
    onInsert: (status: any) => void
  ) {
    const channelName = 'system_status_global'
    
    // Unsubscribe from existing channel if it exists
    this.unsubscribe(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system_status'
        },
        (payload) => {
          console.log('System status updated:', payload.new)
          onUpdate(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_status'
        },
        (payload) => {
          console.log('New system status:', payload.new)
          onInsert(payload.new)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channelName
  }

  // Subscribe to AI agent updates
  static subscribeToAgentUpdates(
    profileId: string,
    onUpdate: (agent: any) => void,
    onInsert: (agent: any) => void,
    onDelete: (agentId: string) => void
  ) {
    const channelName = `agents_${profileId}`
    
    // Unsubscribe from existing channel if it exists
    this.unsubscribe(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_agents',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('Agent updated:', payload.new)
          onUpdate(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_agents',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('New agent:', payload.new)
          onInsert(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'ai_agents',
          filter: `profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('Agent deleted:', payload.old)
          onDelete(payload.old.id)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channelName
  }
}