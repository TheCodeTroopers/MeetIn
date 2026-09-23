'use server'

import { createClient } from '@supabase/supabase-js'

// We create an admin client using the service role key to bypass RLS and create auth users directly
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function createFacultyAuthUser(email: string, fullName: string) {
  try {
    // Attempt to create a user in auth.users
    // They will receive an email to set up their password, or they can log in via magic link
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'faculty'
      }
    })

    if (error) {
      // If the user already exists, Supabase throws an error
      if (error.message.includes('already exists') || error.message.includes('already registered')) {
         // If they already exist, we need to fetch their ID
         const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers()
         if (fetchError) throw fetchError

         const existingUser = users.users.find(u => u.email === email)
         if (existingUser) {
           return { success: true, userId: existingUser.id }
         }
      }
      throw error
    }

    return { success: true, userId: data.user.id }
  } catch (err: any) {
    console.error('Failed to create auth user:', err)
    return { success: false, error: err.message }
  }
}
