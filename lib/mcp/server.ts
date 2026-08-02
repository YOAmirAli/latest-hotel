import { prisma } from '@/lib/db/prisma'
import { NotificationService } from '@/lib/services/notification.service'

export const mcpTools = {
  // ----- Guest/User tools -----
  checkAvailability: async (checkIn: string, checkOut: string, guests: number = 2) => {
    const rooms = await prisma.room.findMany({
      where: {
        status: 'available',
        roomType: {
          capacity: { gte: guests },
          hotel: { status: 'approved' },
        },
        NOT: {
          bookings: {
            some: {
              status: { not: 'cancelled' },
              OR: [
                { checkIn: { lt: new Date(checkOut) } },
                { checkOut: { gt: new Date(checkIn) } },
              ],
            },
          },
        },
      },
      include: {
        roomType: {
          include: { hotel: true },
        },
      },
    })
    return { success: true, count: rooms.length, rooms }
  },

  filterHotelsAndRooms: async (params: {
    minPrice?: number
    maxPrice?: number
    amenities?: string[]
    city?: string
    guests?: number
    checkIn?: string
    checkOut?: string
  }) => {
    const { minPrice, maxPrice, amenities = [], city, guests = 1, checkIn, checkOut } = params

    let rooms = await prisma.room.findMany({
      where: {
        status: 'available',
        roomType: {
          hotel: {
            status: 'approved',
            ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
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
      },
      include: {
        roomType: {
          include: { hotel: true },
        },
      },
    })

    if (amenities.length > 0) {
      rooms = rooms.filter((room) => {
        const raw = room.roomType.amenities
        let roomAmenities: string[] = []
        if (Array.isArray(raw)) {
          roomAmenities = raw.map((a) => String(a).toLowerCase())
        } else if (typeof raw === 'string') {
          roomAmenities = [raw.toLowerCase()]
        }
        return amenities.every((req) =>
          roomAmenities.some((ra) => ra.includes(req.toLowerCase()))
        )
      })
    }

    return {
      success: true,
      count: rooms.length,
      filterApplied: { minPrice, maxPrice, amenities, city, guests },
      rooms: rooms.map((r) => ({
        id: r.id,
        roomNumber: r.roomNumber,
        hotelName: r.roomType.hotel.name,
        city: r.roomType.hotel.city,
        roomType: r.roomType.name,
        pricePerNight: r.roomType.basePrice,
        capacity: r.roomType.capacity,
        amenities: r.roomType.amenities,
      })),
    }
  },

  sendRoomDetails: async (phone: string, roomId: number, customNote?: string) => {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        roomType: {
          include: { hotel: true },
        },
      },
    })
    if (!room) throw new Error('Room not found')

    const rawAmenities = room.roomType.amenities
    let amenitiesList: string[] = []
    if (Array.isArray(rawAmenities)) {
      amenitiesList = rawAmenities.map((a) => String(a))
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
      },
      customNote
    )

    return {
      success: true,
      message: `Room details sent to ${phone}`,
      details: result,
    }
  },

  createBooking: async (data: {
    roomId: number
    checkIn: string
    checkOut: string
    guestName: string
    guestEmail: string
    guestPhone?: string
  }) => {
    const { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone } = data
    const nameParts = guestName.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || 'Guest'

    let guest = await prisma.guest.findUnique({ where: { email: guestEmail } })
    if (!guest) {
      guest = await prisma.guest.create({
        data: { email: guestEmail, firstName, lastName, phone: guestPhone },
      })
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true },
    })
    if (!room) throw new Error('Room not found')

    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
    const total = room.roomType.basePrice * nights

    const booking = await prisma.booking.create({
      data: {
        guestId: guest.id,
        roomId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalAmount: total,
        status: 'confirmed',
        paymentStatus: 'unpaid',
      },
    })

    return { success: true, bookingId: booking.id, total, nights }
  },

  cancelBooking: async (bookingId: number) => {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    })
    return { success: true, bookingId: booking.id, status: booking.status }
  },

  getBooking: async (bookingId: number) => {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: { include: { roomType: true } },
      },
    })
    if (!booking) throw new Error('Booking not found')
    return {
      success: true,
      booking: {
        id: booking.id,
        guest: `${booking.guest.firstName} ${booking.guest.lastName}`,
        room: booking.room.roomNumber,
        roomType: booking.room.roomType.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        total: booking.totalAmount,
        status: booking.status,
      },
    }
  },

  // ----- Admin tools -----
  removeUser: async (userId: number) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { guest: true },
    })
    if (!user) throw new Error('User not found')
    if (user.role === 'admin') throw new Error('Cannot remove admin user')

    if (user.guest) {
      await prisma.guest.delete({ where: { id: user.guest.id } })
    }
    await prisma.user.delete({ where: { id: userId } })
    return { success: true, message: `User ${user.email} removed` }
  },

  removeHotel: async (hotelId: number) => {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { roomTypes: { include: { rooms: true } } },
    })
    if (!hotel) throw new Error('Hotel not found')

    for (const rt of hotel.roomTypes) {
      await prisma.room.deleteMany({ where: { roomTypeId: rt.id } })
    }
    await prisma.roomType.deleteMany({ where: { hotelId: hotel.id } })
    await prisma.hotel.delete({ where: { id: hotelId } })
    return { success: true, message: `Hotel "${hotel.name}" removed` }
  },

  processRegistration: async (registrationId: number, action: 'approve' | 'reject', adminId: number) => {
    const registration = await prisma.hotelRegistration.findUnique({
      where: { id: registrationId },
      include: { manager: true },
    })
    if (!registration) throw new Error('Registration not found')
    if (registration.status !== 'pending') throw new Error('Registration already processed')

    if (action === 'approve') {
      const hotel = await prisma.hotel.create({
        data: {
          name: registration.hotelName,
          description: registration.description,
          address: registration.hotelAddress,
          city: registration.hotelCity,
          country: registration.hotelCountry,
          phone: registration.hotelPhone,
          email: registration.hotelEmail,
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: adminId,
          registrationId: registration.id,
        },
      })
      await prisma.hotelRegistration.update({
        where: { id: registrationId },
        data: {
          status: 'approved',
          processedAt: new Date(),
          processedBy: adminId,
          hotelId: hotel.id,
        },
      })
      if (registration.manager) {
        await prisma.user.update({
          where: { id: registration.manager.id },
          data: { hotelId: hotel.id, role: 'hotel_manager' },
        })
      }
      return { success: true, message: `Hotel "${hotel.name}" approved` }
    } else {
      await prisma.hotelRegistration.update({
        where: { id: registrationId },
        data: {
          status: 'rejected',
          processedAt: new Date(),
          processedBy: adminId,
        },
      })
      if (registration.manager) {
        await prisma.user.update({
          where: { id: registration.manager.id },
          data: { role: 'guest' },
        })
      }
      return { success: true, message: `Registration for "${registration.hotelName}" rejected` }
    }
  },

  // ----- Stats tool -----
  getStats: async () => {
    const [totalRegistrations, pendingRegistrations, approvedHotels, totalUsers, totalRooms] = await Promise.all([
      prisma.hotelRegistration.count(),
      prisma.hotelRegistration.count({ where: { status: 'pending' } }),
      prisma.hotel.count({ where: { status: 'approved' } }),
      prisma.user.count(),
      prisma.room.count(),
    ])
    return {
      success: true,
      totalRegistrations,
      pendingRegistrations,
      approvedHotels,
      totalUsers,
      totalRooms,
    }
  },

  // ----- Add hotel (admin) -----
  addHotel: async (data: {
    name: string
    description?: string
    address?: string
    city?: string
    country?: string
    phone?: string
    email?: string
    imageUrl?: string
  }) => {
    const { name, description, address, city, country, phone, email, imageUrl } = data

    const registration = await prisma.hotelRegistration.create({
      data: {
        hotelName: name,
        managerEmail: email || 'admin@luxestay.com',
        managerFirstName: 'Admin',
        managerLastName: 'User',
        status: 'approved',
        hotelAddress: address,
        hotelCity: city || 'Islamabad',
        hotelCountry: country || 'Pakistan',
        hotelPhone: phone,
        hotelEmail: email,
        description: description,
      },
    })

    const hotel = await prisma.hotel.create({
      data: {
        name,
        description,
        address,
        city: city || 'Islamabad',
        country: country || 'Pakistan',
        phone,
        email,
        imageUrl,
        status: 'approved',
        registrationId: registration.id,
        approvedBy: 1,
        approvedAt: new Date(),
      },
    })

    return { success: true, message: `Hotel "${hotel.name}" added successfully!`, hotel }
  },
}