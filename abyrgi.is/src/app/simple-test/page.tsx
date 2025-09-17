import { supabaseClient } from '../../../utils/supabaseClient'

export default async function SimpleTestPage() {
  // Log in the user
  const { data: loginData, error: loginError } = await supabaseClient.signIn('test@afd.is', '1234')

  if (loginError) {
    return (
      <div>
        <h1>Login Test</h1>
        <p style={{ color: 'red' }}>Error logging in: {loginError.message}</p>
      </div>
    )
  }

  // Fetch data from the Cars table
  const { data: cars, error: fetchError } = await supabaseClient.fetchData('Cars')

  return (
    <div>
      <h1>Login Test</h1>
      {fetchError ? (
        <p style={{ color: 'red' }}>Error fetching cars: {fetchError.message}</p>
      ) : (
        <div>
          <h2>Fetched Cars:</h2>
          <pre>{JSON.stringify(cars, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}