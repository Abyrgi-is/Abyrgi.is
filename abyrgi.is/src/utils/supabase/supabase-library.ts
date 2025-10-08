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

const isCarsTable = (table: string) => table?.toLowerCase() === 'cars'

const CAR_SELECT_COLUMNS = `
  car_id,
  user_id,
  created_at,
  car_vin,
  color,
  manual,
  plate,
  car_model_id,
  car_models (
    make,
    model,
    model_year
  )
`

type CarModelNormalized = {
  make: string
  model: string
  modelYear: number
}

const sanitizeCarText = (value: unknown) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  return String(value).trim()
}

const extractCarModelInput = (values: Record<string, any>) => {
  const make = values.car_make ?? values.make
  const model = values.car_model ?? values.model
  const year = values.car_model_year ?? values.model_year ?? values.year
  return { make, model, year }
}

const ensureCarModelRecord = async (
  input: { make: unknown; model: unknown; year: unknown },
  schema: string
): Promise<{ carModelId: string | null; error: any; normalized?: CarModelNormalized }> => {
  const make = sanitizeCarText(input.make)
  const model = sanitizeCarText(input.model)
  const rawYear = input.year
  const yearValueString = sanitizeCarText(rawYear)

  const yearNumber =
    typeof rawYear === 'number'
      ? rawYear
      : Number(yearValueString)

  if (!make) return { carModelId: null, error: { message: 'Car make is required.' } }
  if (!model) return { carModelId: null, error: { message: 'Car model is required.' } }
  if (!yearValueString) return { carModelId: null, error: { message: 'Car model year is required.' } }
  if (!Number.isFinite(yearNumber)) return { carModelId: null, error: { message: 'Car model year must be a number.' } }

  const normalized: CarModelNormalized = {
    make,
    model,
    modelYear: yearNumber,
  }

  const fromCarModels = () =>
    (schema ? supabase.schema(schema) : supabase)
      .from('car_models')

  const { data: existing, error: fetchError } = await fromCarModels()
    .select('car_model_id')
    .eq('make', make)
    .eq('model', model)
    .eq('model_year', yearNumber)
    .maybeSingle()

  if (fetchError) return { carModelId: null, error: fetchError }
  if (existing?.car_model_id) {
    return { carModelId: existing.car_model_id as string, error: null, normalized }
  }

  const { data: inserted, error: insertError } = await fromCarModels()
    .insert({ make, model, model_year: yearNumber })
    .select('car_model_id')
    .single()

  if (insertError) return { carModelId: null, error: insertError }

  return { carModelId: inserted?.car_model_id as string, error: null, normalized }
}

const normalizeCarRow = (row: Record<string, any>) => {
  if (!row) return row
  const { car_models: carModels, ...rest } = row
  const make = rest.car_make ?? rest.make ?? carModels?.make ?? null
  const model = rest.car_model ?? rest.model ?? carModels?.model ?? null
  const modelYear =
    rest.car_model_year ??
    rest.model_year ??
    rest.year ??
    (typeof carModels?.model_year === 'number' || typeof carModels?.model_year === 'string'
      ? Number(carModels?.model_year)
      : carModels?.model_year ?? null)

  return {
    ...rest,
    car_make: make,
    car_model: model,
    car_model_year: modelYear,
    make,
    model,
    model_year: modelYear,
  }
}

const hydrateCarsByIds = async (ids: string[], schema: string | undefined, table: string) => {
  const tableQuery = schema ? supabase.schema(schema).from(table) : supabase.from(table)
  const { data, error } = await tableQuery.select(CAR_SELECT_COLUMNS).in('car_id', ids)
  if (error) return { data: null as any, error }
  return { data: (data || []).map(normalizeCarRow), error: null }
}

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
  const isCars = isCarsTable(table)
  const carSchema = schema ?? 'abyrgi'

    let payload: Record<string, any> = { ...values }
    let ensuredModel: CarModelNormalized | undefined

    if (isCars) {
      const {
        car_make,
        car_model,
        car_model_year,
        make,
        model,
        model_year,
        year,
        car_model_id,
        ...rest
      } = values as Record<string, any>

      if (!car_model_id) {
        const modelInput = extractCarModelInput(values as Record<string, any>)
        const { carModelId, error, normalized } = await ensureCarModelRecord(
          {
            make: modelInput.make,
            model: modelInput.model,
            year: modelInput.year,
          },
          carSchema
        )

        if (error || !carModelId) {
          return { data: null, error }
        }

        ensuredModel = normalized
        payload = { ...rest, car_model_id: carModelId }
      } else {
        payload = { ...rest, car_model_id }
      }
    }

    const tableQuery = () => (schema ? supabase.schema(schema).from(table) : supabase.from(table))
    const { data, error } = await tableQuery().insert(payload).select('*').single()
    if (error || !data) return { data, error }

    if (isCars) {
      const { data: hydrated, error: hydrationError } = await hydrateCarsByIds(
        [data.car_id as string],
        carSchema,
        table
      )

      if (!hydrationError && hydrated?.length) {
        return { data: hydrated[0], error: null }
      }

      const fallback = normalizeCarRow({
        ...data,
        car_models: ensuredModel
          ? { make: ensuredModel.make, model: ensuredModel.model, model_year: ensuredModel.modelYear }
          : undefined,
      })
      return { data: fallback, error: null }
    }

    return { data, error: null }
  },

  // Update rows in a table by filter
  updateRows: async <T extends Record<string, any>>(
    table: string,
    values: Partial<T>,
    filter: { column: string; value: any },
    schema?: string
  ) => {
    if (!isCarsTable(table)) {
      let query = supabase.from(table).update(values).eq(filter.column, filter.value).select('*')
      if (schema) {
        query = supabase.schema(schema).from(table).update(values).eq(filter.column, filter.value).select('*')
      }
      const { data, error } = await query
      return { data, error }
    }

    const carSchema = schema ?? 'abyrgi'
    const {
      car_make,
      car_model,
      car_model_year,
      make,
      model,
      model_year,
      year,
      car_model_id,
      ...rest
    } = values as Record<string, any>

    const payload: Record<string, any> = { ...rest }
    let ensuredModel: CarModelNormalized | undefined

    const hasAnyModelField =
      car_model_id !== undefined ||
      car_make !== undefined ||
      car_model !== undefined ||
      car_model_year !== undefined ||
      make !== undefined ||
      model !== undefined ||
      model_year !== undefined ||
      year !== undefined

    if (hasAnyModelField) {
      if (car_model_id) {
        payload.car_model_id = car_model_id
      } else {
        const modelInput = extractCarModelInput(values as Record<string, any>)
        const { carModelId, error, normalized } = await ensureCarModelRecord(
          {
            make: modelInput.make,
            model: modelInput.model,
            year: modelInput.year,
          },
          carSchema
        )

        if (error || !carModelId) {
          return { data: null, error }
        }

        ensuredModel = normalized
        payload.car_model_id = carModelId
      }
    }

    const tableQuery = () => (schema ? supabase.schema(schema).from(table) : supabase.from(table))
    const { data: updated, error } = await tableQuery()
      .update(payload)
      .eq(filter.column, filter.value)
      .select('*')

    if (error || !updated) return { data: updated, error }

    const rowsArray = Array.isArray(updated) ? updated : [updated]
    if (rowsArray.length === 0) return { data: updated, error: null }

    const ids = rowsArray
      .map((row) => row?.car_id)
      .filter((id): id is string => typeof id === 'string' && !!id)

    if (!ids.length) {
      const normalizedRows = rowsArray.map((row) =>
        normalizeCarRow({
          ...row,
          car_models: ensuredModel
            ? { make: ensuredModel.make, model: ensuredModel.model, model_year: ensuredModel.modelYear }
            : undefined,
        })
      )
      return { data: Array.isArray(updated) ? normalizedRows : normalizedRows[0], error: null }
    }

    const { data: hydrated, error: hydrationError } = await hydrateCarsByIds(ids, carSchema, table)
    if (!hydrationError && hydrated) {
      const castHydrated = hydrated as Array<Record<string, any>>
      const mapped = ids
        .map((id) => castHydrated.find((row) => row.car_id === id))
        .filter(Boolean)
      return {
        data: Array.isArray(updated) ? mapped : mapped[0] ?? null,
        error: null,
      }
    }

    const fallback = rowsArray.map((row) =>
      normalizeCarRow({
        ...row,
        car_models: ensuredModel
          ? { make: ensuredModel.make, model: ensuredModel.model, model_year: ensuredModel.modelYear }
          : undefined,
      })
    )
    return { data: Array.isArray(updated) ? fallback : fallback[0], error: null }
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
    
    // Provide more helpful error messages for foreign key constraint violations
    if (error) {
      const errorCode = (error as any)?.code
      const errorMsg = (error as any)?.message || ''
      
      // Check for foreign key constraint violation (PostgreSQL error code 23503)
      if (errorCode === '23503' || /foreign key constraint/i.test(errorMsg)) {
        if (isCarsTable(table) && /orders_car_id_fkey/i.test(errorMsg)) {
          return {
            data: null,
            error: {
              ...error,
              message: 'Cannot delete car because it is referenced by existing orders. Use deleteCar() instead to automatically clear order references.',
              code: errorCode,
              hint: 'This car is being used in one or more orders. Use supabaseClient.deleteCar() to delete the car and automatically clear its references.'
            }
          }
        }
        
        // Generic foreign key constraint message
        return {
          data: null,
          error: {
            ...error,
            message: `Cannot delete ${table} record because it is referenced by other records. Please remove those references first.`,
            code: errorCode,
          }
        }
      }
    }
    
    return { data, error }
  },

  /**
   * Delete a car and automatically clear its references from orders
   * @param carId - The car_id to delete
   * @param schema - Optional schema name (defaults to 'abyrgi')
   * @returns Deletion result with metadata about cleared orders
   */
  deleteCar: async (
    carId: string,
    schema = 'abyrgi'
  ) => {
    // First, update all orders that reference this car to set car_id to null
    const { data: clearedOrders, error: updateError } = await supabase
      .schema(schema)
      .from('orders')
      .update({ car_id: null })
      .eq('car_id', carId)
      .select('order_id')

    if (updateError) {
      return {
        data: null,
        error: updateError,
        step: 'clear_orders',
        message: 'Failed to clear car references from orders'
      }
    }

    // Now delete the car
    const { data: deletedCar, error: deleteError } = await supabase
      .schema(schema)
      .from('cars')
      .delete()
      .eq('car_id', carId)
      .select('*')

    if (deleteError) {
      return {
        data: null,
        error: deleteError,
        step: 'delete_car',
        message: 'Failed to delete car after clearing references'
      }
    }

    return {
      data: deletedCar,
      error: null,
      step: 'complete',
      clearedOrdersCount: clearedOrders?.length || 0,
      clearedOrders: clearedOrders || []
    }
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
    const tableQuery = schema ? supabase.schema(schema).from(table) : supabase.from(table)
    const selectColumns = isCarsTable(table) ? CAR_SELECT_COLUMNS : '*'
    const { data, error } = await tableQuery.select(selectColumns).eq(userIdColumn, userId)
    if (error) return { data: null, error }
    if (!isCarsTable(table)) return { data, error: null }
    return { data: (data || []).map((row: Record<string, any>) => normalizeCarRow(row)), error: null }
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
   * Get order(s) with related data (user, staff, locations, car details)
   * @param filter - Filter criteria (e.g., { column: 'order_id', value: 'uuid' } or { column: 'user_id', value: 'uuid' })
   * @param schema - Optional schema name (defaults to 'abyrgi')
   * @param options - Optional configuration
   * @param options.single - Whether to return single order or array (defaults to false for array)
   * @returns Order(s) with joined data or error
   */
  getOrder: async (
    filter: { column: string; value: any },
    schema = 'abyrgi',
    options?: { single?: boolean }
  ) => {
    const orderSelect = `
      order_id,
      created_at,
      user_id,
      staff_id,
      pickup_location_id,
      dropoff_location_id,
      status,
      notes,
      car_id,
      user_profile:profiles!orders_user_id_fkey (
        id,
        name,
        username,
        address
      ),
      staff_profile:profiles!orders_staff_id_fkey (
        id,
        name,
        username,
        address
      ),
      pickup_location:locations!orders_pickup_location_id_fkey (
        location_id,
        name,
        address,
        latitude,
        longitude
      ),
      dropoff_location:locations!orders_dropoff_location_id_fkey (
        location_id,
        name,
        address,
        latitude,
        longitude
      ),
      car:cars!orders_car_id_fkey (
        ${CAR_SELECT_COLUMNS}
      )
    `

    const query = supabase
      .schema(schema)
      .from('orders')
      .select(orderSelect)
      .eq(filter.column, filter.value)

    if (options?.single) {
      const { data, error } = await query.single()
      if (error) return { data: null, error }
      
      // Normalize car data if present
      const normalizedOrder = data ? {
        ...data,
        car: (data as any).car ? normalizeCarRow((data as any).car as any) : data.car
      } : data
      
      return { data: normalizedOrder, error: null }
    } else {
      const { data, error } = await query
      if (error) return { data: null, error }
      
      // Normalize car data for each order if present
      const normalizedData = (data || []).map((order: any) => ({
        ...order,
        car: order.car ? normalizeCarRow(order.car) : order.car
      }))
      
      return { data: normalizedData, error: null }
    }
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

  /**
   * Place a new review in abyrgi.reviews
   * @param review - Review data (rating, user_id, order_id, review_text?)
   * @returns Inserted review row or error
   */
  placeReview: async (
    review: {
      rating: number;
      user_id: string;
      order_id: string;
      review_text?: string | null;
    },
    schema = 'abyrgi'
  ) => {
    // Validate rating is within expected range
    if (review.rating < 1 || review.rating > 5) {
      return { data: null, error: { message: 'Rating must be between 1 and 5' } }
    }

    const row = {
      rating: review.rating,
      user_id: review.user_id,
      order_id: review.order_id,
      review_text: review.review_text ?? null,
    }
    const { data, error } = await supabase
      .schema(schema)
      .from('reviews')
      .insert(row)
      .select('*')
      .single()
    return { data, error }
  },

  /**
   * Get review(s) with related data (user profile, order details)
   * @param filter - Filter criteria (e.g., { column: 'id', value: 'uuid' } or { column: 'user_id', value: 'uuid' })
   * @param schema - Optional schema name (defaults to 'abyrgi')
   * @param options - Optional configuration
   * @param options.single - Whether to return single review or array (defaults to false for array)
   * @returns Review(s) with joined data or error
   */
  getReviews: async (
    filter: { column: string; value: any },
    schema = 'abyrgi',
    options?: { single?: boolean }
  ) => {
    const reviewSelect = `
      id,
      created_at,
      rating,
      user_id,
      order_id,
      review_text,
      user_profile:profiles!reviews_user_id_fkey (
        id,
        name,
        username,
        address
      ),
      order:orders!reviews_order_id_fkey (
        order_id,
        created_at,
        status,
        notes,
        user_profile:profiles!orders_user_id_fkey (
          id,
          name,
          username
        ),
        staff_profile:profiles!orders_staff_id_fkey (
          id,
          name,
          username
        ),
        pickup_location:locations!orders_pickup_location_id_fkey (
          location_id,
          name,
          address,
          latitude,
          longitude
        ),
        dropoff_location:locations!orders_dropoff_location_id_fkey (
          location_id,
          name,
          address,
          latitude,
          longitude
        ),
        car:cars!orders_car_id_fkey (
          ${CAR_SELECT_COLUMNS}
        )
      )
    `

    const query = supabase
      .schema(schema)
      .from('reviews')
      .select(reviewSelect)
      .eq(filter.column, filter.value)

    if (options?.single) {
      const { data, error } = await query.single()
      if (error) return { data: null, error }
      
      // Normalize car data in the order if present
      if (data?.order && (data.order as any)?.car) {
        (data.order as any).car = normalizeCarRow((data.order as any).car)
      }
      
      return { data, error: null }
    } else {
      const { data, error } = await query
      if (error) return { data: null, error }
      
      // Normalize car data for each review's order if present
      const normalizedData = (data || []).map((review: any) => ({
        ...review,
        order: review.order && review.order.car 
          ? { ...review.order, car: normalizeCarRow(review.order.car) }
          : review.order
      }))
      
      return { data: normalizedData, error: null }
    }
  },
}