"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface RoomType {
  id: number
  name: string
  basePrice: number
  capacity: number
  rooms: {
    id: number
    roomNumber: string
    floor: number
    status: string
    bookings: {
      id: number
      status: string
      guest: { firstName: string; lastName: string }
      checkIn: string
      checkOut: string
    }[]
  }[]
}

export default function HotelRoomsPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params?.id as string
  const now = new Date()

  const [hotelName, setHotelName] = useState('')
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalRooms: 0, availableRooms: 0, occupiedRooms: 0, totalBookings: 0 })

  useEffect(() => {
    if (hotelId) {
      fetchHotelRooms()
    }
  }, [hotelId])

  async function fetchHotelRooms() {
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        const hotel = data.data
        setHotelName(hotel.name)
        setRoomTypes(hotel.roomTypes || [])
        setStats(hotel.stats || { totalRooms: 0, availableRooms: 0, occupiedRooms: 0, totalBookings: 0 })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/hotels" className="text-emerald-600 hover:underline">
          ← Back to Hotels
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Rooms – {hotelName}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Total Rooms</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.availableRooms}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Occupied</p>
          <p className="text-2xl font-bold text-red-600">{stats.occupiedRooms}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Active Bookings</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalBookings}</p>
        </div>
      </div>

      {roomTypes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No rooms added for this hotel yet.</p>
        </div>
      ) : (
        roomTypes.map((rt) => (
          <div key={rt.id} className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{rt.name}</h3>
                <p className="text-sm text-gray-600">
                  {rt.rooms.length} rooms · ₹{rt.basePrice}/night · Capacity: {rt.capacity}
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {rt.rooms.filter(r => r.status === 'available').length} available
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left">Room #</th>
                    <th className="px-6 py-3 text-left">Floor</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Current Guest</th>
                    <th className="px-6 py-3 text-left">Check-in / Check-out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rt.rooms.map((room) => {
                    const activeBooking = room.bookings.find(
                      (b) => b.status !== 'cancelled' && new Date(b.checkOut) >= now
                    )
                    return (
                      <tr key={room.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">{room.roomNumber}</td>
                        <td className="px-6 py-3 text-gray-600">Floor {room.floor}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              room.status === 'available'
                                ? 'bg-green-100 text-green-700'
                                : room.status === 'occupied'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {room.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {activeBooking
                            ? `${activeBooking.guest.firstName} ${activeBooking.guest.lastName}`
                            : '-'}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {activeBooking
                            ? `${new Date(activeBooking.checkIn).toLocaleDateString()} → ${new Date(activeBooking.checkOut).toLocaleDateString()}`
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}