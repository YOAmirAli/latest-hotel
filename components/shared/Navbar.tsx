/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check auth status
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setIsLoggedIn(true)
        setUserName(payload.firstName || payload.email || 'User')
        setUserRole(payload.role || 'guest')
      } catch {
        setIsLoggedIn(false)
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    document.cookie = 'token=; path=/; max-age=0'
    setIsLoggedIn(false)
    router.push('/login')
  }

  if (loading) {
    return (
      <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-4 md:px-10 py-4 max-w-7xl mx-auto">
          <div className="font-display-lg text-2xl md:text-3xl text-emerald-700">LuxeStay</div>
          <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center px-4 md:px-10 py-4 max-w-7xl mx-auto">
        <Link href="/" className="font-display-lg text-2xl md:text-3xl text-emerald-700">
          LuxeStay
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/rooms" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
            Rooms
          </Link>
          {isLoggedIn && (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                Dashboard
              </Link>
              <Link href="/my-bookings" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                My Bookings
              </Link>
            </>
          )}
          {isLoggedIn && userRole === 'admin' && (
            <Link href="/admin" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Admin Panel
            </Link>
          )}
          {isLoggedIn && userRole === 'hotel_manager' && (
            <Link href="/manager" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Manager Panel
            </Link>
          )}
          {!isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                👋 {userName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <button
            className="material-symbols-outlined text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "close" : "menu"}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4 flex flex-col gap-4">
          <Link href="/rooms" className="text-gray-600">Rooms</Link>
          {isLoggedIn && (
            <>
              <Link href="/dashboard" className="text-emerald-600">Dashboard</Link>
              <Link href="/my-bookings" className="text-gray-600">My Bookings</Link>
            </>
          )}
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="text-gray-600">Login</Link>
              <Link href="/signup" className="text-emerald-600 font-medium">Sign Up</Link>
            </>
          ) : (
            <>
              <span className="text-gray-700">👋 {userName}</span>
              <button onClick={handleLogout} className="text-red-500 text-left">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}