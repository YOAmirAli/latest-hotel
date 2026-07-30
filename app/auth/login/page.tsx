"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem('token', data.token)
        document.cookie = `token=${data.token}; path=/; max-age=604800`

        const payload = JSON.parse(atob(data.token.split('.')[1]))
        if (redirect) {
          router.push(redirect)
        } else if (payload.role === 'admin') {
          router.push('/admin')
        } else if (payload.role === 'hotel_manager') {
          router.push('/manager')
        } else if (payload.role === 'staff') {
          router.push('/staff/dashboard')
        } else {
          router.push('/')
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="text-center">
          <Link href="/" className="font-display-lg text-4xl text-primary block">LuxeStay</Link>
          <h2 className="mt-6 font-headline-sm text-2xl text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account to complete your booking</p>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50"
                placeholder="admin@luxestay.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href={redirect ? `/auth/register?redirect=${encodeURIComponent(redirect)}` : "/auth/register"} className="text-emerald-600 hover:underline font-medium">
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  )
}