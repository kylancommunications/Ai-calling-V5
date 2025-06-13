const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://wllyticlzvtsimgefsti.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbHl0aWNsenZ0c2ltZ2Vmc3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTYxMDQxNiwiZXhwIjoyMDY1MTg2NDE2fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8' // This would be the service role key

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function verifyUser(email) {
  try {
    console.log(`Attempting to verify user: ${email}`)
    
    // Get user by email
    const { data: users, error: getUserError } = await supabase.auth.admin.listUsers()
    
    if (getUserError) {
      console.error('Error getting users:', getUserError)
      return
    }
    
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.log('User not found')
      return
    }
    
    console.log('User found:', user.id)
    
    // Update user to verified
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    })
    
    if (error) {
      console.error('Error verifying user:', error)
    } else {
      console.log('User verified successfully!')
      console.log('User data:', data.user)
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

// Verify the user
verifyUser('gamblerspassion@gmail.com')