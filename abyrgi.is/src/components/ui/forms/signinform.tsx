'use client'

import { supabaseClient } from '@/utils/supabase/supabase-library'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SignInFormContent() {
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
        const redirectTo = searchParams.get('redirect') || '/minarsidur'
        router.push(redirectTo)
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    }

    setLoading(false)
  }

  return (
    <>
      <style jsx>{`
        .page-wrapper {
          background: #F7F8FA;
        }
        .form-card {
          background: white;
          color: #15121A;
        }
        .form-title {
          color: #15121A;
        }
        .confirmation-box {
          background: #dbeafe;
          color: #1e40af;
          border-color: #bfdbfe;
        }
        .form-label {
          color: #15121A;
        }
        .form-input {
          border-color: #d1d5db;
          background: white;
          color: #15121A;
        }
        .form-input:focus {
          border-color: #3b82f6;
        }
        .submit-button {
          background: #2563eb;
          color: white;
        }
        .submit-button:hover:not(:disabled) {
          background: #1d4ed8;
        }
        .submit-button:disabled {
          background: #9ca3af;
        }
        .success-message {
          background: #d1fae5;
          color: #065f46;
          border-color: #6ee7b7;
        }
        .error-message {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fca5a5;
        }
        .footer-text {
          color: #6b7280;
        }
        .footer-link {
          color: #2563eb;
        }
        .footer-link:hover {
          color: #1d4ed8;
        }

        @media (prefers-color-scheme: dark) {
          .page-wrapper {
            background: #15121A;
          }
          .form-card {
            background: #1e293b;
            color: #F7F8FA;
          }
          .form-title {
            color: #F7F8FA;
          }
          .confirmation-box {
            background: rgba(30, 58, 138, 0.3);
            color: #93c5fd;
            border-color: #1e40af;
          }
          .form-label {
            color: #F7F8FA;
          }
          .form-input {
            border-color: #4b5563;
            background: #374151;
            color: #F7F8FA;
          }
          .form-input:focus {
            border-color: #3b82f6;
          }
          .submit-button:disabled {
            background: #4b5563;
          }
          .success-message {
            background: rgba(5, 150, 105, 0.3);
            color: #6ee7b7;
            border-color: #059669;
          }
          .error-message {
            background: rgba(153, 27, 27, 0.3);
            color: #fca5a5;
            border-color: #991b1b;
          }
          .footer-text {
            color: #9ca3af;
          }
          .footer-link {
            color: #60a5fa;
          }
          .footer-link:hover {
            color: #93c5fd;
          }
        }
      `}</style>
      
      <div className="page-wrapper flex justify-center items-center min-h-screen font-sans">
        <div className="form-card w-full max-w-md p-8 rounded-lg shadow-md">
          <h2 className="form-title text-center text-2xl font-semibold mb-6">
            Sign In
          </h2>

          {confirmationMessage && (
            <div className="confirmation-box mb-5 p-4 rounded border text-center text-sm leading-relaxed">
              📧 {confirmationMessage}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="form-label block mb-2 font-semibold">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input w-full px-3 py-2 border rounded outline-none transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-5">
              <label className="form-label block mb-2 font-semibold">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input w-full px-3 py-2 border rounded outline-none transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-button w-full py-3 font-semibold rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {message && (
            <div className={`mt-5 p-4 rounded border text-center ${
              message.includes('✅') ? 'success-message' : 'error-message'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-5 text-center">
            <p className="footer-text text-sm m-0">
              Don&apos;t have an account?{' '}
              <a href="/sign_up" className="footer-link underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function SignInForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInFormContent />
    </Suspense>
  )
}