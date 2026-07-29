"use client"

import { useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
  createdAt: string
  hotel: {
    id: number
    name: string
  } | null
}

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-[#FFEBEE] text-[#B71C1C]',
  hotel_manager: 'bg-[#E3F2FD] text-[#1565C0]',
  staff: 'bg-[#FFF3E0] text-[#E65100]',
  guest: 'bg-[#E8F5E9] text-[#2E7D32]',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: number, newRole: string) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          id: userId,
          role: newRole,
        }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchUsers()
      } else {
        alert(data.error || 'Failed to update role')
      }
    } catch (error) {
      alert('Failed to update role')
    }
  }

  async function handleDelete(userId: number) {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        await fetchUsers()
      } else {
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      alert('Failed to delete user')
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    return matchesRole && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">Manage Users</h2>
        <p className="text-on-surface-variant mt-1">View and manage all registered users</p>
      </header>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-sm"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-sm bg-white"
            >
              <option value="all">All Roles</option>
              <option value="guest">Guest</option>
              <option value="hotel_manager">Hotel Manager</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wide">
                  User
                </th>
                <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wide">
                  Hotel
                </th>
                <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wide">
                  Joined
                </th>
                <th className="text-right px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-semibold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-primary">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-on-surface-variant">{user.email}</p>
                          {user.phone && (
                            <p className="text-xs text-outline">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-[10px] font-semibold uppercase tracking-wide ${roleBadgeColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">
                      {user.hotel ? user.hotel.name : '—'}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-3 py-1.5 border border-outline-variant rounded text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none bg-white"
                        >
                          <option value="guest">Guest</option>
                          <option value="hotel_manager">Manager</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-outline hover:text-error hover:bg-error-container rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low">
          <p className="text-sm text-on-surface-variant">
            Showing <span className="font-medium text-primary">{filteredUsers.length}</span> of{' '}
            <span className="font-medium text-primary">{users.length}</span> users
          </p>
        </div>
      </div>
    </div>
  )
}
