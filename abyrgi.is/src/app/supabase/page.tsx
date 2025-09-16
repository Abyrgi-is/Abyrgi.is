import { createClient } from '../utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()

  console.log('Logging in as test user...')
  
  // Attempt to log in with predefined credentials
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'test@afd.is',
    password: '1234'
  })

  if (loginError) {
    console.error('Login error:', loginError)
    return (
      <div>
        <h1>Database Connection Test</h1>
        <p style={{ color: 'red' }}>Error logging in: {loginError.message}</p>
      </div>
    )
  }

  console.log('Login successful:', loginData)

  // Test without schema first
  const { data: carsNoSchema, error: errorNoSchema } = await supabase
    .from('Cars')
    .select('*')
    .limit(5)

  // Test with schema
  const { data: cars, error } = await supabase
    .schema('Abyrgi')
    .from('Cars')
    .select('*')
    .limit(5)

  return (
    <div>
      <h1>Database Connection Test</h1>
      
      <div style={{ marginBottom: 20 }}>
        <h2>Without Schema:</h2>
        {errorNoSchema ? (
          <p style={{ color: 'red' }}>Error: {errorNoSchema.message}</p>
        ) : (
          <p style={{ color: 'green' }}>✅ Connection successful! Found {carsNoSchema?.length || 0} cars</p>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2>With Abyrgi Schema:</h2>
        {error ? (
          <p style={{ color: 'red' }}>Error: {error.message}</p>
        ) : (
          <p style={{ color: 'green' }}>✅ Schema connection successful! Found {cars?.length || 0} cars</p>
        )}
      </div>

      {cars && cars.length > 0 && (
        <div>
          <h3>Sample Data:</h3>
          <pre>{JSON.stringify(cars[0], null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
