import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { formatPrice } from '@/lib/utils/currency'
import RoomDetailsClient from './RoomDetailsClient'

interface RoomPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }>
}

export default async function RoomDetailPage({ params, searchParams }: RoomPageProps) {
  const { id } = await params
  const search = await searchParams

  const roomId = parseInt(id, 10)
  if (isNaN(roomId)) {
    notFound()
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      roomType: {
        include: {
          hotel: true,
        },
      },
    },
  })

  if (!room) {
    notFound()
  }

  const checkIn = search.checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const checkOut = search.checkOut || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  const guests = parseInt(search.guests || '2', 10)

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
  const totalPrice = room.roomType.basePrice * nights

  const rawAmenities = room.roomType.amenities
  let amenitiesList: string[] = []
  if (Array.isArray(rawAmenities)) {
    amenitiesList = rawAmenities.map(a => String(a))
  } else if (typeof rawAmenities === 'string') {
    amenitiesList = [rawAmenities]
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link href="/rooms" className="hover:text-emerald-600">Rooms</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{room.roomType.name}</span>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Room Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {room.status}
              </span>
              <span className="text-sm font-semibold text-gray-500">
                {room.roomType.hotel.name} • {room.roomType.hotel.city || 'Islamabad'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{room.roomType.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Room #{room.roomNumber} · Floor {room.floor} · Max Capacity: {room.roomType.capacity} Guests</p>
          </div>

          {/* Room Image */}
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative shadow-sm">
            <img
              src={room.roomType.imageUrl || `https://picsum.photos/seed/${room.roomType.name.replace(/\s/g, '')}${room.id}/1200/800`}
              alt={room.roomType.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">About this Room</h2>
            <p className="text-gray-600 text-base leading-relaxed">
              {room.roomType.description || 'Experience premium luxury and unmatched comfort. Designed for elegance, featuring state-of-the-art furnishings, high-speed WiFi, panoramic views, and signature hospitality.'}
            </p>
          </div>

          {/* Amenities & Requirements */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Included Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenitiesList.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700 bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                  <span className="text-sm font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Booking & Phone Notification Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg space-y-6 sticky top-8">
            <div className="pb-4 border-b border-gray-100">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-3xl font-bold text-emerald-600">{formatPrice(room.roomType.basePrice)}</span>
                  <span className="text-xs text-gray-400 font-semibold uppercase ml-1">/ night</span>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded font-bold">Best Rate</span>
              </div>
            </div>

            {/* Selected Booking Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in:</span>
                <span className="font-semibold text-gray-900">{checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-out:</span>
                <span className="font-semibold text-gray-900">{checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Guests:</span>
                <span className="font-semibold text-gray-900">{guests} Adults</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 font-bold">
                <span className="text-gray-900">Total ({nights} Nights):</span>
                <span className="text-emerald-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Interactive Phone Details Client Component */}
            <RoomDetailsClient
              roomId={room.id}
              roomNumber={room.roomNumber}
              roomTypeName={room.roomType.name}
              hotelName={room.roomType.hotel.name}
              basePrice={room.roomType.basePrice}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              totalPrice={totalPrice}
              nights={nights}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
