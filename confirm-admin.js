const { createClient } = require('@supabase/supabase-js')

// This script manually confirms the admin user
// You would need the service key for this to work in production

const supabaseUrl = 'https://wllyticlzvtsimgefsti.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key-here'

async function confirmAdminUser() {
  try {
    // Create admin client with service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the admin user
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return
    }

    const adminUser = users.users.find(user => user.email === 'admin@aicallcenter.com')
    
    if (!adminUser) {
      console.log('Admin user not found')
      return
    }

    console.log('Found admin user:', adminUser.id, 'Confirmed:', adminUser.email_confirmed_at)

    if (!adminUser.email_confirmed_at) {
      // Confirm the user
      const { data, error } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { email_confirm: true }
      )

      if (error) {
        console.error('Error confirming user:', error)
      } else {
        console.log('Admin user confirmed successfully!')
      }
    } else {
      console.log('Admin user already confirmed')
    }

  } catch (error) {
    console.error('Script error:', error)
  }
}

// For now, let's just show what we would do
console.log('To confirm the admin user, you need to:')
console.log('1. Get the Supabase service key from your project settings')
console.log('2. Set SUPABASE_SERVICE_KEY environment variable')
console.log('3. Run this script with: SUPABASE_SERVICE_KEY=your-key node confirm-admin.js')
console.log('')
console.log('Alternatively, you can manually confirm the user in Supabase dashboard:')
console.log('1. Go to Authentication > Users in Supabase dashboard')
console.log('2. Find admin@aicallcenter.com')
console.log('3. Click the three dots and select "Confirm user"')
console.log('')
console.log('For now, let\'s enable demo mode to test the functionality...')

// confirmAdminUser()