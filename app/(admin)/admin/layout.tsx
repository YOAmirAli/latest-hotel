"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ChatWidget from '@/components/chat/ChatWidget'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Registrations', href: '/admin/registrations', icon: 'assignment' },
  { label: 'Hotels', href: '/admin/hotels', icon: 'hotel' },
  { label: 'Rooms', href: '/admin/rooms', icon: 'bed' },
  { label: 'Users', href: '/admin/users', icon: 'people' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'admin') {
        router.push('/')
      }
    } catch {
      router.push('/login')
    }
    const timer = setTimeout(() => setLoading(false), 100)
    return () => clearTimeout(timer)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col py-6 z-40 border-r border-gray-100">
        <div className="px-6 mb-8">
          <div className="font-display-lg text-2xl text-emerald-700">LuxeStay</div>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-100 pt-4 px-6">
          <button
            onClick={() => {
              localStorage.removeItem('token')
              document.cookie = 'token=; path=/; max-age=0'
              router.push('/login')
            }}
            className="flex items-center gap-3 text-gray-500 hover:text-red-600 transition-all w-full py-2"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen p-8 bg-gray-50">
        {children}
      </main>

      {/* Chat Widget – visible on all admin pages */}
      <ChatWidget />
    </div>
  )
}