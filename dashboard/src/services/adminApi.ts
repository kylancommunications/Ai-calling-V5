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
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Skip email confirmation for admin-created users
        user_metadata: {
          client_name: userData.clientName,
          company_name: userData.companyName,
          phone_number: userData.phoneNumber,
          role: 'user'
        }
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      // Then create the user profile with permissions and usage cap
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          client_name: userData.clientName,
          company_name: userData.companyName,
          phone_number: userData.phoneNumber,
          usage_cap: userData.usageCap,
          used_minutes: 0,
          permissions: userData.permissions,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { user: null, error: profileError.message }
      }

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
        .from('user_profiles')
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
        .from('user_profiles')
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
      // Delete from user_profiles first
      const { error: profileError } = await supabase
        .from('user_profiles')
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
        .from('user_profiles')
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