"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Booking {
  id: number
  checkIn: string
  checkOut: string
  totalAmount: number
  status: string
  room: {
    roomNumber: string
    roomType: {
      name: string
      hotel: {
        name: string
        imageUrl: string
      }
    }
  }
}

interface FeaturedHotel {
  id: number
  name: string
  description: string
  imageUrl: string
  city: string
  rating: number
  roomCount: number
  availableRooms: number
}

export default function UserDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [featuredHotels, setFeaturedHotels] = useState<FeaturedHotel[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingHotels, setLoadingHotels] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUserName(payload.firstName || payload.email || 'User')
    } catch {
      router.push('/login')
    }

    // Fetch bookings
    async function fetchBookings() {
      try {
        const res = await fetch('/api/user/bookings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        const data = await res.json()
        if (data.success) {
          setBookings(data.data)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    // Fetch featured hotels
    async function fetchFeaturedHotels() {
      try {
        const res = await fetch('/api/hotels/featured')
        const data = await res.json()
        if (data.success) {
          setFeaturedHotels(data.data)
        }
      } catch (error) {
        console.error('Error fetching featured hotels:', error)
      } finally {
        setLoadingHotels(false)
      }
    }

    fetchBookings()
    fetchFeaturedHotels()
  }, [router])

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {userName}! 👋</h1>
        <p className="text-emerald-100 mt-2">Explore luxury stays in Islamabad</p>
        <Link
          href="/rooms"
          className="inline-block mt-4 bg-white text-emerald-700 px-6 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
        >
          Browse Rooms →
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏨</span>
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-sm text-gray-500">Upcoming Stays</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📍</span>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="text-2xl font-bold text-gray-900">Islamabad</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Bookings</h2>
          <Link href="/rooms" className="text-sm text-emerald-600 hover:underline">
            Book New Stay →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading your bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">🏖️</span>
            <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
            <p className="text-gray-500 mt-2">Start your journey with LuxeStay today!</p>
            <Link
              href="/rooms"
              className="inline-block mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Browse Rooms
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border border-gray-100 rounded-lg p-4 hover:border-emerald-200 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.room.roomType.hotel.name}</h4>
                    <p className="text-sm text-gray-600">{booking.room.roomType.name} · Room {booking.room.roomNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">Rs. {booking.totalAmount}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Hotels */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">🌟 Featured Hotels in Islamabad</h2>
          <Link href="/rooms" className="text-sm text-emerald-600 hover:underline">
            View All →
          </Link>
        </div>

        {loadingHotels ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredHotels.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No featured hotels available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredHotels.map((hotel) => (
              <div 
                key={hotel.id} 
                className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div 
                  className="h-40 bg-cover bg-center group-hover:scale-105 transition-transform duration-300" 
                  style={{ backgroundImage: `url(${hotel.imageUrl})` }}
                />
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                  <p className="text-sm text-gray-600">{hotel.city}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">{hotel.availableRooms} rooms available</span>
                    <span className="text-sm text-emerald-600">⭐ {hotel.rating || 4.5}</span>
                  </div>
                  <Link
                    href={`/rooms?hotel=${hotel.id}`}
                    className="mt-3 block text-center text-sm text-emerald-600 hover:underline"
                  >
                    View Rooms →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}