"use client"

import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils/currency"

interface RoomCardProps {
  id: number
  roomNumber: string
  floor: number
  roomType: {
    id: number
    name: string
    description: string
    basePrice: number
    capacity: number
    amenities: string[]
    imageUrl: string | null
    hotel: {
      id: number
      name: string
    }
  }
  checkIn: string
  checkOut: string
  guests: number
  pricePerNight: number
  totalPrice: number
  nights: number
}

export default function RoomCard({
  id,
  roomNumber,
  floor,
  roomType,
  checkIn,
  checkOut,
  guests,
  pricePerNight,
  totalPrice,
  nights,
}: RoomCardProps) {
  const router = useRouter()

  const handleBookClick = () => {
    const bookingUrl = `/booking?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&price=${pricePerNight}&total=${totalPrice}&nights=${nights}&roomName=${encodeURIComponent(roomType.name)}`
    
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
    if (!token) {
      router.push(`/auth/login?redirect=${encodeURIComponent(bookingUrl)}`)
    } else {
      router.push(bookingUrl)
    }
  }

  return (
    <div className="group bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:scale-[1.01] transition-transform duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-surface-container-highest"
          style={{
            backgroundImage: roomType.imageUrl
              ? `url(${roomType.imageUrl})`
              : `url('https://picsum.photos/seed/${roomType.name.replace(/\s/g, '')}${id}/800/600')`,
          }}
        />
        <div className="absolute top-4 left-4 bg-[#e6f4ea] text-[#1e4620] px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
          Available
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl text-primary">{roomType.name}</h3>
            <p className="text-sm text-on-surface-variant">{roomType.hotel.name} • Room #{roomNumber} • Floor {floor}</p>
          </div>
          <div className="text-right">
            <span className="block text-2xl text-secondary">{formatPrice(pricePerNight)}</span>
            <span className="text-xs text-on-surface-variant uppercase">Per Night</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 py-2 border-y border-outline-variant/20">
          {roomType.amenities?.slice(0, 3).map((amenity, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="text-xs font-medium">{amenity}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleBookClick}
          className="w-full border border-primary text-primary py-3 rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-center block"
        >
          Book Now
        </button>
      </div>
    </div>
  )
}