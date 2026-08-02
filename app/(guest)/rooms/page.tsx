"use client"

import { useState, useEffect } from "react"
import RoomCard from "@/components/guest/RoomCard"

interface Room {
  id: number
  roomNumber: string
  floor: number
  status: string
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
  pricePerNight: number
  totalPrice: number
  nights: number
}

const AVAILABLE_AMENITIES = [
  { id: "WiFi", label: "Free High-Speed WiFi", icon: "wifi" },
  { id: "Pool", label: "Swimming Pool", icon: "pool" },
  { id: "Breakfast", label: "Complimentary Breakfast", icon: "flatware" },
  { id: "Spa", label: "Luxury Spa", icon: "spa" },
  { id: "Sea View", label: "Scenic / Sea View", icon: "landscape" },
  { id: "Gym", label: "Fitness Gym", icon: "fitness_center" },
  { id: "Parking", label: "Free Parking", icon: "directions_car" },
  { id: "AC", label: "Air Conditioning", icon: "ac_unit" },
]

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter States
  const [checkIn, setCheckIn] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    return date.toISOString().split('T')[0]
  })
  const [checkOut, setCheckOut] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date.toISOString().split('T')[0]
  })
  const [guests, setGuests] = useState(2)
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [sort, setSort] = useState<string>("default")
  const [addingHotels, setAddingHotels] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [checkIn, checkOut, guests, sort])

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(a => a !== amenityId)
        : [...prev, amenityId]
    )
  }

  async function fetchRooms() {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        checkIn,
        checkOut,
        guests: guests.toString(),
        sort,
      })

      if (minPrice) queryParams.set("minPrice", minPrice)
      if (maxPrice) queryParams.set("maxPrice", maxPrice)
      if (selectedAmenities.length > 0) {
        queryParams.set("amenities", selectedAmenities.join(","))
      }

      const res = await fetch(`/api/rooms/availability?${queryParams.toString()}`)
      const data = await res.json()
      if (data.success) {
        setRooms(data.data)
      } else {
        setRooms([])
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
      setRooms([])
    } font-semibold finally {
      setLoading(false)
    }
  }

  async function handleAddMoreHotels() {
    setAddingHotels(true)
    try {
      await fetch("/api/rooms/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          amenities: selectedAmenities,
        }),
      })
      await fetchRooms()
    } catch (err) {
      console.error(err)
    } finally {
      setAddingHotels(false)
    }
  }

  const resetFilters = () => {
    setMinPrice("")
    setMaxPrice("")
    setSelectedAmenities([])
    setSort("default")
  }

  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Hotels & Rooms</h1>
          <p className="text-gray-500 mt-1">Filter according to your budget range and requirements.</p>
        </div>
        <button
          onClick={handleAddMoreHotels}
          disabled={addingHotels}
          className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">add_business</span>
          <span>{addingHotels ? "Adding Hotels..." : "Add More Hotels & Rooms"}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <section className="mb-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Row 1: Core Search Params */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Check‑in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Check‑out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="1">1 Adult</option>
                <option value="2">2 Adults</option>
                <option value="3">3 Adults</option>
                <option value="4">4+ Adults</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="default">Featured / Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="capacity_desc">Capacity: High to Low</option>
              </select>
            </div>
          </div>

          {/* Row 2: Price Range & Requirements */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Price Range (PKR / night)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min PKR"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="text-gray-400 font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max PKR"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Quick Price Shortcuts */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                Quick Price Filters
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setMinPrice("5000"); setMaxPrice("15000") }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${minPrice === "5000" && maxPrice === "15000" ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}
                >
                  Budget (&lt; 15k)
                </button>
                <button
                  onClick={() => { setMinPrice("15000"); setMaxPrice("30000") }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${minPrice === "15000" && maxPrice === "30000" ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}
                >
                  Deluxe (15k - 30k)
                </button>
                <button
                  onClick={() => { setMinPrice("30000"); setMaxPrice("100000") }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${minPrice === "30000" && maxPrice === "100000" ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}
                >
                  Luxury (30k+)
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 md:pt-6">
              <button
                onClick={fetchRooms}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Apply Filters</span>
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 hover:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                title="Reset Filters"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Row 3: Amenities Requirements Filter */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
              Filter by Requirements & Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_AMENITIES.map((item) => {
                const isSelected = selectedAmenities.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleAmenity(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Room Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 w-full" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 w-3/4 rounded" />
                <div className="h-4 bg-gray-200 w-1/2 rounded" />
                <div className="h-10 bg-gray-200 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : !rooms || rooms.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <span className="material-symbols-outlined text-[64px] text-gray-300 mb-4">filter_alt_off</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Rooms Matched Your Filter</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Try adjusting your budget range or requirements, or click below to populate more hotels matching your criteria!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleAddMoreHotels}
              disabled={addingHotels}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow"
            >
              {addingHotels ? "Adding Hotels..." : "Add Hotels & Rooms"}
            </button>
            <button
              onClick={resetFilters}
              className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm font-semibold text-gray-500">
            Showing {rooms.length} available room options
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                roomNumber={room.roomNumber}
                floor={room.floor}
                roomType={room.roomType}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                pricePerNight={room.pricePerNight}
                totalPrice={room.totalPrice}
                nights={room.nights}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}