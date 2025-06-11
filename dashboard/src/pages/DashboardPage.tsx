import { useState, useEffect } from 'react'
import { PhoneIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase, type AnalyticsData } from '../lib/supabase'
import toast from 'react-hot-toast'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('get-analytics', {
        body: { days: timeRange }
      })

      if (error) throw error
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Analytics data could not be loaded.
        </p>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Calls',
      value: analytics.totalCalls.toLocaleString(),
      icon: PhoneIcon,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Minutes',
      value: analytics.totalMinutes.toLocaleString(),
      icon: ClockIcon,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Success Rate',
      value: analytics.totalCalls > 0 ? `${Math.round((analytics.successfulCalls / analytics.totalCalls) * 100)}%` : '0%',
      icon: CheckCircleIcon,
      change: '+2%',
      changeType: 'positive' as const,
    },
    {
      name: 'Minutes Used',
      value: `${analytics.minutesUsed}/${analytics.minutesLimit}`,
      icon: ClockIcon,
      change: `${Math.round((analytics.minutesUsed / analytics.minutesLimit) * 100)}%`,
      changeType: analytics.minutesUsed / analytics.minutesLimit > 0.8 ? 'negative' as const : 'neutral' as const,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your AI call center performance
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calls Over Time */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Calls Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.callsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Call Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Call Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.callsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.callsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Campaign Stats & Top Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campaign Statistics */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Campaigns</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.campaignStats.totalCampaigns}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Active Campaigns</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.campaignStats.activeCampaigns}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Leads</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.campaignStats.totalLeads.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Leads Contacted</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.campaignStats.leadsContacted.toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Contact Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.campaignStats.totalLeads > 0
                    ? `${Math.round((analytics.campaignStats.leadsContacted / analytics.campaignStats.totalLeads) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Outcomes */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Call Outcomes</h3>
          <div className="space-y-3">
            {analytics.topOutcomes.length > 0 ? (
              analytics.topOutcomes.map((outcome, index) => (
                <div key={outcome.outcome} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-900 capitalize">
                      {outcome.outcome.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {outcome.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No outcomes recorded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}