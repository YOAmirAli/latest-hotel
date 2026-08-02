"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface RoomDetailsClientProps {
  roomId: number
  roomNumber: string
  roomTypeName: string
  hotelName: string
  basePrice: number
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  nights: number
}

export default function RoomDetailsClient({
  roomId,
  roomNumber,
  roomTypeName,
  hotelName,
  basePrice,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  nights,
}: RoomDetailsClientProps) {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState("")
  const [sendError, setSendError] = useState("")

  const handleBookNow = () => {
    const bookingUrl = `/booking?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&price=${basePrice}&total=${totalPrice}&nights=${nights}&roomName=${encodeURIComponent(roomTypeName)}`
    
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
          roomId,
          checkIn,
          checkOut,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSendSuccess(`Room details successfully sent to ${phone}!`)
        setPhone("")
      } else {
        setSendError(data.error || "Failed to send room details")
      }
    } catch (err: any) {
      setSendError(err?.message || "Error sending room details")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Book Now Primary Button */}
      <button
        onClick={handleBookNow}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        <span>Proceed to Reserve</span>
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>

      {/* Send Room Details to Phone Form */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <span className="material-symbols-outlined text-emerald-600 text-[20px]">smartphone</span>
          <span>Send Room Details to My Phone</span>
        </div>

        {sendSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{sendSuccess}</span>
          </div>
        )}

        {sendError && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{sendError}</span>
          </div>
        )}

        <form onSubmit={handleSendToPhone} className="space-y-2">
          <div className="relative">
            <input
              type="tel"
              placeholder="Enter mobile # (e.g. 03465723593)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-3 pr-24 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
            <button
              type="submit"
              disabled={sending}
              className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Receive full room summary, pricing & booking link via SMS/WhatsApp.
          </p>
        </form>
      </div>
    </div>
  )
}
