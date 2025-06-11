-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT NOT NULL,
    phone_number TEXT,
    plan_name TEXT NOT NULL DEFAULT 'starter' CHECK (plan_name IN ('starter', 'professional', 'enterprise')),
    monthly_minute_limit INTEGER NOT NULL DEFAULT 1000,
    minutes_used INTEGER NOT NULL DEFAULT 0,
    system_instruction TEXT NOT NULL DEFAULT 'You are a professional AI assistant for customer service calls. Be helpful, polite, and efficient.',
    voice_name TEXT NOT NULL DEFAULT 'Puck',
    language_code TEXT NOT NULL DEFAULT 'en-US',
    agent_type TEXT NOT NULL DEFAULT 'customer_service',
    twilio_phone_number TEXT,
    twilio_webhook_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    -- Feature gating columns
    can_use_inbound BOOLEAN NOT NULL DEFAULT true,
    can_use_outbound_dialer BOOLEAN NOT NULL DEFAULT false,
    max_agent_configurations INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create call_logs table
CREATE TABLE IF NOT EXISTS call_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    call_sid TEXT NOT NULL,
    stream_sid TEXT,
    phone_number_from TEXT NOT NULL,
    phone_number_to TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'abandoned')),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    transcript TEXT,
    call_summary TEXT,
    sentiment_score DECIMAL(3,2),
    intent_detected TEXT,
    outcome TEXT,
    recording_url TEXT,
    recording_duration INTEGER,
    cost_cents INTEGER NOT NULL DEFAULT 0,
    campaign_id UUID,
    lead_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create outbound_campaigns table
CREATE TABLE IF NOT EXISTS outbound_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    caller_id TEXT NOT NULL,
    max_concurrent_calls INTEGER NOT NULL DEFAULT 1,
    call_timeout_seconds INTEGER NOT NULL DEFAULT 30,
    retry_attempts INTEGER NOT NULL DEFAULT 3,
    retry_delay_minutes INTEGER NOT NULL DEFAULT 60,
    start_time TIME,
    end_time TIME,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}',
    custom_system_instruction TEXT,
    custom_voice_name TEXT,
    total_leads INTEGER NOT NULL DEFAULT 0,
    leads_called INTEGER NOT NULL DEFAULT 0,
    leads_answered INTEGER NOT NULL DEFAULT 0,
    leads_completed INTEGER NOT NULL DEFAULT 0,
    scheduled_start_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_leads table
CREATE TABLE IF NOT EXISTS campaign_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES outbound_campaigns(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    company TEXT,
    custom_data JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'called', 'answered', 'no_answer', 'busy', 'failed', 'completed')),
    call_attempts INTEGER NOT NULL DEFAULT 0,
    last_call_at TIMESTAMP WITH TIME ZONE,
    next_call_at TIMESTAMP WITH TIME ZONE,
    call_log_id UUID REFERENCES call_logs(id),
    outcome TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_configurations table
CREATE TABLE IF NOT EXISTS agent_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    system_instruction TEXT NOT NULL,
    voice_name TEXT NOT NULL,
    language_code TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    minutes_used INTEGER NOT NULL DEFAULT 0,
    calls_made INTEGER NOT NULL DEFAULT 0,
    calls_received INTEGER NOT NULL DEFAULT 0,
    cost_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, date)
);

-- Create billing_history table
CREATE TABLE IF NOT EXISTS billing_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    description TEXT NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    stripe_invoice_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_profile_id ON call_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_outbound_campaigns_profile_id ON outbound_campaigns(profile_id);
CREATE INDEX IF NOT EXISTS idx_outbound_campaigns_status ON outbound_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_id ON campaign_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_status ON campaign_leads(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_profile_date ON usage_tracking(profile_id, date);

-- Add foreign key for campaign_id in call_logs
ALTER TABLE call_logs ADD CONSTRAINT fk_call_logs_campaign_id 
    FOREIGN KEY (campaign_id) REFERENCES outbound_campaigns(id) ON DELETE SET NULL;

-- Add foreign key for lead_id in call_logs
ALTER TABLE call_logs ADD CONSTRAINT fk_call_logs_lead_id 
    FOREIGN KEY (lead_id) REFERENCES campaign_leads(id) ON DELETE SET NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_call_logs_updated_at BEFORE UPDATE ON call_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outbound_campaigns_updated_at BEFORE UPDATE ON outbound_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_leads_updated_at BEFORE UPDATE ON campaign_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_configurations_updated_at BEFORE UPDATE ON agent_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_history_updated_at BEFORE UPDATE ON billing_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Call logs: Users can only access their own call logs
CREATE POLICY "Users can view own call logs" ON call_logs FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own call logs" ON call_logs FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own call logs" ON call_logs FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Outbound campaigns: Users can only access their own campaigns
CREATE POLICY "Users can view own campaigns" ON outbound_campaigns FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own campaigns" ON outbound_campaigns FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own campaigns" ON outbound_campaigns FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own campaigns" ON outbound_campaigns FOR DELETE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Campaign leads: Users can only access their own campaign leads
CREATE POLICY "Users can view own campaign leads" ON campaign_leads FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own campaign leads" ON campaign_leads FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own campaign leads" ON campaign_leads FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own campaign leads" ON campaign_leads FOR DELETE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Agent configurations: Users can only access their own configurations
CREATE POLICY "Users can view own agent configs" ON agent_configurations FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own agent configs" ON agent_configurations FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own agent configs" ON agent_configurations FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own agent configs" ON agent_configurations FOR DELETE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Usage tracking: Users can only access their own usage data
CREATE POLICY "Users can view own usage" ON usage_tracking FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own usage" ON usage_tracking FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own usage" ON usage_tracking FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Billing history: Users can only access their own billing data
CREATE POLICY "Users can view own billing" ON billing_history FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, client_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get user analytics
CREATE OR REPLACE FUNCTION get_user_analytics(user_profile_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalCalls', COALESCE(COUNT(*), 0),
        'totalMinutes', COALESCE(SUM(duration_seconds) / 60, 0),
        'successfulCalls', COALESCE(COUNT(*) FILTER (WHERE status = 'completed'), 0),
        'averageCallDuration', COALESCE(AVG(duration_seconds), 0),
        'callsByDay', (
            SELECT json_agg(
                json_build_object(
                    'date', date_trunc('day', started_at)::date,
                    'count', COUNT(*)
                )
            )
            FROM call_logs
            WHERE profile_id = user_profile_id
            AND started_at >= NOW() - INTERVAL '30 days'
            GROUP BY date_trunc('day', started_at)
            ORDER BY date_trunc('day', started_at)
        ),
        'callsByStatus', (
            SELECT json_agg(
                json_build_object(
                    'status', status,
                    'count', COUNT(*)
                )
            )
            FROM call_logs
            WHERE profile_id = user_profile_id
            GROUP BY status
        ),
        'topOutcomes', (
            SELECT json_agg(
                json_build_object(
                    'outcome', outcome,
                    'count', COUNT(*)
                )
            )
            FROM call_logs
            WHERE profile_id = user_profile_id
            AND outcome IS NOT NULL
            GROUP BY outcome
            ORDER BY COUNT(*) DESC
            LIMIT 10
        )
    ) INTO result
    FROM call_logs
    WHERE profile_id = user_profile_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;