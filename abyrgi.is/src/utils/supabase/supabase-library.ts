import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const supabaseClient = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  // Sign out the current user
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Fetch data from a specified table
  fetchData: async (table: string, schema?: string) => {
    let query = supabase.from(table).select('*')
    if (schema) {
      query = query.schema(schema)
    }
    const { data, error } = await query
    return { data, error }
  },

  // Create a new user
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  },

  // Get the current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  }
}