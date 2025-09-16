'use client'
import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'

export default function LoginTest() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('aron.frosti.davidsson@gmail.com')
  const [password, setPassword] = useState('testpassword123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  // Check current user on load
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setMessage(`Already logged in as: ${user.email}`)
      }
    }
    getUser()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    console.log('Attempting login with:', { email, password: '***' })
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })
    
    setLoading(false)
    console.log('Login response:', { data, error })
    
    if (error) {
      setError(error.message)
      console.error('Login error:', error)
    } else {
      console.log('Login success:', data)
      setUser(data.user)
      setMessage(`✅ Successfully logged in as: ${data.user.email}`)
      // Clear form
      setPassword('')
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      setError(error.message)
    } else {
      setUser(null)
      setMessage('Successfully signed out')
      setError('')
    }
    setLoading(false)
  }

  const createTestUser = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    
    console.log('Creating test user...')
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    setLoading(false)
    
    if (error) {
      setError(error.message)
      console.error('Signup error:', error)
    } else {
      console.log('Signup success:', data)
      if (data.user && data.user.email_confirmed_at) {
        setUser(data.user)
        setMessage('✅ Test user created and logged in!')
      } else {
        setMessage('✅ Test user created! Check email for confirmation or try logging in.')
      }
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: '0 auto' }}>
      <h1>Login Test Form</h1>
      
      {/* Current User Status */}
      <div style={{ 
        marginBottom: 20, 
        padding: 15, 
        backgroundColor: user ? '#e8f5e8' : '#f5f5f5',
        borderRadius: 8,
        border: `2px solid ${user ? '#4CAF50' : '#ddd'}`
      }}>
        <h3>Current Status:</h3>
        {user ? (
          <div>
            <p>✅ <strong>Logged in as:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email confirmed:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
            <p><strong>Last sign in:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</p>
            <button 
              onClick={handleSignOut} 
              disabled={loading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#f44336', 
                color: 'white', 
                border: 'none', 
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <p>❌ Not logged in</p>
        )}
      </div>

      {/* Login Form */}
      {!user && (
        <form onSubmit={handleLogin} style={{ marginBottom: 20 }}>
          <h3>Login Form</h3>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 16
              }}
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 16
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: 'pointer',
              marginBottom: 10
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={createTestUser}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Test User'}
          </button>
        </form>
      )}

      {/* Quick Test Users */}
      <div style={{ marginBottom: 20, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
        <h4>Quick Test Users:</h4>
        <button
          onClick={() => {
            setEmail('aron.frosti.davidsson@gmail.com')
            setPassword('testpassword123')
          }}
          style={{ margin: '5px', padding: '5px 10px', borderRadius: 4 }}
        >
          Load Aron's Credentials
        </button>
        <button
          onClick={() => {
            setEmail('test@example.com')
            setPassword('testpassword123')
          }}
          style={{ margin: '5px', padding: '5px 10px', borderRadius: 4 }}
        >
          Load Test User
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div style={{ 
          padding: 15, 
          backgroundColor: '#e8f5e8', 
          color: '#2e7d32', 
          borderRadius: 8,
          marginBottom: 10,
          border: '1px solid #4CAF50'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ 
          padding: 15, 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: 8,
          border: '1px solid #f44336'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Debug Info */}
      <details style={{ marginTop: 20, fontSize: 12, color: '#666' }}>
        <summary>Debug Information</summary>
        <pre style={{ marginTop: 10, padding: 10, backgroundColor: '#f5f5f5' }}>
{`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}
Anon Key exists: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
Current Origin: ${typeof window !== 'undefined' ? window.location.origin : 'N/A'}`}
        </pre>
      </details>
    </div>
  )
}