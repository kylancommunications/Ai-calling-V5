import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wllyticlzvtsimgefsti.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbHl0aWNsenZ0c2ltZ2Vmc3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTA0MTYsImV4cCI6MjA2NTE4NjQxNn0.V2pQNPbCBCjw9WecUFE45dIswma0DjB6ikLi9Kdgcnk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyUser() {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: '6152db3bf3e186078b35b6f60e078eca8837a2ec3da9968efc96713f',
      type: 'signup'
    })

    if (error) {
      console.error('Verification error:', error)
    } else {
      console.log('Verification successful:', data)
    }
  } catch (error) {
    console.error('Script error:', error)
  }
}

verifyUser()