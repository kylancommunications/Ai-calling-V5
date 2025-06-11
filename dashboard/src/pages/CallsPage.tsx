import { useState, useEffect } from 'react'
import { PhoneIcon, ClockIcon } from '@heroicons/react/24/outline'

interface Call {
  id: string
  from: string
  to: string
  duration: number
  status: 'completed' | 'missed' | 'ongoing'
  timestamp: string
  transcript?: string
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading call history
    setTimeout(() => {
      setCalls([
        {
          id: '1',
          from: '+1234567890',
          to: '+1987654321',
          duration: 180,
          status: 'completed',
          timestamp: '2024-01-15T10:30:00Z',
          transcript: 'Customer inquiry about product pricing...'
        },
        {
          id: '2',
          from: '+1555123456',
          to: '+1987654321',
          duration: 45,
          status: 'missed',
          timestamp: '2024-01-15T09:15:00Z'
        },
        {
          id: '3',
          from: '+1777888999',
          to: '+1987654321',
          duration: 320,
          status: 'completed',
          timestamp: '2024-01-15T08:45:00Z',
          transcript: 'Sales call - customer interested in enterprise plan...'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'missed': return 'text-red-600 bg-red-100'
      case 'ongoing': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
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
          <h1 className="text-2xl font-semibold text-gray-900">Call History</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all calls made through your AI call center platform.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PhoneIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Start New Call
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {calls.map((call) => (
            <li key={call.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <PhoneIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {call.from} → {call.to}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                          {call.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <p>
                          {formatDuration(call.duration)} • {new Date(call.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {call.transcript && (
                        <p className="mt-2 text-sm text-gray-600 truncate max-w-md">
                          {call.transcript}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      View Details
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {calls.length === 0 && (
        <div className="text-center py-12">
          <PhoneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No calls yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by making your first AI-powered call.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PhoneIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Start First Call
            </button>
          </div>
        </div>
      )}
    </div>
  )
}