-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_plan as enum ('free', 'starter', 'professional', 'enterprise');
create type call_status as enum ('pending', 'in_progress', 'completed', 'failed', 'abandoned');
create type call_direction as enum ('inbound', 'outbound');
create type campaign_status as enum ('draft', 'active', 'paused', 'completed', 'cancelled');
create type lead_status as enum ('pending', 'called', 'answered', 'no_answer', 'busy', 'failed', 'completed');
create type agent_type as enum ('customer_service', 'sales', 'support', 'appointment_booking', 'survey', 'after_hours', 'general');
create type voice_name as enum ('Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede', 'Leda', 'Orus', 'Zephyr');
create type priority_level as enum ('low', 'normal', 'high', 'urgent');
create type escalation_type as enum ('human_agent', 'supervisor', 'voicemail', 'callback');
create type schedule_type as enum ('daily', 'weekly', 'monthly', 'once');

-- User profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  client_name text,
  company_name text,
  phone_number text,
  plan_name user_plan default 'free',
  monthly_minute_limit integer default 100,
  minutes_used integer default 0,
  is_active boolean default true,
  can_use_inbound boolean default true,
  can_use_outbound_dialer boolean default false,
  max_concurrent_calls integer default 1,
  permissions jsonb default '{"dashboard": true, "agents": false, "calls": false, "campaigns": false, "analytics": false, "appointments": false, "billing": false, "settings": false, "webhooks": false, "dnc": false, "status": false}',
  usage_cap integer default 1000, -- monthly usage cap in minutes
  used_minutes integer default 0, -- current month usage
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_profiles view for admin API compatibility
create or replace view user_profiles as
select 
  id,
  email,
  client_name,
  company_name,
  phone_number,
  permissions,
  usage_cap,
  used_minutes,
  is_active,
  created_at,
  updated_at
from profiles;

-- AI Agents table (multiple agents per user)
create table ai_agents (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  agent_type agent_type default 'customer_service',
  voice_name voice_name default 'Puck',
  language_code text default 'en-US',
  system_instruction text,
  twilio_phone_number text,
  twilio_webhook_url text,
  is_active boolean default true,
  max_concurrent_calls integer default 1,
  business_hours_start time,
  business_hours_end time,
  business_days integer[] default '{1,2,3,4,5}', -- Monday to Friday
  timezone text default 'UTC',
  escalation_enabled boolean default false,
  escalation_type escalation_type,
  escalation_phone_number text,
  escalation_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Call logs table
create table call_logs (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  agent_id uuid references ai_agents(id) on delete set null,
  campaign_id uuid,
  lead_id uuid,
  phone_number_from text not null,
  phone_number_to text not null,
  direction call_direction not null,
  status call_status default 'pending',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  duration_seconds integer default 0,
  call_summary text,
  transcript text,
  recording_url text,
  sentiment_score real,
  outcome text,
  priority priority_level default 'normal',
  customer_satisfaction_score integer check (customer_satisfaction_score >= 1 and customer_satisfaction_score <= 5),
  follow_up_required boolean default false,
  follow_up_date timestamp with time zone,
  tags text[],
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Outbound campaigns table
create table outbound_campaigns (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  agent_id uuid references ai_agents(id) on delete set null,
  name text not null,
  description text,
  status campaign_status default 'draft',
  caller_id text not null,
  max_concurrent_calls integer default 1,
  call_timeout_seconds integer default 30,
  retry_attempts integer default 3,
  retry_delay_minutes integer default 60,
  start_time time,
  end_time time,
  timezone text default 'UTC',
  days_of_week integer[] default '{1,2,3,4,5}',
  scheduled_start_date timestamp with time zone,
  scheduled_end_date timestamp with time zone,
  custom_system_instruction text,
  custom_voice_name voice_name,
  priority priority_level default 'normal',
  compliance_settings jsonb,
  total_leads integer default 0,
  leads_called integer default 0,
  leads_answered integer default 0,
  leads_completed integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Campaign leads table
create table campaign_leads (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references outbound_campaigns(id) on delete cascade not null,
  phone_number text not null,
  first_name text,
  last_name text,
  email text,
  company text,
  title text,
  status lead_status default 'pending',
  priority priority_level default 'normal',
  call_attempts integer default 0,
  last_call_at timestamp with time zone,
  next_call_at timestamp with time zone,
  outcome text,
  notes text,
  custom_fields jsonb,
  do_not_call boolean default false,
  preferred_call_time time,
  timezone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Call queues table (for inbound call management)
create table call_queues (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  agent_id uuid references ai_agents(id) on delete cascade not null,
  name text not null,
  description text,
  phone_number text not null,
  max_queue_size integer default 10,
  max_wait_time_seconds integer default 300,
  queue_music_url text,
  overflow_action escalation_type default 'voicemail',
  overflow_destination text,
  business_hours_only boolean default false,
  priority_routing boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Call routing rules table
create table call_routing_rules (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  conditions jsonb not null, -- JSON conditions for routing
  agent_id uuid references ai_agents(id) on delete cascade,
  queue_id uuid references call_queues(id) on delete cascade,
  priority integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Knowledge base table
create table knowledge_base (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  agent_id uuid references ai_agents(id) on delete cascade,
  title text not null,
  content text not null,
  category text,
  tags text[],
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Call scripts table
create table call_scripts (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  agent_id uuid references ai_agents(id) on delete cascade,
  name text not null,
  script_type agent_type not null,
  opening_script text,
  objection_handling jsonb,
  closing_script text,
  escalation_script text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appointments table
create table appointments (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  call_log_id uuid references call_logs(id) on delete set null,
  lead_id uuid references campaign_leads(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  appointment_type text not null,
  scheduled_date timestamp with time zone not null,
  duration_minutes integer default 30,
  location text,
  notes text,
  status text default 'scheduled',
  reminder_sent boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Call analytics table
create table call_analytics (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  agent_id uuid references ai_agents(id) on delete cascade,
  date date not null,
  total_calls integer default 0,
  inbound_calls integer default 0,
  outbound_calls integer default 0,
  answered_calls integer default 0,
  missed_calls integer default 0,
  total_duration_seconds integer default 0,
  average_duration_seconds real default 0,
  customer_satisfaction_avg real,
  sentiment_score_avg real,
  appointments_scheduled integer default 0,
  sales_completed integer default 0,
  escalations integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id, agent_id, date)
);

-- Webhooks table
create table webhooks (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  url text not null,
  events text[] not null,
  is_active boolean default true,
  secret_key text,
  retry_attempts integer default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- API keys table (encrypted storage)
create table api_keys (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  key_name text not null,
  encrypted_key text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id, key_name)
);

-- Do Not Call (DNC) lists table
create table dnc_lists (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  phone_number text not null,
  added_date timestamp with time zone default timezone('utc'::text, now()) not null,
  source text not null, -- 'customer_request', 'legal_requirement', 'manual', 'complaint'
  notes text,
  expiry_date timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id, phone_number)
);

-- Webhooks configuration table
create table webhook_endpoints (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  url text not null,
  events text[] not null, -- ['call.completed', 'campaign.finished', 'appointment.scheduled']
  is_active boolean default true,
  secret_key text,
  retry_attempts integer default 3,
  last_triggered_at timestamp with time zone,
  success_count integer default 0,
  failure_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Webhook delivery logs
create table webhook_deliveries (
  id uuid default uuid_generate_v4() primary key,
  webhook_id uuid references webhook_endpoints(id) on delete cascade not null,
  event_type text not null,
  payload jsonb not null,
  response_status integer,
  response_body text,
  delivered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  success boolean default false
);

-- Billing and subscriptions
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan_name text not null,
  status text not null, -- 'active', 'canceled', 'past_due', 'unpaid'
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Usage tracking for billing
create table usage_records (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  subscription_id uuid references subscriptions(id) on delete cascade,
  usage_type text not null, -- 'minutes', 'calls', 'agents'
  quantity integer not null,
  unit_price decimal(10,4),
  total_cost decimal(10,2),
  billing_period_start timestamp with time zone not null,
  billing_period_end timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Compliance reports
create table compliance_reports (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  report_type text not null, -- 'dnc_compliance', 'tcpa_compliance', 'call_recording_consent'
  report_period_start timestamp with time zone not null,
  report_period_end timestamp with time zone not null,
  report_data jsonb not null,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  generated_by uuid references profiles(id)
);

-- System status tracking
create table system_status (
  id uuid default uuid_generate_v4() primary key,
  service_name text not null, -- 'api', 'calls', 'webhooks', 'database'
  status text not null, -- 'operational', 'degraded', 'outage'
  message text,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table ai_agents enable row level security;
alter table call_logs enable row level security;
alter table outbound_campaigns enable row level security;
alter table campaign_leads enable row level security;
alter table call_queues enable row level security;
alter table call_routing_rules enable row level security;
alter table knowledge_base enable row level security;
alter table call_scripts enable row level security;
alter table appointments enable row level security;
alter table call_analytics enable row level security;
alter table webhooks enable row level security;
alter table api_keys enable row level security;
alter table dnc_lists enable row level security;
alter table webhook_endpoints enable row level security;
alter table webhook_deliveries enable row level security;
alter table subscriptions enable row level security;
alter table usage_records enable row level security;
alter table compliance_reports enable row level security;
alter table system_status enable row level security;

-- Create RLS policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can manage own agents" on ai_agents for all using (auth.uid() = profile_id);
create policy "Users can view own call logs" on call_logs for all using (auth.uid() = profile_id);
create policy "Users can manage own campaigns" on outbound_campaigns for all using (auth.uid() = profile_id);
create policy "Users can manage own leads" on campaign_leads for all using (
  auth.uid() = (select profile_id from outbound_campaigns where id = campaign_id)
);
create policy "Users can manage own queues" on call_queues for all using (auth.uid() = profile_id);
create policy "Users can manage own routing rules" on call_routing_rules for all using (auth.uid() = profile_id);
create policy "Users can manage own knowledge base" on knowledge_base for all using (auth.uid() = profile_id);
create policy "Users can manage own scripts" on call_scripts for all using (auth.uid() = profile_id);
create policy "Users can manage own appointments" on appointments for all using (auth.uid() = profile_id);
create policy "Users can view own analytics" on call_analytics for all using (auth.uid() = profile_id);
create policy "Users can manage own webhooks" on webhooks for all using (auth.uid() = profile_id);
create policy "Users can manage own API keys" on api_keys for all using (auth.uid() = profile_id);
create policy "Users can manage own DNC lists" on dnc_lists for all using (auth.uid() = profile_id);
create policy "Users can manage own webhook endpoints" on webhook_endpoints for all using (auth.uid() = profile_id);
create policy "Users can view own webhook deliveries" on webhook_deliveries for select using (
  auth.uid() = (select profile_id from webhook_endpoints where id = webhook_id)
);
create policy "Users can view own subscriptions" on subscriptions for select using (auth.uid() = profile_id);
create policy "Users can view own usage records" on usage_records for select using (auth.uid() = profile_id);
create policy "Users can manage own compliance reports" on compliance_reports for all using (auth.uid() = profile_id);
create policy "Everyone can view system status" on system_status for select using (true);

-- Create indexes for performance
create index idx_call_logs_profile_id on call_logs(profile_id);
create index idx_call_logs_agent_id on call_logs(agent_id);
create index idx_call_logs_started_at on call_logs(started_at);
create index idx_call_logs_status on call_logs(status);
create index idx_campaign_leads_campaign_id on campaign_leads(campaign_id);
create index idx_campaign_leads_status on campaign_leads(status);
create index idx_campaign_leads_next_call_at on campaign_leads(next_call_at);
create index idx_ai_agents_profile_id on ai_agents(profile_id);
create index idx_ai_agents_is_active on ai_agents(is_active);
create index idx_call_analytics_profile_id_date on call_analytics(profile_id, date);
create index idx_dnc_lists_profile_id on dnc_lists(profile_id);
create index idx_dnc_lists_phone_number on dnc_lists(phone_number);
create index idx_webhook_endpoints_profile_id on webhook_endpoints(profile_id);
create index idx_webhook_deliveries_webhook_id on webhook_deliveries(webhook_id);
create index idx_subscriptions_profile_id on subscriptions(profile_id);
create index idx_subscriptions_stripe_customer_id on subscriptions(stripe_customer_id);
create index idx_usage_records_profile_id on usage_records(profile_id);
create index idx_compliance_reports_profile_id on compliance_reports(profile_id);
create index idx_system_status_service_name on system_status(service_name);

-- Create functions for analytics
create or replace function get_user_analytics(user_id uuid, days_back integer default 30)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'totalCalls', coalesce(sum(total_calls), 0),
    'totalMinutes', coalesce(sum(total_duration_seconds) / 60, 0),
    'successfulCalls', coalesce(sum(answered_calls), 0),
    'averageCallDuration', coalesce(avg(average_duration_seconds), 0),
    'customerSatisfactionAvg', coalesce(avg(customer_satisfaction_avg), 0),
    'sentimentScoreAvg', coalesce(avg(sentiment_score_avg), 0),
    'appointmentsScheduled', coalesce(sum(appointments_scheduled), 0),
    'salesCompleted', coalesce(sum(sales_completed), 0),
    'escalations', coalesce(sum(escalations), 0),
    'callsByDay', (
      select json_agg(
        json_build_object(
          'date', date,
          'count', total_calls,
          'duration', total_duration_seconds
        ) order by date
      )
      from call_analytics
      where profile_id = user_id
        and date >= current_date - interval '1 day' * days_back
    ),
    'callsByStatus', (
      select json_agg(
        json_build_object(
          'status', status,
          'count', count(*)
        )
      )
      from call_logs
      where profile_id = user_id
        and started_at >= current_date - interval '1 day' * days_back
      group by status
    ),
    'topOutcomes', (
      select json_agg(
        json_build_object(
          'outcome', outcome,
          'count', count(*)
        ) order by count(*) desc
      )
      from call_logs
      where profile_id = user_id
        and outcome is not null
        and started_at >= current_date - interval '1 day' * days_back
      group by outcome
      limit 10
    )
  ) into result
  from call_analytics
  where profile_id = user_id
    and date >= current_date - interval '1 day' * days_back;
  
  return result;
end;
$$ language plpgsql security definer;

-- Create function to update analytics
create or replace function update_call_analytics()
returns trigger as $$
begin
  insert into call_analytics (
    profile_id,
    agent_id,
    date,
    total_calls,
    inbound_calls,
    outbound_calls,
    answered_calls,
    total_duration_seconds
  )
  values (
    NEW.profile_id,
    NEW.agent_id,
    date(NEW.started_at),
    1,
    case when NEW.direction = 'inbound' then 1 else 0 end,
    case when NEW.direction = 'outbound' then 1 else 0 end,
    case when NEW.status = 'completed' then 1 else 0 end,
    NEW.duration_seconds
  )
  on conflict (profile_id, agent_id, date)
  do update set
    total_calls = call_analytics.total_calls + 1,
    inbound_calls = call_analytics.inbound_calls + case when NEW.direction = 'inbound' then 1 else 0 end,
    outbound_calls = call_analytics.outbound_calls + case when NEW.direction = 'outbound' then 1 else 0 end,
    answered_calls = call_analytics.answered_calls + case when NEW.status = 'completed' then 1 else 0 end,
    total_duration_seconds = call_analytics.total_duration_seconds + NEW.duration_seconds,
    average_duration_seconds = (call_analytics.total_duration_seconds + NEW.duration_seconds) / (call_analytics.total_calls + 1);
  
  return NEW;
end;
$$ language plpgsql;

-- Create trigger for analytics
create trigger update_analytics_on_call_completion
  after insert or update on call_logs
  for each row
  when (NEW.status = 'completed')
  execute function update_call_analytics();

-- Create function to handle new user registration
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Insert demo data
insert into profiles (
  id,
  email,
  client_name,
  company_name,
  plan_name,
  monthly_minute_limit,
  can_use_outbound_dialer,
  max_concurrent_calls
) values (
  '00000000-0000-0000-0000-000000000000',
  'demo@example.com',
  'Demo User',
  'AI Call Center Demo',
  'professional',
  5000,
  true,
  5
) on conflict (id) do update set
  client_name = excluded.client_name,
  company_name = excluded.company_name,
  plan_name = excluded.plan_name,
  monthly_minute_limit = excluded.monthly_minute_limit,
  can_use_outbound_dialer = excluded.can_use_outbound_dialer,
  max_concurrent_calls = excluded.max_concurrent_calls;

-- Insert demo AI agents
insert into ai_agents (
  profile_id,
  name,
  description,
  agent_type,
  voice_name,
  system_instruction,
  twilio_phone_number,
  business_hours_start,
  business_hours_end,
  escalation_enabled
) values 
(
  '00000000-0000-0000-0000-000000000000',
  'Customer Service Agent',
  'Primary customer service agent for general inquiries',
  'customer_service',
  'Puck',
  'You are a professional customer service representative. Be helpful, polite, and efficient in resolving customer issues.',
  '+1-555-0001',
  '09:00:00',
  '17:00:00',
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Sales Agent',
  'Outbound sales agent for lead qualification and conversion',
  'sales',
  'Charon',
  'You are a professional sales representative. Focus on understanding customer needs and presenting solutions that provide value.',
  '+1-555-0002',
  '09:00:00',
  '18:00:00',
  false
),
(
  '00000000-0000-0000-0000-000000000000',
  'After Hours Support',
  '24/7 support agent for urgent issues',
  'after_hours',
  'Kore',
  'You are an after-hours support agent. Handle urgent issues and schedule callbacks for non-urgent matters during business hours.',
  '+1-555-0003',
  null,
  null,
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Appointment Scheduler',
  'Specialized agent for booking and managing appointments',
  'appointment_booking',
  'Aoede',
  'You are an appointment scheduling specialist. Help customers find convenient times and manage their bookings efficiently.',
  '+1-555-0004',
  '08:00:00',
  '20:00:00',
  false
);