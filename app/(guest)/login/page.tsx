"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('elitrekker@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: '/images/beach_seaplane.jpg',
      badgeTitle: 'Travel the World, Your Way!',
      badgeDesc: 'Explore destinations at your pace, with personalized journeys & unforgettable experiences.',
      headline: 'Explore the World, Beyond Boundaries!',
      cta: 'Start your adventure today!'
    },
    {
      image: '/images/luxury_resort.jpg',
      badgeTitle: 'Unmatched Luxury & Comfort',
      badgeDesc: 'Relax in world-class resorts with stunning infinity views and premium hospitality.',
      headline: 'Indulge in Extraordinary Stays',
      cta: 'Book your dream escape!'
    }
  ]

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
      console.log('Login response:', data)

      if (data.success && data.token) {
        localStorage.setItem('token', data.token)
        document.cookie = `token=${data.token}; path=/; max-age=604800`

        const payload = JSON.parse(atob(data.token.split('.')[1]))

        if (payload.role === 'admin') {
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
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="min-h-screen w-full bg-[#07454d] flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-hidden font-sans">
      {/* Background ambient wavy shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
          <path d="M-100 400C300 200 600 700 1100 300C1600 -100 1800 500 2000 300" stroke="white" strokeWidth="2" />
          <path d="M-100 600C400 300 700 800 1200 400C1700 0 1900 600 2100 400" stroke="white" strokeWidth="1.5" />
          <path d="M-100 200C200 500 500 100 1000 500C1500 900 1700 200 1900 600" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-[1140px] bg-white rounded-[28px] md:rounded-[36px] shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Form Section */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between px-2 sm:px-4 md:px-6 py-2">
            <div>
              {/* Brand Header */}
              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="group">
                  <span className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-tight block font-normal">
                    Travel Voyanix
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 font-sans tracking-[0.2em] uppercase block -mt-1 font-medium">
                    Explore More. Experience Life.
                  </span>
                </Link>

                {/* Top Switcher */}
                <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-full border border-gray-200">
                  <Link
                    href="/signup"
                    className="px-5 py-2 rounded-full text-xs font-semibold text-gray-700 hover:text-gray-900 transition-all"
                  >
                    Sign Up
                  </Link>
                  <span className="px-5 py-2 rounded-full text-xs font-semibold bg-black text-white shadow-sm">
                    Log In
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mt-8 sm:mt-10">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  Begin Your Adventure
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-500 font-medium">
                  Log In with Open account
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center py-3 px-4 rounded-xl border border-cyan-100 bg-white hover:border-cyan-300 hover:bg-cyan-50/40 transition-all shadow-xs group cursor-pointer"
                  title="Sign in with Apple"
                >
                  <svg className="w-5 h-5 text-gray-900 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.82 1.12-1.96.99-3.1-.96.04-2.13.64-2.82 1.44-.61.71-1.15 1.87-1.01 2.99 1.08.08 2.17-.51 2.84-1.33z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center py-3 px-4 rounded-xl border border-cyan-100 bg-white hover:border-cyan-300 hover:bg-cyan-50/40 transition-all shadow-xs group cursor-pointer"
                  title="Sign in with Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center py-3 px-4 rounded-xl border border-cyan-100 bg-white hover:border-cyan-300 hover:bg-cyan-50/40 transition-all shadow-xs group cursor-pointer"
                  title="Sign in with X"
                >
                  <svg className="w-4 h-4 text-gray-900 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-cyan-100/80" />
                <span className="text-xs text-gray-400 font-medium lowercase">or</span>
                <div className="flex-1 h-px bg-cyan-100/80" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {error && (
                  <div className="p-3.5 bg-red-50 text-red-600 text-xs sm:text-sm rounded-xl border border-red-100 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Input */}
                <div className="relative group">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1 pl-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="elitrekker@gmail.com"
                    className="w-full px-4 py-3 bg-white border border-cyan-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100/80 rounded-xl outline-none text-sm text-gray-900 font-medium placeholder:text-gray-300 transition-all"
                  />
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1 pl-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white border border-cyan-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100/80 rounded-xl outline-none text-sm text-gray-900 font-medium placeholder:text-gray-300 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Checkbox & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
                    />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                      Remember me
                    </span>
                  </label>

                  <Link href="#" className="text-xs font-semibold text-gray-700 hover:text-black transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Let's Start</span>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Create Account CTA */}
            <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
              Don't have an account?{' '}
              <Link href="/signup" className="font-bold text-gray-900 hover:underline">
                Create one now
              </Link>
            </div>
          </div>

          {/* Right Hero Showcase Panel */}
          <div className="lg:col-span-6 xl:col-span-6 min-h-[480px] lg:min-h-[580px] relative rounded-[24px] md:rounded-[30px] overflow-hidden flex flex-col justify-between p-6 md:p-8 select-none group shadow-inner">
            {/* Background Image Carousel */}
            <Image
              src={slides[currentSlide].image}
              alt="Hero Travel Destination"
              fill
              className="object-cover object-center transition-all duration-700 scale-100 group-hover:scale-105"
              priority
            />

            {/* Overlay Gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 z-[1]" />

            {/* Decorative Top-Left Wave/Notch shape matching container background */}
            <div className="absolute top-0 left-0 z-[2] pointer-events-none text-white hidden sm:block">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M0 0H64C36 0 0 36 0 64V0Z" fill="white" />
              </svg>
            </div>

            {/* Top Right Floating Glassmorphism Card */}
            <div className="relative z-10 self-end max-w-[270px] bg-white/85 backdrop-blur-md text-gray-900 rounded-2xl p-4 shadow-xl border border-white/60 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm leading-snug text-gray-900">
                  {slides[currentSlide].badgeTitle}
                </h3>
                <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-gray-600 leading-relaxed font-medium">
                {slides[currentSlide].badgeDesc}
              </p>
              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-black transition-all cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Controls & Content */}
            <div className="relative z-10 mt-auto flex flex-col md:flex-row md:items-end justify-between gap-4 pt-12">
              {/* Carousel Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Previous slide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Next slide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              {/* Text overlay & CTA pill */}
              <div className="text-left max-w-sm">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight drop-shadow-md">
                  {slides[currentSlide].headline}
                </h2>
                <div className="mt-2.5">
                  <span className="inline-block bg-white/90 hover:bg-white text-gray-900 font-semibold px-4 py-1.5 rounded-full text-xs backdrop-blur-md shadow-sm transition-all cursor-pointer">
                    {slides[currentSlide].cta}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}