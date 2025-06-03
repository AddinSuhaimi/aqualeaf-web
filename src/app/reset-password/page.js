'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const router = useRouter()

  // Remove TypeScript‐style generics: just call useState('idle')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')    // <-- corrected
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setError('No token provided.')
    }
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setError(data.message || 'Failed to reset password.')
      } else {
        setStatus('success')
        setMessage(data.message || 'Password reset successful!')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setError('Something went wrong. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Reset Password</h1>

        {status === 'success' ? (
          <>
            <p className="text-green-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md"
            >
              Go to Login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600">{error}</p>}

            <div>
              <label htmlFor="newPassword" className="block text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className={`w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition ${
                status === 'submitting' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {status === 'submitting' ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
