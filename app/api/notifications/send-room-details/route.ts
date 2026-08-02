import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { NotificationService } from '@/lib/services/notification.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, roomId, checkIn, checkOut, note } = body

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const room = await prisma.room.findUnique({
      where: { id: Number(roomId) },
      include: {
        roomType: {
          include: {
            hotel: true,
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    const rawAmenities = room.roomType.amenities
    let amenitiesList: string[] = []
    if (Array.isArray(rawAmenities)) {
      amenitiesList = rawAmenities.map(a => String(a))
    } else if (typeof rawAmenities === 'string') {
      amenitiesList = [rawAmenities]
    }

    const result = await NotificationService.sendRoomDetailsToPhone(
      phone,
      {
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomTypeName: room.roomType.name,
        hotelName: room.roomType.hotel.name,
        hotelCity: room.roomType.hotel.city,
        hotelAddress: room.roomType.hotel.address,
        basePrice: room.roomType.basePrice,
        capacity: room.roomType.capacity,
        amenities: amenitiesList,
        description: room.roomType.description,
        imageUrl: room.roomType.imageUrl,
        checkIn,
        checkOut,
      },
      note
    )

    return NextResponse.json({
      success: true,
      message: `Room details sent successfully to ${result.to}!`,
      data: result,
    })
  } catch (error: any) {
    console.error('Send room details error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send room details' },
      { status: 500 }
    )
  }
}
