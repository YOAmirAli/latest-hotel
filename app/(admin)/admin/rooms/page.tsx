"use client"

import { useEffect, useState } from 'react'
import ImageUpload from '@/components/ui/ImageUpload'

interface Hotel {
  id: number
  name: string
  city?: string
}

interface RoomUnit {
  id: number
  roomNumber: string
  floor: number
  status: string
}

interface RoomType {
  id: number
  name: string
  description: string | null
  basePrice: number
  capacity: number
  imageUrl?: string | null
  hotel: Hotel
  rooms: RoomUnit[]
}

export default function AdminRoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  // Filtering
  const [search, setSearch] = useState('')
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all')

  // Create Room Type state
  const [showAddModal, setShowAddModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newRoomType, setNewRoomType] = useState({
    hotelId: '',
    name: '',
    description: '',
    basePrice: '',
    capacity: '2',
    imageUrl: '',
    initialRoomNumber: '',
    initialFloor: '1',
  })

  // Edit Room Type state
  const [editingRtId, setEditingRtId] = useState<number | null>(null)
  const [editRtForm, setEditRtForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    capacity: '',
    imageUrl: '',
  })
  const [savingRt, setSavingRt] = useState(false)

  // Add Room Unit state
  const [addingUnitForRtId, setAddingUnitForRtId] = useState<number | null>(null)
  const [newUnitForm, setNewUnitForm] = useState({ roomNumber: '', floor: '1', status: 'available' })
  const [savingUnit, setSavingUnit] = useState(false)

  // Edit Room Unit state
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null)
  const [editUnitForm, setEditUnitForm] = useState({ roomNumber: '', floor: '1', status: 'available' })

  const getToken = () => localStorage.getItem('token') || ''

  async function loadData() {
    setLoading(true)
    try {
      const [roomsRes, hotelsRes] = await Promise.all([
        fetch('/api/admin/rooms', {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch('/api/admin/hotels', {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ])

      const roomsData = await roomsRes.json()
      const hotelsData = await hotelsRes.json()

      if (roomsData.success && Array.isArray(roomsData.roomTypes)) {
        setRoomTypes(roomsData.roomTypes)
      } else if (Array.isArray(roomsData.data)) {
        setRoomTypes(roomsData.data)
      }

      if (hotelsData.success && Array.isArray(hotelsData.data)) {
        setHotels(hotelsData.data)
      }
    } catch (err) {
      console.error('Error loading admin rooms data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Create Room Type
  async function handleCreateRoomType(e: React.FormEvent) {
    e.preventDefault()
    if (!newRoomType.hotelId || !newRoomType.name || !newRoomType.basePrice) {
      alert('Please fill in hotel, room type name, and price.')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          hotelId: Number(newRoomType.hotelId),
          name: newRoomType.name,
          description: newRoomType.description,
          basePrice: Number(newRoomType.basePrice),
          capacity: Number(newRoomType.capacity),
          imageUrl: newRoomType.imageUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create room type')
      }

      // Add initial unit if specified
      if (newRoomType.initialRoomNumber) {
        await fetch('/api/admin/rooms/units', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            roomTypeId: data.roomType.id,
            roomNumber: newRoomType.initialRoomNumber,
            floor: Number(newRoomType.initialFloor),
            status: 'available',
          }),
        })
      }

      setShowAddModal(false)
      setNewRoomType({
        hotelId: '',
        name: '',
        description: '',
        basePrice: '',
        capacity: '2',
        imageUrl: '',
        initialRoomNumber: '',
        initialFloor: '1',
      })
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Error creating room type')
    } finally {
      setCreating(false)
    }
  }

  // Start Edit Room Type
  function startEditRt(rt: RoomType) {
    setEditingRtId(rt.id)
    setEditRtForm({
      name: rt.name,
      description: rt.description || '',
      basePrice: String(rt.basePrice),
      capacity: String(rt.capacity),
      imageUrl: rt.imageUrl || '',
    })
  }

  // Save Edit Room Type
  async function handleSaveRt(id: number) {
    setSavingRt(true)
    try {
      const res = await fetch(`/api/admin/rooms/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: editRtForm.name,
          description: editRtForm.description,
          basePrice: Number(editRtForm.basePrice),
          capacity: Number(editRtForm.capacity),
          imageUrl: editRtForm.imageUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update room type')

      setEditingRtId(null)
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Error updating room type')
    } finally {
      setSavingRt(false)
    }
  }

  // Delete Room Type
  async function handleDeleteRt(id: number) {
    if (!confirm('Are you sure you want to delete this room type?')) return

    try {
      const res = await fetch(`/api/admin/rooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete room type')

      await loadData()
    } catch (err: any) {
      alert(err.message || 'Error deleting room type')
    }
  }

  // Add Room Unit
  async function handleAddUnit(roomTypeId: number) {
    if (!newUnitForm.roomNumber) {
      alert('Room number is required')
      return
    }

    setSavingUnit(true)
    try {
      const res = await fetch('/api/admin/rooms/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          roomTypeId,
          roomNumber: newUnitForm.roomNumber,
          floor: Number(newUnitForm.floor),
          status: newUnitForm.status,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add room unit')

      setAddingUnitForRtId(null)
      setNewUnitForm({ roomNumber: '', floor: '1', status: 'available' })
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Error adding room')
    } finally {
      setSavingUnit(false)
    }
  }

  // Start Edit Unit
  function startEditUnit(unit: RoomUnit) {
    setEditingUnitId(unit.id)
    setEditUnitForm({
      roomNumber: unit.roomNumber,
      floor: String(unit.floor),
      status: unit.status,
    })
  }

  // Save Edit Unit
  async function handleSaveUnit(unitId: number) {
    try {
      const res = await fetch('/api/admin/rooms/units', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          id: unitId,
          roomNumber: editUnitForm.roomNumber,
          floor: Number(editUnitForm.floor),
          status: editUnitForm.status,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update room')

      setEditingUnitId(null)
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Error updating room')
    }
  }

  // Delete Unit
  async function handleDeleteUnit(unitId: number) {
    if (!confirm('Are you sure you want to delete this room unit?')) return

    try {
      const res = await fetch(`/api/admin/rooms/units?id=${unitId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete room')

      await loadData()
    } catch (err: any) {
      alert(err.message || 'Error deleting room')
    }
  }

  // Filtered room types
  const filteredRoomTypes = roomTypes.filter((rt) => {
    const matchesHotel = selectedHotelId === 'all' || rt.hotel.id === Number(selectedHotelId)
    const matchesSearch =
      rt.name.toLowerCase().includes(search.toLowerCase()) ||
      rt.hotel.name.toLowerCase().includes(search.toLowerCase())
    return matchesHotel && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Rooms & Room Types</h1>
          <p className="text-sm text-gray-600">
            Admin management for room types and physical room listings across all hotels.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          + Add Room Type
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search room type or hotel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="w-full sm:w-64 flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter Hotel:</label>
          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Hotels ({hotels.length})</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Room Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Room Type</h2>
            <form onSubmit={handleCreateRoomType} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel *</label>
                <select
                  value={newRoomType.hotelId}
                  onChange={(e) => setNewRoomType({ ...newRoomType, hotelId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a hotel...</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.city ? `(${h.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Deluxe Ocean View Suite"
                  value={newRoomType.name}
                  onChange={(e) => setNewRoomType({ ...newRoomType, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($/night) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="120"
                    value={newRoomType.basePrice}
                    onChange={(e) => setNewRoomType({ ...newRoomType, basePrice: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    value={newRoomType.capacity}
                    onChange={(e) => setNewRoomType({ ...newRoomType, capacity: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of amenities and layout..."
                  value={newRoomType.description}
                  onChange={(e) => setNewRoomType({ ...newRoomType, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <ImageUpload
                label="Room Type Image"
                folder="rooms"
                onUpload={(url) => setNewRoomType({ ...newRoomType, imageUrl: url })}
              />

              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Optional: Add First Physical Room Unit
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Room Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 101"
                      value={newRoomType.initialRoomNumber}
                      onChange={(e) => setNewRoomType({ ...newRoomType, initialRoomNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Floor</label>
                    <input
                      type="number"
                      min="1"
                      value={newRoomType.initialFloor}
                      onChange={(e) => setNewRoomType({ ...newRoomType, initialFloor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 text-sm bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Room Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Types Listing */}
      {filteredRoomTypes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-base font-semibold text-gray-900">No rooms found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {search || selectedHotelId !== 'all'
              ? 'Try clearing your filters or search term.'
              : 'Click "+ Add Room Type" above to create room listings.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRoomTypes.map((rt) => {
            const isEditingRt = editingRtId === rt.id
            const isAddingUnit = addingUnitForRtId === rt.id

            return (
              <div key={rt.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header / Main Info */}
                <div className="p-6">
                  {isEditingRt ? (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-emerald-200">
                      <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
                        Editing {rt.name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Room Name</label>
                          <input
                            type="text"
                            value={editRtForm.name}
                            onChange={(e) => setEditRtForm({ ...editRtForm, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Base Price ($/night)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editRtForm.basePrice}
                            onChange={(e) => setEditRtForm({ ...editRtForm, basePrice: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Capacity</label>
                          <input
                            type="number"
                            value={editRtForm.capacity}
                            onChange={(e) => setEditRtForm({ ...editRtForm, capacity: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={editRtForm.description}
                            onChange={(e) => setEditRtForm({ ...editRtForm, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      <ImageUpload
                        label="Update Room Image"
                        folder="rooms"
                        existingImage={editRtForm.imageUrl}
                        onUpload={(url) => setEditRtForm({ ...editRtForm, imageUrl: url })}
                      />

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingRtId(null)}
                          className="px-4 py-1.5 text-xs text-gray-600 hover:text-gray-800 border rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={savingRt}
                          onClick={() => handleSaveRt(rt.id)}
                          className="px-4 py-1.5 text-xs bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {savingRt ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-4">
                        {rt.imageUrl && (
                          <img
                            src={rt.imageUrl}
                            alt={rt.name}
                            className="w-20 h-20 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                          />
                        )}
                        <div>
                          <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-1">
                            {rt.hotel.name}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">{rt.name}</h3>
                          <p className="text-sm text-gray-600 mt-0.5">
                            ${rt.basePrice}/night · Capacity: {rt.capacity} guest(s)
                          </p>
                          {rt.description && (
                            <p className="text-xs text-gray-500 mt-1 max-w-xl">{rt.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() => setAddingUnitForRtId(addingUnitForRtId === rt.id ? null : rt.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          + Add Room Unit
                        </button>
                        <button
                          onClick={() => startEditRt(rt)}
                          className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-300 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRt(rt.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Room Unit Inline Form */}
                {isAddingUnit && (
                  <div className="px-6 py-4 bg-emerald-50/50 border-t border-emerald-100">
                    <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                      Add Physical Room Unit for {rt.name}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Room # *</label>
                        <input
                          type="text"
                          placeholder="e.g. 104"
                          value={newUnitForm.roomNumber}
                          onChange={(e) => setNewUnitForm({ ...newUnitForm, roomNumber: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Floor</label>
                        <input
                          type="number"
                          min="1"
                          value={newUnitForm.floor}
                          onChange={(e) => setNewUnitForm({ ...newUnitForm, floor: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={newUnitForm.status}
                          onChange={(e) => setNewUnitForm({ ...newUnitForm, status: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-lg text-sm"
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddUnit(rt.id)}
                          disabled={savingUnit}
                          className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {savingUnit ? 'Saving...' : 'Add Room'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingUnitForRtId(null)}
                          className="px-3 py-1.5 border text-xs text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of Physical Room Units */}
                <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Physical Rooms ({rt.rooms.length})
                    </h4>
                  </div>

                  {rt.rooms.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No room units created yet for this type.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {rt.rooms.map((room) => {
                        const isEditingUnit = editingUnitId === room.id

                        if (isEditingUnit) {
                          return (
                            <div key={room.id} className="p-3 bg-white border border-emerald-300 rounded-lg shadow-sm space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-gray-500">Room #</label>
                                  <input
                                    type="text"
                                    value={editUnitForm.roomNumber}
                                    onChange={(e) => setEditUnitForm({ ...editUnitForm, roomNumber: e.target.value })}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-gray-500">Floor</label>
                                  <input
                                    type="number"
                                    value={editUnitForm.floor}
                                    onChange={(e) => setEditUnitForm({ ...editUnitForm, floor: e.target.value })}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-500">Status</label>
                                <select
                                  value={editUnitForm.status}
                                  onChange={(e) => setEditUnitForm({ ...editUnitForm, status: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                >
                                  <option value="available">Available</option>
                                  <option value="occupied">Occupied</option>
                                  <option value="maintenance">Maintenance</option>
                                </select>
                              </div>
                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  onClick={() => setEditingUnitId(null)}
                                  className="px-2 py-1 text-[10px] border text-gray-600 rounded"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveUnit(room.id)}
                                  className="px-2.5 py-1 text-[10px] bg-emerald-600 text-white rounded font-medium"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={room.id}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg text-xs"
                          >
                            <div>
                              <span className="font-bold text-gray-900">Room #{room.roomNumber}</span>
                              <span className="text-gray-500 ml-1.5">(Floor {room.floor})</span>
                              <div className="mt-1">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                    room.status === 'available'
                                      ? 'bg-green-100 text-green-700'
                                      : room.status === 'occupied'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {room.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEditUnit(room)}
                                className="p-1 text-gray-500 hover:text-emerald-600 rounded"
                                title="Edit Room"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteUnit(room.id)}
                                className="p-1 text-gray-500 hover:text-red-600 rounded"
                                title="Delete Room"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
