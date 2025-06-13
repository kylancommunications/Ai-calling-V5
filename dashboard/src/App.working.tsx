import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { UserProvider } from './contexts/UserContext'
import { useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import AgentsPage from './pages/AgentsPage'
import CallsPage from './pages/CallsPage'
import AppointmentsPage from './pages/AppointmentsPage'
import CampaignsPage from './pages/CampaignsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import DNCPage from './pages/DNCPage'
import WebhooksPage from './pages/WebhooksPage'
import BillingPage from './pages/BillingPage'
import StatusPage from './pages/StatusPage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// All components are now imported and functional

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/calls" element={<CallsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/dnc" element={<DNCPage />} />
        <Route path="/webhooks" element={<WebhooksPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </UserProvider>
    </Router>
  )
}

export default App