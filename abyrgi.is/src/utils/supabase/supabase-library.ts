import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
const DEFAULT_SCHEMA = 'Abyrgi'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: DEFAULT_SCHEMA }
})

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
      query = supabase.schema(schema).from(table).select('*')
    }
    const { data, error } = await query
    return { data, error }
  },

  // Insert a row into a table
  insertRow: async <T extends Record<string, any>>(table: string, values: T, schema?: string) => {
    let query = supabase.from(table).insert(values).select('*').single()
    if (schema) {
      query = supabase.schema(schema).from(table).insert(values).select('*').single()
    }
    const { data, error } = await query
    return { data, error }
  },

  // Update rows in a table by filter
  updateRows: async <T extends Record<string, any>>(
    table: string,
    values: Partial<T>,
    filter: { column: string; value: any },
    schema?: string
  ) => {
    let query = supabase.from(table).update(values).eq(filter.column, filter.value).select('*')
    if (schema) {
      query = supabase.schema(schema).from(table).update(values).eq(filter.column, filter.value).select('*')
    }
    const { data, error } = await query
    return { data, error }
  },

  // Delete rows in a table by filter
  deleteRows: async (
    table: string,
    filter: { column: string; value: any },
    schema?: string
  ) => {
    let query = supabase.from(table).delete().eq(filter.column, filter.value)
    if (schema) {
      query = supabase.schema(schema).from(table).delete().eq(filter.column, filter.value)
    }
    const { data, error } = await query
    return { data, error }
  },

  // Get user by email from database (for manual authentication)
  getUserByEmail: async (email: string, schema?: string) => {
    let query = supabase.from('Users').select('*').eq('email', email).single()
    if (schema) {
      query = supabase.schema(schema).from('Users').select('*').eq('email', email).single()
    }
    const { data, error } = await query
    return { data, error }
  },

  /**
   * Get all cars belonging to a specific user.
   * @param userId - The user's id to filter by
   * @param schema - Optional Postgres schema name
   * @param options - Optional overrides
   * @param options.table - Table name (defaults to `Cars`)
   * @param options.userIdColumn - Column name for the user id foreign key (defaults to `user_id`)
   */
  getCarsByUser: async (
    userId: string,
    schema?: string,
    options?: { table?: string; userIdColumn?: string }
  ) => {
    const table = options?.table ?? 'Cars'
    const userIdColumn = options?.userIdColumn ?? 'user_id'
    let query = supabase.from(table).select('*').eq(userIdColumn, userId)
    if (schema) {
      query = supabase.schema(schema).from(table).select('*').eq(userIdColumn, userId)
    }
    const { data, error } = await query
    return { data, error }
  },

  // Create a new user
  signUp: async (email: string, password: string, options?: { emailRedirectTo?: string }) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: options || {}
    })
    return { data, error }
  },

  // Get the current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Add user to custom Users table (not Supabase Auth)
  addUserToUsersTable: async (
    user: { email: string; name?: string; phone?: string; [key: string]: any },
    schema?: string
  ) => {
    let query = supabase.from('Users').insert(user).select('*').single()
    if (schema) {
      query = supabase.schema(schema).from('Users').insert(user).select('*').single()
    }
    const { data, error } = await query
    return { data, error }
  }
}