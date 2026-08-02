import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

function parseDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// Helper to seed hotels & rooms when data is insufficient for filtering out
async function seedHotelsAndRoomsIfInsufficient(reqMinPrice?: number, reqMaxPrice?: number, reqAmenities: string[] = []) {
  try {
    const existingHotelsCount = await prisma.hotel.count({ where: { status: 'approved' } })
    
    // Default seed templates matching different price tiers and requirements
    const seedTemplates = [
      {
        hotelName: 'Serena Pearl Grand',
        city: 'Islamabad',
        country: 'Pakistan',
        address: 'Khayaban-e-Suhrawardy, Sector G-5, Islamabad',
        roomTypeName: 'Executive Royal Suite',
        description: 'Panoramc Margalla Hills view with private Jacuzzi, butler service, and complimentary breakfast.',
        basePrice: reqMaxPrice ? Math.min(reqMaxPrice, 45000) : 45000,
        capacity: 4,
        amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa', 'Sea View', 'Gym', 'Parking', 'AC', 'Room Service'],
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        roomNumber: `SE-${Math.floor(100 + Math.random() * 899)}`,
      },
      {
        hotelName: 'Marriott Capital View',
        city: 'Islamabad',
        country: 'Pakistan',
        address: 'Aga Khan Road, F-5/1, Islamabad',
        roomTypeName: 'Deluxe King Room',
        description: 'Spacious modern luxury room with king bed, ergonomic desk, high-speed WiFi, and 24/7 room service.',
        basePrice: reqMinPrice ? Math.max(reqMinPrice, 22000) : 22000,
        capacity: 2,
        amenities: ['WiFi', 'Breakfast', 'Gym', 'Parking', 'AC', 'Room Service'],
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        roomNumber: `MA-${Math.floor(100 + Math.random() * 899)}`,
      },
      {
        hotelName: 'Pine Crest Heritage Resort',
        city: 'Murree',
        country: 'Pakistan',
        address: 'Mall Road, Murree',
        roomTypeName: 'Mountain View Chalet',
        description: 'Cozy wooden cabin interior with stone fireplace, balcony, and scenic pine valley views.',
        basePrice: 16000,
        capacity: 3,
        amenities: ['WiFi', 'Breakfast', 'Parking', 'Sea View', 'Room Service'],
        imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        roomNumber: `PC-${Math.floor(100 + Math.random() * 899)}`,
      },
      {
        hotelName: 'Urban Boutique Hotel',
        city: 'Islamabad',
        country: 'Pakistan',
        address: 'F-7 Markaz, Islamabad',
        roomTypeName: 'Budget Comfort Room',
        description: 'Clean, smart economical room equipped with air conditioning, workspace, and free breakfast.',
        basePrice: reqMinPrice ? Math.min(reqMinPrice, 8500) : 8500,
        capacity: 2,
        amenities: ['WiFi', 'Breakfast', 'AC', 'Parking'],
        imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        roomNumber: `UB-${Math.floor(100 + Math.random() * 899)}`,
      },
      {
        hotelName: 'The Pearl Continental',
        city: 'Rawalpindi',
        country: 'Pakistan',
        address: 'The Mall, Rawalpindi',
        roomTypeName: 'Presidential Panorama Penthouse',
        description: 'Ultra-luxurious suite with private pool access, marble bath, executive lounge, and chef dining.',
        basePrice: 75000,
        capacity: 6,
        amenities: ['WiFi', 'Pool', 'Breakfast', 'Spa', 'Sea View', 'Gym', 'Parking', 'AC', 'Room Service'],
        imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
        roomNumber: `PC-${Math.floor(100 + Math.random() * 899)}`,
      },
    ]

    for (const tpl of seedTemplates) {
      // Check if registration exists or create one
      let reg = await prisma.hotelRegistration.findFirst({
        where: { hotelName: tpl.hotelName },
      })
      if (!reg) {
        reg = await prisma.hotelRegistration.create({
          data: {
            hotelName: tpl.hotelName,
            managerEmail: `manager@${tpl.hotelName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
            managerFirstName: 'Hotel',
            managerLastName: 'Manager',
            status: 'approved',
            hotelAddress: tpl.address,
            hotelCity: tpl.city,
            hotelCountry: tpl.country,
          },
        })
      }

      let hotel = await prisma.hotel.findFirst({
        where: { name: tpl.hotelName },
      })
      if (!hotel) {
        hotel = await prisma.hotel.create({
          data: {
            name: tpl.hotelName,
            description: `Premier hospitality experience located in ${tpl.city}.`,
            address: tpl.address,
            city: tpl.city,
            country: tpl.country,
            status: 'approved',
            registrationId: reg.id,
            imageUrl: tpl.imageUrl,
            approvedAt: new Date(),
          },
        })
      }

      let roomType = await prisma.roomType.findFirst({
        where: { hotelId: hotel.id, name: tpl.roomTypeName },
      })
      if (!roomType) {
        roomType = await prisma.roomType.create({
          data: {
            hotelId: hotel.id,
            name: tpl.roomTypeName,
            description: tpl.description,
            basePrice: tpl.basePrice,
            capacity: tpl.capacity,
            amenities: tpl.amenities,
            imageUrl: tpl.imageUrl,
          },
        })
      }

      const existingRoom = await prisma.room.findFirst({
        where: { roomTypeId: roomType.id },
      })
      if (!existingRoom) {
        await prisma.room.create({
          data: {
            roomTypeId: roomType.id,
            roomNumber: tpl.roomNumber,
            floor: Math.floor(1 + Math.random() * 5),
            status: 'available',
          },
        })
      }
    }
  } catch (err) {
    console.error('Auto-seed error:', err)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const checkIn = parseDate(searchParams.get('checkIn')) || new Date(Date.now() + 86400000)
  const checkOut = parseDate(searchParams.get('checkOut')) || new Date(Date.now() + 3 * 86400000)
  const guests = parseInt(searchParams.get('guests') || '1', 10)
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
  const city = searchParams.get('city') || undefined
  const hotelId = searchParams.get('hotelId') ? parseInt(searchParams.get('hotelId')!, 10) : undefined
  const sort = searchParams.get('sort') || 'default'
  const autoSeed = searchParams.get('autoSeed') !== 'false'

  // Requirements / Amenities filter
  const amenitiesParam = searchParams.get('amenities')
  const reqAmenities = amenitiesParam
    ? amenitiesParam.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  try {
    const fetchRooms = async () => {
      const whereCondition: any = {
        status: 'available',
        roomType: {
          hotel: {
            status: 'approved',
            ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
            ...(hotelId ? { id: hotelId } : {}),
          },
          capacity: { gte: guests },
          ...(minPrice !== undefined || maxPrice !== undefined
            ? {
                basePrice: {
                  ...(minPrice !== undefined ? { gte: minPrice } : {}),
                  ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
                },
              }
            : {}),
        },
        bookings: {
          none: {
            AND: [
              { checkIn: { lt: checkOut } },
              { checkOut: { gt: checkIn } },
            ],
          },
        },
      }

      const rooms = await prisma.room.findMany({
        where: whereCondition,
        include: {
          roomType: {
            include: {
              hotel: true,
            },
          },
        },
      })

      // Client-side filter for roomType amenities if requested
      if (reqAmenities.length > 0) {
        return rooms.filter((room) => {
          const raw = room.roomType.amenities
          let roomAmenities: string[] = []
          if (Array.isArray(raw)) {
            roomAmenities = raw.map((a) => String(a).toLowerCase())
          } else if (typeof raw === 'string') {
            roomAmenities = [raw.toLowerCase()]
          }
          return reqAmenities.every((req) =>
            roomAmenities.some((ra) => ra.includes(req.toLowerCase()))
          )
        })
      }

      return rooms
    }

    let roomResults = await fetchRooms()

    // IF NOT ENOUGH DATA (e.g. < 3 items), AUTO SEED / ADD HOTELS & ROOMS
    if (roomResults.length < 3 && autoSeed) {
      await seedHotelsAndRoomsIfInsufficient(minPrice, maxPrice, reqAmenities)
      roomResults = await fetchRooms()
    }

    // Calculate nights & pricing breakdown
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))

    let data = roomResults.map((room) => {
      const rawAmenities = room.roomType.amenities
      let amenitiesList: string[] = []
      if (Array.isArray(rawAmenities)) {
        amenitiesList = rawAmenities.map((a) => String(a))
      } else if (typeof rawAmenities === 'string') {
        amenitiesList = [rawAmenities]
      }

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        status: room.status,
        roomType: {
          id: room.roomType.id,
          name: room.roomType.name,
          description: room.roomType.description,
          basePrice: room.roomType.basePrice,
          capacity: room.roomType.capacity,
          amenities: amenitiesList,
          imageUrl: room.roomType.imageUrl,
          hotel: {
            id: room.roomType.hotel.id,
            name: room.roomType.hotel.name,
            city: room.roomType.hotel.city,
            address: room.roomType.hotel.address,
          },
        },
        pricePerNight: room.roomType.basePrice,
        totalPrice: room.roomType.basePrice * nights,
        nights,
      }
    })

    // Sorting
    if (sort === 'price_asc') {
      data.sort((a, b) => a.pricePerNight - b.pricePerNight)
    } else if (sort === 'price_desc') {
      data.sort((a, b) => b.pricePerNight - a.pricePerNight)
    } else if (sort === 'capacity_desc') {
      data.sort((a, b) => b.roomType.capacity - a.roomType.capacity)
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    })
  } catch (error: any) {
    console.error('Availability endpoint error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch available rooms' },
      { status: 500 }
    )
  }
}

// POST endpoint to explicitly trigger adding/seeding hotels and rooms
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { minPrice, maxPrice, amenities } = body
    await seedHotelsAndRoomsIfInsufficient(minPrice, maxPrice, amenities)
    return NextResponse.json({
      success: true,
      message: 'Hotels and rooms added successfully!',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to add hotels' },
      { status: 500 }
    )
  }
}
