'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [form, setForm] = useState({ farmName: '', location: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmName: form.farmName,
        location: form.location,
        email: form.email,
        password: form.password,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setShowPopup(true)
    } else {
      setError(data.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-charcoal text-center mb-1">Register Farm Account</h1>
        <p className="text-charcoal text-center mb-6">AquaLeaf</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="farmName" className="block text-charcoal">Farm Name</label>
            <input
              id="farmName"
              type="text"
              value={form.farmName}
              onChange={e => setForm({ ...form, farmName: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-charcoal">Location</label>
            <input
              id="location"
              type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-charcoal">Manager Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-charcoal">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          {error && <p className="text-charcoal text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
          >
            Register
          </button>
        </form>
      </div>

      {/* Popup Overlay */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Registration Successful</h2>
            <p className="text-charcoal mb-6">Check your email for a verification link before logging in.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-200 text-charcoal rounded-md hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
