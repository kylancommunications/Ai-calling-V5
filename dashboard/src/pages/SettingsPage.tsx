import { useState } from 'react'
import { Switch } from '@headlessui/react'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // AI Configuration
    geminiModel: 'gemini-2.0-flash-live-001',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'You are a professional AI assistant for a call center...',
    
    // Call Settings
    autoAnswer: true,
    recordCalls: true,
    transcribeRealtime: true,
    voiceActivityDetection: true,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    webhookNotifications: true,
    
    // Security
    requireAuth: true,
    ipWhitelist: '',
    apiKeyRotation: 30
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Configure your AI call center platform settings and preferences.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            AI Configuration
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="gemini-model" className="block text-sm font-medium text-gray-700">
                Gemini Model
              </label>
              <select
                id="gemini-model"
                value={settings.geminiModel}
                onChange={(e) => handleSettingChange('geminiModel', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="gemini-2.0-flash-live-001">Gemini 2.0 Flash Live</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>

            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                Temperature ({settings.temperature})
              </label>
              <input
                type="range"
                id="temperature"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                className="mt-1 block w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservative</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label htmlFor="max-tokens" className="block text-sm font-medium text-gray-700">
                Max Tokens
              </label>
              <input
                type="number"
                id="max-tokens"
                value={settings.maxTokens}
                onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700">
                System Prompt
              </label>
              <textarea
                id="system-prompt"
                rows={4}
                value={settings.systemPrompt}
                onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter your system prompt for the AI assistant..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Call Settings
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto Answer</h4>
                <p className="text-sm text-gray-500">Automatically answer incoming calls</p>
              </div>
              <Switch
                checked={settings.autoAnswer}
                onChange={(checked) => handleSettingChange('autoAnswer', checked)}
                className={classNames(
                  settings.autoAnswer ? 'bg-blue-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
              >
                <span
                  className={classNames(
                    settings.autoAnswer ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Record Calls</h4>
                <p className="text-sm text-gray-500">Save audio recordings of all calls</p>
              </div>
              <Switch
                checked={settings.recordCalls}
                onChange={(checked) => handleSettingChange('recordCalls', checked)}
                className={classNames(
                  settings.recordCalls ? 'bg-blue-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
              >
                <span
                  className={classNames(
                    settings.recordCalls ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Real-time Transcription</h4>
                <p className="text-sm text-gray-500">Generate live transcripts during calls</p>
              </div>
              <Switch
                checked={settings.transcribeRealtime}
                onChange={(checked) => handleSettingChange('transcribeRealtime', checked)}
                className={classNames(
                  settings.transcribeRealtime ? 'bg-blue-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
              >
                <span
                  className={classNames(
                    settings.transcribeRealtime ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Voice Activity Detection</h4>
                <p className="text-sm text-gray-500">Detect when users start and stop speaking</p>
              </div>
              <Switch
                checked={settings.voiceActivityDetection}
                onChange={(checked) => handleSettingChange('voiceActivityDetection', checked)}
                className={classNames(
                  settings.voiceActivityDetection ? 'bg-blue-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
              >
                <span
                  className={classNames(
                    settings.voiceActivityDetection ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            API Keys
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gemini API Key</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="password"
                  className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="AIzaSy..."
                />
                <button className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Update
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Twilio Account SID</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="password"
                  className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="AC..."
                />
                <button className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Update
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Twilio Auth Token</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="password"
                  className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
                <button className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}