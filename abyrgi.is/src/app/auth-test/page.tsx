// Create: src/app/auth-test/page.tsx
'use client'
import { createClient } from '../../utils/supabase/client'
import { useState, useEffect } from 'react'

export default function AuthTest() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const supabase = createClient()

  // Check current user on load - suppress initial error
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setError('') // Clear error if user exists
      }
      // Don't set error for "Auth session missing" - it's expected when not logged in
    }
    getUser()

    // Add debug info
    setDebugInfo(`
      URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}
      Key exists: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
      Current origin: ${window.location.origin}
      Redirect URL: ${window.location.origin}/auth/callback
    `)
  }, [])

  const signUp = async () => {
    setLoading(true)
    setError('')
    
    console.log('Attempting signup...')
    const { data, error } = await supabase.auth.signUp({
      email: 'aron.frosti.davidsson@gmail.com',
      password: 'testpassword123',
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback` // Dynamic redirect based on current origin
      }
    })
    
    setLoading(false)
    console.log('Signup response:', { data, error })
    
    if (error) {
      setError(`Signup Error: ${error.message}`)
      console.error('Signup error details:', error)
    } else {
      console.log('Signup success:', data)
      if (data.user && data.user.email_confirmed_at) {
        setUser(data.user)
        setError('')
        alert(`Signup successful! User: ${data.user.email}`)
      } else {
        setError('✅ Signup successful! Check your email for confirmation link.')
      }
    }
  }

  const signIn = async () => {
    setLoading(true)
    setError('')
    
    console.log('Attempting signin...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'aron.frosti.davidsson@gmail.com',
      password: 'testpassword123'
    })
    
    setLoading(false)
    console.log('Signin response:', { data, error })
    
    if (error) {
      setError(`Signin Error: ${error.message}`)
      console.error('Signin error details:', error)
    } else {
      console.log('Signin success:', data)
      if (data.user) {
        setUser(data.user)
        setError('') // Clear any previous errors
        alert(`Signin successful! User: ${data.user.email}`)
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setError('')
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      })
      
      console.log('Connection test response:', response.status, response.statusText)
      
      if (response.ok) {
        setError('✅ Supabase connection successful!')
      } else {
        const errorText = await response.text()
        setError(`❌ Connection failed: ${response.status} ${response.statusText} - ${errorText}`)
      }
    } catch (err) {
      console.error('Connection error:', err)
      setError(`❌ Connection error: ${err.message}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Auth Test</h1>
      
      <div style={{ marginBottom: 20, padding: 10, backgroundColor: '#f5f5f5' }}>
        <h4>Debug Info:</h4>
        <pre style={{ fontSize: 12 }}>{debugInfo}</pre>
        <button onClick={testConnection} disabled={loading}>
          Test Supabase Connection
        </button>
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <h3>Current User:</h3>
        {user ? (
          <div>
            <p>✅ Logged in as: {user.email}</p>
            <p>User ID: {user.id}</p>
            <p>Email confirmed: {user.email_confirmed_at ? 'Yes' : 'No'}</p>
            <button onClick={signOut}>Sign Out</button>
          </div>
        ) : (
          <p>❌ Not logged in</p>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <button onClick={signUp} disabled={loading}>
          {loading ? 'Loading...' : 'Test Sign Up'}
        </button>
        <button onClick={signIn} disabled={loading} style={{ marginLeft: 10 }}>
          {loading ? 'Loading...' : 'Test Sign In'}
        </button>
      </div>

      {error && (
        <div style={{ 
          color: error.includes('✅') ? 'green' : 'red', 
          marginTop: 10,
          padding: 10,
          border: '1px solid',
          borderRadius: 4
        }}>
          <h4>{error.includes('✅') ? 'Success:' : 'Status:'}</h4>
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}