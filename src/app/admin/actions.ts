'use server'

import { createClient } from '@supabase/supabase-js'
import { DEFAULT_DESIGNATIONS } from '@/lib/designations-constants'

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

export async function getDesignationsAction(): Promise<{ success: boolean; data: string[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('designations')
      .select('name')
      .order('created_at', { ascending: true })

    if (error) {
      // If table doesn't exist in Supabase yet, gracefully return defaults
      return { success: true, data: [...DEFAULT_DESIGNATIONS] }
    }

    if (!data || data.length === 0) {
      // Seed default designations if empty
      for (const name of DEFAULT_DESIGNATIONS) {
        await supabaseAdmin.from('designations').upsert({ name }, { onConflict: 'name' })
      }
      return { success: true, data: [...DEFAULT_DESIGNATIONS] }
    }

    // Return unique designations maintaining order
    const names = Array.from(new Set(data.map(d => d.name)))
    return { success: true, data: names }
  } catch (err: any) {
    return { success: true, data: [...DEFAULT_DESIGNATIONS] }
  }
}

export async function addDesignationAction(name: string): Promise<{ success: boolean; data?: string; error?: string }> {
  const trimmed = name.trim()
  if (!trimmed) {
    return { success: false, error: 'Designation name cannot be empty.' }
  }

  try {
    const { error } = await supabaseAdmin
      .from('designations')
      .insert({ name: trimmed })

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique')) {
        return { success: false, error: `Designation "${trimmed}" already exists.` }
      }
      return { success: false, error: error.message }
    }

    return { success: true, data: trimmed }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add designation.' }
  }
}

export async function deleteDesignationAction(name: string): Promise<{ success: boolean; error?: string }> {
  const trimmed = name.trim()
  try {
    const { error } = await supabaseAdmin
      .from('designations')
      .delete()
      .eq('name', trimmed)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete designation.' }
  }
}
