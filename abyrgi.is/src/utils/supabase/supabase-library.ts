import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Ensure a single client in the browser (avoids multiple GoTrue instances in HMR)
declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined
}

const supabase = globalThis.__supabase__ ?? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
if (!globalThis.__supabase__) globalThis.__supabase__ = supabase

// Helper to sanitize a username base
const slugifyUsername = (s: string) =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w.-]+/g, '') // keep a-z0-9 _ . -
    .replace(/^[_\-.]+|[_\-.]+$/g, '') // trim edge symbols

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
  },

  // Ensure there is a profile row for the user (no username to avoid unique conflicts)
  ensureProfileBase: async (
    profile: { id: string; name: string; address?: string | null },
    schema = 'abyrgi'
  ) => {
    const row = {
      id: profile.id,
      name: profile.name?.trim() || 'New user',
      address: profile.address?.trim() || null,
      // do NOT set username here to avoid unique conflicts
    }
    const { data, error } = await supabase
      .schema(schema)
      .from('profiles')
      .upsert(row, { onConflict: 'id' })
      .select('*')
      .single()
    return { data, error }
  },

  // Try to set a unique username by retrying with suffixes if needed
  setProfileUsernameUnique: async (
    userId: string,
    desired: string,
    schema = 'abyrgi',
    maxAttempts = 5
  ) => {
    const base = slugifyUsername(desired) || 'user'
    for (let i = 0; i < maxAttempts; i++) {
      const suffix = i === 0 ? '' : String(Math.floor(1000 + Math.random() * 9000))
      const candidate = `${base}${suffix}`
      const { data, error } = await supabase
        .schema(schema)
        .from('profiles')
        .update({ username: candidate })
        .eq('id', userId)
        .select('id, username')
        .single()

      if (!error) return { data, error: null }
      // 23505 = unique violation; keep trying with a new suffix
      const code = (error as any)?.code
      const msg = (error as any)?.message || ''
      const isUsernameUniqueViolation =
        code === '23505' || /profiles_username_key/i.test(msg)
      if (!isUsernameUniqueViolation) return { data: null, error }
      // else continue and try another candidate
    }
    return {
      data: null,
      error: { message: 'Could not allocate a unique username after several attempts.' } as any,
    }
  },

  // Keep: Ensure/Upsert full profile (now deprecated for username collisions)
  ensureProfile: async (
    profile: { id: string; name: string; username?: string | null; address?: string | null },
    schema = 'abyrgi'
  ) => {
    const sanitized = {
      id: profile.id,
      name: profile.name?.trim() || 'New user',
      username: profile.username?.trim() || null,
      address: profile.address?.trim() || null,
    }
    const { data, error } = await supabase
      .schema(schema)
      .from('profiles')
      .upsert(sanitized, { onConflict: 'id' })
      .select('*')
      .single()
    return { data, error }
  },

  // Ensure a role exists (client-side read-only; seed via SQL/admin)
  ensureRole: async (role: string, schema = 'abyrgi') => {
    const { data, error } = await supabase
      .schema(schema)
      .from('roles')
      .select('id')
      .eq('role', role)
      .maybeSingle()
    if (error) return { id: null as string | null, error }
    if (!data) return { id: null, error: { code: 'role_missing', message: `Role "${role}" not found` } as any }
    return { id: data.id as string, error: null }
  },

  // Assign role to user (requires role to exist; user_roles RLS allows own insert)
  assignRoleToUser: async (userId: string, role: string, schema = 'abyrgi') => {
    const { id: roleId, error: roleErr } = await supabaseClient.ensureRole(role, schema)
    if (roleErr || !roleId) return { data: null, error: roleErr ?? { message: 'Failed to resolve role id' } }

    const { data, error } = await supabase
      .schema(schema)
      .from('user_roles')
      .upsert([{ user_id: userId, role_id: roleId }], { onConflict: 'user_id,role_id' })
      .select('*')
    return { data, error }
  },

  // Optional: block client seeding to avoid RLS errors; use SQL or server key instead
  seedDefaultRoles: async (_roles: string[], _schema = 'abyrgi') => {
    return { data: null, error: { message: 'Seed roles via SQL or a server function with service key.' } }
  },

  // Bootstrap after sign-in: ensure base profile, then set unique username and role
  bootstrapCurrentUser: async (options?: { schema?: string; defaultRole?: string }) => {
    const schema = options?.schema ?? 'abyrgi'
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return { data: null, error: userErr ?? { message: 'No user' } }

    const meta = (user.user_metadata || {}) as Record<string, any>
    const name = (meta.name as string) || 'New user'
    const usernameDesired = (meta.username as string) || (user.email?.split('@')[0] ?? '')

    const baseRes = await supabaseClient.ensureProfileBase({ id: user.id, name, address: meta.address ?? null }, schema)
    if (baseRes.error) return { data: null, error: baseRes.error }

    // Try to set a unique username (ok if this fails; you can prompt the user later)
    const setRes = await supabaseClient.setProfileUsernameUnique(user.id, usernameDesired, schema)
    if (setRes.error && (setRes.error as any)?.code !== '23505') {
      // return error only for non-unique issues
      return { data: null, error: setRes.error }
    }

    if (options?.defaultRole) {
      const { error: roleErr } = await supabaseClient.assignRoleToUser(user.id, options.defaultRole, schema)
      if (roleErr) return { data: null, error: roleErr }
    }

    const { data: profile, error: profReadErr } = await supabase
      .schema(schema)
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profReadErr) return { data: null, error: profReadErr }
    return { data: { user, profile }, error: null }
  },

  // Get user role(s) by user ID
  getUserRole: async (userId: string, schema = 'abyrgi') => {
    const { data, error } = await supabase
      .schema(schema)
      .from('user_roles')
      .select(`
        *,
        roles (
          id,
          role
        )
      `)
      .eq('user_id', userId)
    
    if (error) return { data: null, error }
    return { data, error: null }
  },

  // One-call user creation: sign up; if session exists, write base profile then set a unique username
  createUser: async (
    userData: {
      email: string
      password: string
      name: string
      username?: string
      address?: string
    },
    options?: {
      emailRedirectTo?: string
      schema?: string
      defaultRole?: string
    }
  ) => {
    const schema = options?.schema ?? 'abyrgi'
    const defaultRole = options?.defaultRole ?? 'user'
    const desiredUsername = slugifyUsername(userData.username || userData.email.split('@')[0])

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: options?.emailRedirectTo,
          data: { name: userData.name, username: desiredUsername, address: userData.address ?? null },
        },
      })
      if (authError) return { data: null, error: authError, step: 'auth' }
      if (!authData.user?.id) return { data: null, error: { message: 'User registration failed.' }, step: 'auth' }

      // If no session yet, stop here; profile/role will be done after confirmation/sign-in
      if (!authData.session) {
        return {
          data: { user: authData.user, profile: null, session: null, pendingEmailConfirmation: true },
          error: null,
          step: 'pending_confirmation',
        }
      }

      // Ensure base profile first (no username)
      const baseRes = await supabaseClient.ensureProfileBase(
        { id: authData.user.id, name: userData.name, address: userData.address ?? null },
        schema
      )
      if (baseRes.error) return { data: null, error: baseRes.error, step: 'profile' }

      // Now set a unique username with retries
      const setRes = await supabaseClient.setProfileUsernameUnique(authData.user.id, desiredUsername, schema)
      if (setRes.error) return { data: null, error: setRes.error, step: 'profile_username' }

      // Assign default role (defaults to 'user' if not specified)
      const { error: roleErr } = await supabaseClient.assignRoleToUser(authData.user.id, defaultRole, schema)
      if (roleErr) return { data: null, error: roleErr, step: 'role' }

      // Return profile
      const { data: profile, error: profReadErr } = await supabase
        .schema(schema)
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      if (profReadErr) return { data: null, error: profReadErr, step: 'profile_read' }

      return { data: { user: authData.user, profile, session: authData.session }, error: null, step: 'complete' }
    } catch {
      return { data: null, error: { message: 'Unexpected error.' }, step: 'unknown' }
    }
  },

  /**
   * Place a new order in abyrgi.orders
   * @param order - Order data (user_id, pickup_location_id, dropoff_location_id, staff_id?, notes?, status?)
   * @returns Inserted order row or error
   */
  placeOrder: async (
    order: {
      user_id: string;
      pickup_location_id: string;
      dropoff_location_id: string;
      car_id?: string | null;
      staff_id?: string | null;
      notes?: string | null;
      status?: string;
    }
  ) => {
    // Only allow certain fields to be inserted
    const row = {
      user_id: order.user_id,
      pickup_location_id: order.pickup_location_id,
      dropoff_location_id: order.dropoff_location_id,
      car_id: order.car_id ?? null,
      staff_id: order.staff_id ?? null,
      notes: order.notes ?? null,
      status: order.status ?? 'pending',
    }
    const { data, error } = await supabase
      .schema('abyrgi')
      .from('orders')
      .insert(row)
      .select('*')
      .single()
    return { data, error }
  },

  /**
   * Place a booking order with location coordinates and car info
   * @param booking - Booking data with pickup location, car_id, and optional dropoff
   * @returns Inserted booking row or error
   */
  placeBooking: async (
    booking: {
      user_id: string;
      car_id: string;
      pickup_location: string;
      pickup_latitude?: number | null;
      pickup_longitude?: number | null;
      dropoff_location?: string | null;
      dropoff_latitude?: number | null;
      dropoff_longitude?: number | null;
      status?: string;
      notes?: string | null;
    },
    schema = 'abyrgi'
  ) => {
    const row = {
      user_id: booking.user_id,
      car_id: booking.car_id,
      pickup_location: booking.pickup_location,
      pickup_latitude: booking.pickup_latitude ?? null,
      pickup_longitude: booking.pickup_longitude ?? null,
      dropoff_location: booking.dropoff_location ?? null,
      dropoff_latitude: booking.dropoff_latitude ?? null,
      dropoff_longitude: booking.dropoff_longitude ?? null,
      status: booking.status ?? 'pending',
      notes: booking.notes ?? null,
    }
    const { data, error } = await supabase
      .schema(schema)
      .from('bookings')
      .insert(row)
      .select('*')
      .single()
    return { data, error }
  },

  /**
   * Create a new location in the locations table
   * @param location - Location data with name, address, coordinates, and user_id
   * @returns Inserted location row or error
   */
  createLocation: async (
    location: {
      name?: string | null;
      address?: string | null;
      latitude: number;
      longitude: number;
      user_id: string;
    },
    schema = 'abyrgi'
  ) => {
    const row = {
      name: location.name ?? null,
      address: location.address ?? null,
      latitude: location.latitude,
      longitude: location.longitude,
      user_id: location.user_id,
    }
    const { data, error } = await supabase
      .schema(schema)
      .from('locations')
      .insert(row)
      .select('*')
      .single()
    return { data, error }
  },
}