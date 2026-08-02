"use client"

import { useState } from "react"
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
      city?: string
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
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phone, setPhone] = useState("")
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState("")
  const [sendError, setSendError] = useState("")

  const handleBookClick = () => {
    const bookingUrl = `/booking?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&price=${pricePerNight}&total=${totalPrice}&nights=${nights}&roomName=${encodeURIComponent(roomType.name)}`
    
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
    if (!token) {
      router.push(`/auth/login?redirect=${encodeURIComponent(bookingUrl)}`)
    } else {
      router.push(bookingUrl)
    }
  }

  const handleSendToPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !phone.trim()) {
      setSendError("Please enter your phone number")
      return
    }

    setSending(true)
    setSendError("")
    setSendSuccess("")

    try {
      const res = await fetch("/api/notifications/send-room-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          roomId: id,
          checkIn,
          checkOut,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSendSuccess(`Room details sent to ${phone}!`)
        setTimeout(() => {
          setShowPhoneModal(false)
          setSendSuccess("")
          setPhone("")
        }, 2500)
      } else {
        setSendError(data.error || "Failed to send room details")
      }
    } catch (err: any) {
      setSendError(err?.message || "Error sending notification")
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="group bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:scale-[1.01] transition-transform duration-300 flex flex-col justify-between">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-surface-container-highest cursor-pointer"
              onClick={() => router.push(`/rooms/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}
              style={{
                backgroundImage: roomType.imageUrl
                  ? `url(${roomType.imageUrl})`
                  : `url('https://picsum.photos/seed/${roomType.name.replace(/\s/g, '')}${id}/800/600')`,
              }}
            />
            <div className="absolute top-4 left-4 bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm">
              Available
            </div>
            <button
              onClick={() => setShowPhoneModal(true)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-emerald-700 p-2 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 flex items-center justify-center"
              title="Send room details to your phone"
            >
              <span className="material-symbols-outlined text-[20px]">smartphone</span>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 
                  onClick={() => router.push(`/rooms/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}
                  className="text-xl font-bold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  {roomType.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {roomType.hotel.name} • Room #{roomNumber} • Floor {floor}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-bold text-emerald-600">{formatPrice(pricePerNight)}</span>
                <span className="text-xs text-gray-400 uppercase font-medium">Per Night</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 py-2 border-y border-gray-100">
              {roomType.amenities?.slice(0, 4).map((amenity, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-medium">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowPhoneModal(true)}
              className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">sms</span>
              <span>Send to Phone</span>
            </button>
            <button
              onClick={() => router.push(`/rooms/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>Details</span>
            </button>
          </div>
          <button
            onClick={handleBookClick}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-sm font-semibold transition-all uppercase tracking-wider text-center block shadow-sm hover:shadow"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Send Room Details to Phone Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setShowPhoneModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">smartphone</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Send Room Details</h3>
                <p className="text-xs text-gray-500">{roomType.name} at {roomType.hotel.name}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Enter your mobile number below to receive instant room info, pricing, amenities, and direct booking link via SMS/WhatsApp.
            </p>

            {sendSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200 flex items-center gap-2">
                <span className="material-symbols-outlined">check_circle</span>
                <span>{sendSuccess}</span>
              </div>
            )}

            {sendError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                <span>{sendError}</span>
              </div>
            )}

            <form onSubmit={handleSendToPhone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Mobile Number (WhatsApp/SMS)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-400 material-symbols-outlined text-[20px]">phone</span>
                  <input
                    type="tel"
                    placeholder="03465723593 or +923465723593"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="w-1/2 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Send Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}