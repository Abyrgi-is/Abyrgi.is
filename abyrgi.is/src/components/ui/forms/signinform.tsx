'use client'

import { supabaseClient } from '@/utils/supabase/supabase-library'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam === 'confirm_email') {
      setConfirmationMessage('Please check your email and click the confirmation link to verify your account before signing in.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabaseClient.signIn(email.trim(), password)

      if (error) {
        setMessage(`❌ Sign-in failed: ${error.message}`)
      } else {
        setMessage('✅ Sign-in successful!')
        console.log('User data:', data)
        router.push('/minarsidur')
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    }

    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f4f4f9',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#ffffff',
        padding: 30,
        borderRadius: 8,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 20,
          color: '#333',
        }}>Sign In</h2>

        {confirmationMessage && (
          <div style={{
            marginBottom: 20,
            padding: 15,
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            borderRadius: 4,
            border: '1px solid #90caf9',
            textAlign: 'center',
            fontSize: 14,
            lineHeight: '1.4',
          }}>
            📧 {confirmationMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 'bold',
              color: '#555',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              placeholder="Enter your email"
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 'bold',
              color: '#555',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              placeholder="Enter your password"
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderRadius: 4,
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            textAlign: 'center',
          }}>
            {message}
          </div>
        )}

        <div style={{
          marginTop: 20,
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 14,
            color: '#666',
            margin: 0,
          }}>
            Don&apos;t have an account?{' '}
            <a 
              href="/sign_up" 
              style={{
                color: '#007bff',
                textDecoration: 'underline',
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}