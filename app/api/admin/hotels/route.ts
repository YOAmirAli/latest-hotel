import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const hotels = await prisma.hotel.findMany({
      where: {
        status: 'approved',
      },
      include: {
        roomTypes: {
          include: {
            rooms: {
              where: { status: 'available' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })

    const formattedHotels = hotels.map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      imageUrl: hotel.imageUrl || 'https://picsum.photos/seed/hotel/400/300',
      city: hotel.city || 'Islamabad',
      rating: 4.5,
      roomCount: hotel.roomTypes.reduce((acc, rt) => acc + rt.rooms.length, 0),
      availableRooms: hotel.roomTypes.reduce((acc, rt) => 
        acc + rt.rooms.filter(r => r.status === 'available').length, 0
      ),
    }))

    return NextResponse.json({ success: true, data: formattedHotels })
  } catch (error) {
    console.error('Featured hotels error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}