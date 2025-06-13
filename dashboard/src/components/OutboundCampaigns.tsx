import { useState } from 'react'
import { usePermissions } from '../contexts/UserContext'
import { 
  PlusIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  PhoneIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function OutboundCampaigns() {
  const { canUseOutboundDialer, maxAgentConfigurations, hasReachedAgentLimit } = usePermissions()
  const [campaigns] = useState([
    {
      id: 1,
      name: 'Summer Sale Follow-up',
      status: 'active',
      leads: 1250,
      called: 847,
      answered: 312,
      completed: 298,
      successRate: 95.5,
      lastActivity: '2 min ago'
    },
    {
      id: 2,
      name: 'Customer Satisfaction Survey',
      status: 'paused',
      leads: 500,
      called: 156,
      answered: 89,
      completed: 85,
      successRate: 95.5,
      lastActivity: '1 hour ago'
    },
    {
      id: 3,
      name: 'Product Demo Outreach',
      status: 'completed',
      leads: 300,
      called: 300,
      answered: 187,
      completed: 175,
      successRate: 93.6,
      lastActivity: '2 days ago'
    }
  ])

  // Mock current agent configurations count
  const currentAgentConfigs = 2

  if (!canUseOutboundDialer) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <PhoneIcon className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Outbound Dialer Not Available</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Your current plan doesn't include access to the outbound dialer feature. 
          Upgrade your plan to start creating and managing outbound campaigns.
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Upgrade Plan
        </button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayIcon className="h-4 w-4" />
      case 'paused': return <PauseIcon className="h-4 w-4" />
      case 'completed': return <StopIcon className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Campaign Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Outbound Campaigns</h2>
          <p className="text-slate-600">Manage your automated calling campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasReachedAgentLimit(currentAgentConfigs) && (
            <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                Agent limit reached ({currentAgentConfigs}/{maxAgentConfigurations})
              </span>
            </div>
          )}
          <button
            disabled={hasReachedAgentLimit(currentAgentConfigs)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              hasReachedAgentLimit(currentAgentConfigs)
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { name: 'Active Campaigns', value: '2', icon: PlayIcon, color: 'text-green-500' },
          { name: 'Total Leads', value: '2,050', icon: UserGroupIcon, color: 'text-blue-500' },
          { name: 'Calls Made', value: '1,303', icon: PhoneIcon, color: 'text-purple-500' },
          { name: 'Success Rate', value: '94.8%', icon: ChartBarIcon, color: 'text-emerald-500' },
        ].map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Your Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{campaign.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusIcon(campaign.status)}
                      <span className="capitalize">{campaign.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {campaign.called} / {campaign.leads} leads
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(campaign.called / campaign.leads) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{campaign.answered} answered</div>
                    <div className="text-sm text-slate-500">{campaign.successRate}% success</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {campaign.lastActivity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {campaign.status === 'active' && (
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <PauseIcon className="h-4 w-4" />
                        </button>
                      )}
                      {campaign.status === 'paused' && (
                        <button className="text-green-600 hover:text-green-900">
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Configuration Limit Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Agent Configuration Usage</h4>
            <p className="text-sm text-blue-700 mt-1">
              You're using {currentAgentConfigs} of {maxAgentConfigurations} available agent configurations. 
              {hasReachedAgentLimit(currentAgentConfigs) 
                ? ' Upgrade your plan to create more campaigns.'
                : ` You can create ${maxAgentConfigurations - currentAgentConfigs} more campaign${maxAgentConfigurations - currentAgentConfigs === 1 ? '' : 's'}.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}