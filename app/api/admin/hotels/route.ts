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
      take: 20,
    })

    const formattedHotels = hotels.map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      imageUrl: hotel.imageUrl || 'https://picsum.photos/seed/hotel/400/300',
      city: hotel.city || 'Islamabad',
      status: hotel.status,
      roomTypes: hotel.roomTypes,
      rating: 4.5,
      roomCount: hotel.roomTypes.reduce((acc, rt) => acc + rt.rooms.length, 0),
      availableRooms: hotel.roomTypes.reduce((acc, rt) => 
        acc + rt.rooms.filter(r => r.status === 'available').length, 0
      ),
    }))

    return NextResponse.json({ success: true, data: formattedHotels })
  } catch (error) {
    console.error('Hotels fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, address, city, country, phone, email, imageUrl, status } = body

    if (!name) {
      return NextResponse.json({ error: 'Hotel name is required' }, { status: 400 })
    }

    // 1. Create registration record required by schema foreign key
    const reg = await prisma.hotelRegistration.create({
      data: {
        hotelName: name,
        managerEmail: email || 'admin@luxestay.com',
        managerFirstName: 'Admin',
        managerLastName: 'Added',
        status: status || 'approved',
        description: description || 'Luxury hotel in Islamabad',
        hotelAddress: address || 'Islamabad',
        hotelCity: city || 'Islamabad',
        hotelCountry: country || 'Pakistan',
        hotelPhone: phone || '+92 51 1234567',
        hotelEmail: email || 'info@luxestay.com',
      },
    })

    // 2. Create hotel record
    const hotel = await prisma.hotel.create({
      data: {
        name,
        description: description || 'Luxury hotel offering world-class amenities and comfortable stays in Islamabad.',
        address: address || 'Islamabad',
        city: city || 'Islamabad',
        country: country || 'Pakistan',
        phone: phone || '+92 51 1234567',
        email: email || 'info@luxestay.com',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
        status: status || 'approved',
        registrationId: reg.id,
      },
    })

    // 3. Link registration to hotel
    await prisma.hotelRegistration.update({
      where: { id: reg.id },
      data: { hotelId: hotel.id },
    })

    // 4. Create initial default room types and available rooms in PKR
    const defaultRoomTypes = [
      { name: 'Deluxe Suite', basePrice: 16000, capacity: 2, amenities: ['WiFi', 'Air Conditioning', 'TV', 'Breakfast Included'] },
      { name: 'Executive King', basePrice: 26000, capacity: 4, amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Balcony', 'City View'] }
    ]

    for (const rt of defaultRoomTypes) {
      const roomType = await prisma.roomType.create({
        data: {
          hotelId: hotel.id,
          name: rt.name,
          basePrice: rt.basePrice,
          capacity: rt.capacity,
          amenities: rt.amenities,
          imageUrl: hotel.imageUrl,
        }
      })

      for (let i = 1; i <= 3; i++) {
        await prisma.room.create({
          data: {
            roomTypeId: roomType.id,
            roomNumber: `${name.substring(0, 2).toUpperCase()}-${rt.name.substring(0, 2).toUpperCase()}${i}`,
            floor: 1,
            status: 'available',
          }
        })
      }
    }

    return NextResponse.json({ success: true, data: hotel })
  } catch (error: any) {
    console.error('Error creating hotel:', error)
    return NextResponse.json({ error: error.message || 'Failed to create hotel' }, { status: 500 })
  }
}