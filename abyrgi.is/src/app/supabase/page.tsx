import { createClient } from '../../../utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()

  // Fetch user and surface any auth error
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const { data: cars, error } = await supabase
    .schema('Abyrgi')
    .from('Cars')
    .select('*')

  if (error) {
    console.error('Error fetching data:', error)
    return <div>Error loading data: {error.message}</div>
  }

  return (
    <div>
      <h1>Cars Data</h1>

      <div style={{ marginBottom: 12 }}>
        <p>User: {user ? user.email ?? user.id : 'anon'}</p>
        {userError && (
          <p style={{ color: 'crimson' }}>Auth error: {userError.message}</p>
        )}
      </div>

      {!cars || cars.length === 0 ? (
        <p>No cars found</p>
      ) : (
        <ul>
          {cars.map((car, index) => (
            <li key={index}>{JSON.stringify(car)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
