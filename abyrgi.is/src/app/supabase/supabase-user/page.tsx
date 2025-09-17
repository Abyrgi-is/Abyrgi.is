import { createClient } from '@/utils/supabase/server' // Use absolute import

export default async function Page() {
  const supabase = await createClient()

  // Fetch user and surface any auth error
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const { data: users, error } = await supabase
    .schema('Abyrgi')
    .from('Users')
    .select('*')

  if (error) {
    console.error('Error fetching data:', error)
    return <div>Error loading data: {error.message}</div>
  }

  return (
    <div>
      <h1>Users Data</h1>
      <div style={{ marginBottom: 12 }}>
        <p>User: {user ? user.email ?? user.id : 'anon'}</p>
        {userError && (
          <p style={{ color: 'crimson' }}>Auth error: {userError.message}</p>
        )}
      </div>

      {!users || users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul>
          {users.map((userData, index) => (
            <li key={index}>{JSON.stringify(userData)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
