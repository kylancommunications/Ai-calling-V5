import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Call Center Platform
          </h1>
          <p className="text-gray-600">
            Sign in to your account to manage your AI-powered call center
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
            }}
            providers={['google', 'github']}
            redirectTo={window.location.origin}
          />
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-sm text-gray-500">
          <p className="mb-2">Features included:</p>
          <ul className="space-y-1">
            <li>• AI-powered voice agents</li>
            <li>• Real-time call analytics</li>
            <li>• Automated outbound campaigns</li>
            <li>• Multi-tenant support</li>
          </ul>
        </div>
      </div>
    </div>
  )
}