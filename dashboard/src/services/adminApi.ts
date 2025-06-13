import { supabase } from '../lib/supabase'

export interface CreateUserData {
  email: string
  password: string
  clientName: string
  companyName?: string
  phoneNumber?: string
  usageCap: number
  permissions: Record<string, boolean>
}

export interface UserData {
  id: string
  email: string
  clientName: string
  companyName?: string
  phoneNumber?: string
  usageCap: number
  usedMinutes: number
  permissions: Record<string, boolean>
  createdAt: string
  isActive: boolean
}

export class AdminAPI {
  // Create a new user (admin only)
  static async createUser(userData: CreateUserData): Promise<{ user: UserData | null; error: string | null }> {
    try {
      // Use regular signup since we don't have service role key for admin.createUser
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            client_name: userData.clientName,
            company_name: userData.companyName,
            phone_number: userData.phoneNumber,
            role: 'user'
          }
        }
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'User creation failed - no user data returned' }
      }

      // The profile should be automatically created by the database trigger
      // Let's wait a moment and then fetch the profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        return { user: null, error: `Profile creation failed: ${profileError.message}. User created but profile not found. Email confirmation may be required.` }
      }

      // Update the profile with admin-specified data
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          client_name: userData.clientName,
          company_name: userData.companyName,
          phone_number: userData.phoneNumber,
          permissions: userData.permissions,
          usage_cap: userData.usageCap,
          used_minutes: 0,
          is_active: true
        })
        .eq('id', authData.user.id)
        .select()
        .single()

      if (updateError) {
        return { user: null, error: `Profile update failed: ${updateError.message}` }
      }

      const finalProfile = updatedProfile || profileData

      const user: UserData = {
        id: profileData.id,
        email: profileData.email,
        clientName: profileData.client_name,
        companyName: profileData.company_name,
        phoneNumber: profileData.phone_number,
        usageCap: profileData.usage_cap,
        usedMinutes: profileData.used_minutes,
        permissions: profileData.permissions,
        createdAt: profileData.created_at,
        isActive: profileData.is_active
      }

      return { user, error: null }
    } catch (error) {
      console.error('Error creating user:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Get all users (admin only)
  static async getUsers(): Promise<{ users: UserData[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { users: [], error: error.message }
      }

      const users: UserData[] = data.map(profile => ({
        id: profile.id,
        email: profile.email,
        clientName: profile.client_name,
        companyName: profile.company_name,
        phoneNumber: profile.phone_number,
        usageCap: profile.usage_cap,
        usedMinutes: profile.used_minutes,
        permissions: profile.permissions,
        createdAt: profile.created_at,
        isActive: profile.is_active
      }))

      return { users, error: null }
    } catch (error) {
      console.error('Error fetching users:', error)
      return { users: [], error: 'An unexpected error occurred' }
    }
  }

  // Update user status (admin only)
  static async updateUserStatus(userId: string, isActive: boolean): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error updating user status:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Delete user (admin only)
  static async deleteUser(userId: string): Promise<{ error: string | null }> {
    try {
      // Delete from profiles first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        return { error: profileError.message }
      }

      // Then delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        return { error: authError.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Update user usage (called when user makes calls)
  static async updateUserUsage(userId: string, minutesUsed: number): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ used_minutes: minutesUsed })
        .eq('id', userId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error updating user usage:', error)
      return { error: 'An unexpected error occurred' }
    }
  }
}