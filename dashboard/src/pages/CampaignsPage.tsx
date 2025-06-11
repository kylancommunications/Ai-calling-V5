import { useState, useEffect } from 'react'
import { PlusIcon, PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline'

interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  totalCalls: number
  completedCalls: number
  successRate: number
  createdAt: string
  script: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading campaigns
    setTimeout(() => {
      setCampaigns([
        {
          id: '1',
          name: 'Q1 Sales Outreach',
          status: 'active',
          totalCalls: 500,
          completedCalls: 342,
          successRate: 23.5,
          createdAt: '2024-01-10T00:00:00Z',
          script: 'Hi, this is an AI assistant calling about our new product offering...'
        },
        {
          id: '2',
          name: 'Customer Satisfaction Survey',
          status: 'paused',
          totalCalls: 200,
          completedCalls: 89,
          successRate: 67.4,
          createdAt: '2024-01-08T00:00:00Z',
          script: 'Hello, we\'re conducting a brief satisfaction survey...'
        },
        {
          id: '3',
          name: 'Product Demo Scheduling',
          status: 'completed',
          totalCalls: 150,
          completedCalls: 150,
          successRate: 31.2,
          createdAt: '2024-01-05T00:00:00Z',
          script: 'Hi, I\'m calling to schedule a product demonstration...'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      case 'draft': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your AI calling campaigns and track their performance.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {campaign.name}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                  <span className="ml-1">{campaign.status}</span>
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Progress</span>
                  <span>{campaign.completedCalls}/{campaign.totalCalls}</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(campaign.completedCalls / campaign.totalCalls) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{campaign.successRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Script Preview</p>
                <p className="text-sm text-gray-900 truncate">{campaign.script}</p>
              </div>

              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  View Details
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first AI calling campaign.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Create Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  )
}