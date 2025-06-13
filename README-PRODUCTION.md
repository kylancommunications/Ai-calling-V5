# AI Call Center Platform - Production Ready

A comprehensive, production-ready AI-powered call center platform built with React, TypeScript, Supabase, and Vercel. This platform enables businesses to deploy multiple AI agents for various use cases including customer service, sales, technical support, appointment booking, and after-hours assistance.

## 🚀 Features

### ✅ **Multiple AI Agents**
- **Simultaneous Operation**: Run multiple AI agents concurrently on different phone numbers
- **Agent Types**: Customer Service, Sales, Technical Support, Appointment Booking, Survey, After Hours, General Assistant
- **Individual Configuration**: Each agent has its own voice, language, system instructions, and business hours
- **Concurrent Call Limits**: Configurable limits per agent to manage resources

### ✅ **Advanced Voice Options**
- **8 Premium Voices**: Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, Zephyr
- **Voice Descriptions**: Detailed descriptions to help users choose the right voice
- **Per-Agent Configuration**: Different voices for different agents

### ✅ **Comprehensive Call Management**
- **Inbound & Outbound**: Handle both incoming and outgoing calls
- **Real-Time Monitoring**: Live call tracking and status updates
- **Call Recording**: Secure storage of call recordings
- **Live Transcription**: Real-time speech-to-text conversion
- **Sentiment Analysis**: Automatic mood detection during calls
- **Call Analytics**: Detailed performance metrics and insights

### ✅ **Advanced Campaign Management**
- **Smart Scheduling**: Time-based scheduling with timezone support
- **Day-of-Week Selection**: Choose specific days for campaigns
- **Date Range Scheduling**: Set campaign start and end dates
- **Business Hours Enforcement**: Respect business hours for each agent
- **Lead Management**: Import, track, and manage prospect lists
- **Retry Logic**: Configurable retry attempts and delays

### ✅ **Appointment Management**
- **Automated Booking**: AI agents can schedule appointments
- **Calendar Integration**: Full appointment lifecycle management
- **Reminder System**: Automated appointment reminders
- **Status Tracking**: Scheduled, confirmed, cancelled, completed, no-show
- **Customer Management**: Contact information and appointment history

### ✅ **Compliance & Legal**
- **Do Not Call (DNC) Management**: Comprehensive DNC list management
- **Bulk Upload/Export**: CSV import/export for DNC lists
- **Compliance Reporting**: Automated compliance reports
- **TCPA Compliance**: Built-in compliance features
- **Audit Logging**: Complete activity tracking

### ✅ **Webhooks & Integrations**
- **Real-Time Webhooks**: Send data to external services
- **Zapier Integration**: Pre-built templates for popular services
- **Event Types**: Call events, campaign events, appointment events
- **Delivery Tracking**: Monitor webhook success/failure rates
- **Retry Logic**: Automatic retry for failed webhooks

### ✅ **Billing & Subscription Management**
- **Stripe Integration**: Complete payment processing
- **Multiple Plans**: Free, Starter, Professional, Enterprise
- **Usage Tracking**: Monitor minutes, calls, and agent usage
- **Billing History**: Complete transaction history
- **Plan Upgrades**: Seamless plan changes

### ✅ **System Monitoring**
- **Status Page**: Real-time system health monitoring
- **Uptime Tracking**: 30-day uptime history
- **Service Monitoring**: Individual service status tracking
- **Performance Metrics**: Response times and system performance
- **Incident Management**: Track and resolve system issues

### ✅ **Data Export & Analytics**
- **CSV Export**: Export calls, campaigns, appointments, DNC lists
- **Advanced Analytics**: Comprehensive reporting and insights
- **Real-Time Dashboards**: Live performance monitoring
- **Custom Reports**: Flexible reporting options
- **Performance Tracking**: Success rates, conversion metrics

### ✅ **Email Notifications**
- **Campaign Completion**: Automated campaign reports
- **Usage Alerts**: Notify when approaching limits
- **Appointment Notifications**: New appointment alerts
- **System Alerts**: Important system notifications
- **DNC Violations**: Compliance violation alerts

## 🏗️ Architecture

### **Frontend**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **React Router** for navigation
- **React Hot Toast** for notifications

### **Backend**
- **Supabase** for database and authentication
- **Row-Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates
- **PostgreSQL** with advanced indexing

### **Integrations**
- **Twilio** for telephony services
- **Google Gemini AI** for conversation intelligence
- **Stripe** for payment processing
- **SendGrid** for email notifications
- **Zapier** for third-party integrations

### **Deployment**
- **Vercel** for frontend hosting
- **Supabase** for backend services
- **CDN** for global content delivery
- **Environment-based configuration**

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account
- Twilio account (for phone services)
- Google AI Studio account (for Gemini API)
- Stripe account (for billing)
- SendGrid account (for emails)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Ai-calling-V2
```

### 2. Install Dependencies
```bash
cd dashboard
npm install
```

### 3. Set Up Supabase
1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql`
3. Enable Row Level Security
4. Get your project URL and anon key

### 4. Configure Environment Variables
Create a `.env.local` file in the dashboard directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_URL=http://localhost:3000

# API Keys (configure these in the app settings)
# TWILIO_ACCOUNT_SID=your_twilio_account_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# GEMINI_API_KEY=your_gemini_api_key
# STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
# SENDGRID_API_KEY=your_sendgrid_api_key
```

### 5. Run the Development Server
```bash
npm run dev
```

### 6. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL schema with the following main tables:

- **profiles**: User accounts and settings
- **ai_agents**: AI agent configurations
- **call_logs**: Call history and analytics
- **outbound_campaigns**: Campaign management
- **campaign_leads**: Lead tracking
- **appointments**: Appointment scheduling
- **dnc_lists**: Do Not Call management
- **webhook_endpoints**: Webhook configurations
- **subscriptions**: Billing and plans
- **usage_records**: Usage tracking
- **system_status**: System monitoring

## 🔧 Configuration

### **AI Agent Setup**
1. Navigate to AI Agents page
2. Click "Create Agent"
3. Configure agent type, voice, and settings
4. Set business hours and escalation rules
5. Add Twilio phone number

### **Campaign Creation**
1. Go to Campaigns page
2. Create new campaign
3. Upload lead list (CSV)
4. Configure scheduling and timing
5. Select AI agent and launch

### **Webhook Integration**
1. Visit Webhooks page
2. Create new webhook endpoint
3. Select events to monitor
4. Configure retry settings
5. Test webhook delivery

### **Billing Setup**
1. Access Billing page
2. Choose subscription plan
3. Add payment method
4. Monitor usage and limits

## 🔐 Security Features

- **Row-Level Security (RLS)** on all tables
- **Encrypted API key storage**
- **Webhook signature verification**
- **Audit logging** for all actions
- **GDPR compliance** features
- **Data encryption** at rest and in transit

## 📈 Monitoring & Analytics

### **Real-Time Dashboards**
- Live call monitoring
- Agent performance metrics
- Campaign progress tracking
- System health status

### **Historical Analytics**
- Call volume trends
- Success rate analysis
- Customer satisfaction scores
- ROI tracking

### **Custom Reports**
- Exportable data (CSV, JSON)
- Date range selection
- Advanced filtering
- Scheduled reports

## 🔗 API Integration

### **Webhook Events**
- `call.started` - When a call begins
- `call.completed` - When a call ends
- `campaign.completed` - When a campaign finishes
- `appointment.scheduled` - When an appointment is booked
- `lead.updated` - When a lead status changes

### **Zapier Templates**
- **Slack Notifications**: Send call updates to Slack
- **Google Calendar**: Add appointments to calendar
- **CRM Updates**: Update leads in your CRM
- **Email Reports**: Send campaign reports via email

## 🛠️ Development

### **Project Structure**
```
dashboard/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API and business logic
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utilities and configurations
├── public/            # Static assets
└── supabase/          # Database schema and migrations
```

### **Key Services**
- **DatabaseService**: Supabase database operations
- **RealtimeService**: Real-time subscriptions
- **ExportService**: Data export functionality
- **NotificationService**: Email and webhook notifications

### **Adding New Features**
1. Update database schema in `supabase/schema.sql`
2. Add TypeScript types in `lib/supabase.ts`
3. Create database methods in `services/database.ts`
4. Add real-time subscriptions in `services/realtime.ts`
5. Build UI components and pages
6. Update navigation and routing

## 🚀 Production Deployment

### **Vercel Configuration**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### **Environment Variables**
Set these in your Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`

### **Domain Setup**
1. Add custom domain in Vercel
2. Configure DNS settings
3. Enable SSL certificate
4. Update CORS settings in Supabase

## 📞 Support & Documentation

### **Getting Help**
- Check the status page for system issues
- Review the compliance reports for DNC violations
- Monitor webhook delivery logs for integration issues
- Use the export features for data analysis

### **Best Practices**
- Regularly update DNC lists for compliance
- Monitor usage to avoid overage charges
- Set up webhooks for important events
- Review call analytics for optimization
- Test AI agents before production use

## 🔄 Updates & Maintenance

### **Regular Tasks**
- Monitor system status and uptime
- Review compliance reports
- Update DNC lists as needed
- Analyze call performance metrics
- Check webhook delivery success rates

### **Scaling Considerations**
- Monitor concurrent call limits
- Upgrade plans as usage grows
- Optimize database queries for performance
- Consider CDN for global users
- Implement caching for frequently accessed data

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. For feature requests or bug reports, please contact the development team.

---

**Ready for Production!** 🎉

This AI Call Center Platform is now fully production-ready with enterprise-grade features, comprehensive security, and scalable architecture. Simply add your environment variables and deploy to start handling calls with AI agents.