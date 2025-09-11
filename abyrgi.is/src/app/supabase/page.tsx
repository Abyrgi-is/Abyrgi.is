import { createClient } from '../../../utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()

  const { data: cars, error } = await supabase.schema('Abyrgi').from('Cars').select('*')

  if (error) {
    console.error('Error fetching data:', error)
    return <div>Error loading data: {error.message}</div>
  }

  return (
    <div>
      <h1>Cars Data</h1>
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
