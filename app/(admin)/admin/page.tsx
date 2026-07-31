"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Stats {
  totalRegistrations: number
  pendingRegistrations: number
  approvedHotels: number
  totalUsers: number
  totalRooms: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        const data = await res.json()
        if (data.success) setStats(data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Registrations', value: stats?.totalRegistrations || 0, icon: '📋', color: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700' },
    { label: 'Pending Approval', value: stats?.pendingRegistrations || 0, icon: '⏳', color: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700' },
    { label: 'Approved Hotels', value: stats?.approvedHotels || 0, icon: '🏨', color: 'from-green-50 to-green-100 border-green-200 text-green-700' },
    { label: 'Total Rooms', value: stats?.totalRooms || 0, icon: '🛏️', color: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👤', color: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of your hotel platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} p-6 rounded-xl border shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/registrations"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Review Registrations
            </Link>
            <Link
              href="/admin/hotels"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Manage Hotels
            </Link>
            <Link
              href="/admin/rooms"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              View All Rooms
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-6 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>🤖</span> AI Admin Assistant
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Use the chat widget (bottom-right corner) to manage users, hotels, and registrations via natural language.
          </p>
          <div className="text-xs text-gray-600 bg-white/70 p-3 rounded-lg border border-indigo-100">
            <p className="font-medium">Try commands like:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><code className="bg-gray-200 px-1 rounded">remove user john@example.com</code></li>
              <li><code className="bg-gray-200 px-1 rounded">approve registration 123</code></li>
              <li><code className="bg-gray-200 px-1 rounded">reject hotel Grand Islamabad</code></li>
              <li><code className="bg-gray-200 px-1 rounded">how many hotels are registered</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}