/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
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

  const navBg = isHome && !isScrolled
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm'

  const textColor = isHome && !isScrolled ? 'text-white' : 'text-gray-700'
  const logoColor = isHome && !isScrolled ? 'text-white' : 'text-emerald-900'
  const linkHover = isHome && !isScrolled ? 'hover:text-amber-200' : 'hover:text-emerald-600'

  if (loading) {
    return (
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="flex justify-between items-center px-4 md:px-10 py-5 max-w-7xl mx-auto">
          <div className={`font-display-lg text-2xl md:text-3xl tracking-wide ${logoColor}`}>
            LuxeStay
          </div>
          <div className="w-24 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="flex justify-between items-center px-4 md:px-10 py-5 max-w-7xl mx-auto">
        <Link href="/" className={`font-display-lg text-2xl md:text-4xl tracking-wide italic ${logoColor} transition-colors duration-300`}>
          LuxeStay
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm font-medium tracking-wide ${textColor} ${linkHover} transition-colors`}>
            Home
          </Link>
          <Link href="/rooms" className={`text-sm font-medium tracking-wide ${textColor} ${linkHover} transition-colors`}>
            Rooms
          </Link>
          <Link href="/rooms" className={`text-sm font-medium tracking-wide ${textColor} ${linkHover} transition-colors`}>
            Spa
          </Link>
          <Link href="/rooms" className={`text-sm font-medium tracking-wide ${textColor} ${linkHover} transition-colors`}>
            Wellness
          </Link>
          <Link href="/rooms" className={`text-sm font-medium tracking-wide ${textColor} ${linkHover} transition-colors`}>
            About
          </Link>

          {isLoggedIn && userRole === 'admin' && (
            <Link href="/admin" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Admin
            </Link>
          )}
          {isLoggedIn && userRole === 'hotel_manager' && (
            <Link href="/manager" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Manager
            </Link>
          )}

          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/signup"
                className={`text-sm font-medium tracking-wide px-7 py-2.5 rounded-full border transition-all ${
                  isHome && !isScrolled
                    ? 'border-white/40 text-white hover:bg-white/10'
                    : 'border-emerald-800/30 text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                Book Now
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/my-bookings" className={`text-sm font-medium ${textColor} ${linkHover} transition-colors`}>
                My Bookings
              </Link>
              <span className={`text-sm font-medium ${textColor}`}>
                {userName}
              </span>
              <button
                onClick={handleLogout}
                className={`text-sm font-medium ${textColor} ${linkHover} transition-colors`}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <button
            className={`material-symbols-outlined ${textColor}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "close" : "menu"}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-6 flex flex-col gap-5">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 font-medium">Home</Link>
          <Link href="/rooms" onClick={() => setIsMenuOpen(false)} className="text-gray-700 font-medium">Rooms</Link>
          <Link href="/rooms" onClick={() => setIsMenuOpen(false)} className="text-gray-700 font-medium">Spa</Link>
          <Link href="/rooms" onClick={() => setIsMenuOpen(false)} className="text-gray-700 font-medium">Wellness</Link>
          <Link href="/rooms" onClick={() => setIsMenuOpen(false)} className="text-gray-700 font-medium">About</Link>
          {!isLoggedIn ? (
            <>
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-gray-600">Login</Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="text-emerald-700 font-medium">Book Now</Link>
            </>
          ) : (
            <>
              <Link href="/my-bookings" onClick={() => setIsMenuOpen(false)} className="text-gray-700">My Bookings</Link>
              <button onClick={() => { handleLogout(); setIsMenuOpen(false) }} className="text-red-500 text-left">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
