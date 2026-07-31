import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const hotelId = parseInt(params.id)
    if (isNaN(hotelId)) {
      return NextResponse.json({ error: 'Invalid hotel ID' }, { status: 400 })
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        roomTypes: {
          include: {
            rooms: {
              include: {
                bookings: {
                  where: {
                    status: { not: 'cancelled' },
                    OR: [
                      { checkOut: { gte: new Date() } },
                      { status: 'checked_in' },
                    ],
                  },
                },
              },
            },
          },
        },
        users: true,
      },
    })

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }

    // Calculate room stats
    let totalRooms = 0
    let availableRooms = 0
    let occupiedRooms = 0

    for (const rt of hotel.roomTypes) {
      for (const room of rt.rooms) {
        totalRooms++
        if (room.status === 'available') availableRooms++
        else if (room.status === 'occupied') occupiedRooms++
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...hotel,
        stats: {
          totalRooms,
          availableRooms,
          occupiedRooms,
          totalBookings: hotel.roomTypes.flatMap(rt => rt.rooms.flatMap(r => r.bookings)).length,
        },
      },
    })
  } catch (error) {
    console.error('Hotel fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const hotelId = parseInt(params.id)
    if (isNaN(hotelId)) {
      return NextResponse.json({ error: 'Invalid hotel ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, address, city, country, phone, email, website, imageUrl, status } = body

    const hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        name,
        description,
        address,
        city,
        country,
        phone,
        email,
        website,
        imageUrl,
        status,
      },
    })

    return NextResponse.json({ success: true, data: hotel })
  } catch (error) {
    console.error('Hotel update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}