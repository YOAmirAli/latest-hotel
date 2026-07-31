"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ImageUpload from '@/components/ui/ImageUpload'

interface Hotel {
  id: number
  name: string
  description: string
  city: string
  country?: string
  address: string
  status: string
  imageUrl: string
  roomTypes: { id: number; name: string }[]
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: 'Islamabad',
    country: 'Pakistan',
    phone: '',
    email: '',
    imageUrl: '',
  })

  useEffect(() => {
    fetchHotels()
  }, [])

  async function fetchHotels() {
    try {
      const res = await fetch('/api/admin/hotels', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setHotels(data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddHotel(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...form, status: 'approved' }),
      })
      const data = await res.json()
      if (data.success) {
        setShowForm(false)
        setForm({ name: '', description: '', address: '', city: 'Islamabad', country: 'Pakistan', phone: '', email: '', imageUrl: '' })
        await fetchHotels()
      } else {
        alert(data.error)
      }
    } catch {
      alert('Failed to add hotel')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hotels</h2>
          <p className="text-gray-600">Manage all hotels on the platform</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
        >
          {showForm ? 'Cancel' : '+ Add Hotel'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Hotel</h3>
          <form onSubmit={handleAddHotel} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Only Islamabad hotels are allowed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div>
              <ImageUpload
                label="Hotel Cover Image"
                folder="hotels"
                onUpload={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all"
            >
              {saving ? 'Adding...' : 'Add Hotel'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div
              className="h-48 bg-cover bg-center"
              style={{
                backgroundImage: hotel.imageUrl
                  ? `url(${hotel.imageUrl})`
                  : 'url(https://picsum.photos/seed/hotel/400/300)'
              }}
            />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
              <p className="text-sm text-gray-600">{hotel.address}</p>
              <p className="text-sm text-gray-600">{hotel.city}, {hotel.country}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  hotel.status === 'approved' ? 'bg-green-100 text-green-700' :
                  hotel.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {hotel.status}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/hotels/${hotel.id}/rooms`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Rooms
                  </Link>
                  <Link
                    href={`/admin/hotels/${hotel.id}/edit`}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}