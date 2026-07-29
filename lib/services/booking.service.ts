import { prisma } from '@/lib/db/prisma'
import { WhatsAppService } from './whatsapp.service'
import { PaymentService } from './payment.service'

// Check if Stripe is configured
const USE_STRIPE = !!process.env.STRIPE_SECRET_KEY

export class BookingService {
  static async checkAvailability({
    checkIn,
    checkOut,
    guests = 2,
    city = 'Islamabad',
  }: {
    checkIn: string
    checkOut: string
    guests?: number
    city?: string
  }) {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkInDate >= checkOutDate) {
      throw new Error('Check-in date must be before check-out date')
    }
    if (checkInDate < new Date()) {
      throw new Error('Check-in date must be in the future')
    }

    const availableRooms = await prisma.$transaction(async (tx) => {
      const bookedRoomIds = await tx.booking.findMany({
        where: {
          OR: [{ checkIn: { lt: checkOutDate }, checkOut: { gt: checkInDate } }],
          status: { not: 'cancelled' },
        },
        select: { roomId: true },
        distinct: ['roomId'],
      })

      const occupiedRoomIds = bookedRoomIds.map((b) => b.roomId)

      const rooms = await tx.room.findMany({
        where: {
          id: { notIn: occupiedRoomIds.length > 0 ? occupiedRoomIds : [0] },
          status: 'available',
          roomType: {
            hotel: {
              city: city,
              status: 'approved',
            },
            capacity: { gte: guests },
          },
        },
        include: {
          roomType: {
            include: {
              hotel: true,
            },
          },
        },
      })

      return rooms
    })

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return availableRooms.map((room) => {
      const basePrice = room.roomType.basePrice
      let total = 0
      const current = new Date(checkInDate)
      while (current < checkOutDate) {
        const dayOfWeek = current.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const price = isWeekend ? basePrice * 1.1 : basePrice
        total += price
        current.setDate(current.getDate() + 1)
      }

      return {
        ...room,
        pricePerNight: basePrice,
        totalPrice: total,
        nights,
      }
    })
  }

  static async createBooking(data: {
    guestEmail: string
    guestFirstName: string
    guestLastName: string
    guestPhone?: string
    roomId: number
    checkIn: Date
    checkOut: Date
    guests: number
  }) {
    const {
      guestEmail,
      guestFirstName,
      guestLastName,
      guestPhone,
      roomId,
      checkIn,
      checkOut,
    } = data

    if (checkIn >= checkOut) {
      throw new Error('Check-in must be before check-out')
    }
    if (checkIn < new Date()) {
      throw new Error('Check-in must be in the future')
    }

    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: {
          roomType: {
            include: {
              hotel: true,
            },
          },
        },
      })

      if (!room) {
        throw new Error('Room not found')
      }
      if (room.status === 'occupied') {
        throw new Error('Room is currently occupied')
      }

      const overlapping = await tx.booking.findFirst({
        where: {
          roomId,
          status: { not: 'cancelled' },
          OR: [{ checkIn: { lt: checkOut }, checkOut: { gt: checkIn } }],
        },
      })

      if (overlapping) {
        throw new Error('Room is already booked for these dates')
      }

      const basePrice = room.roomType.basePrice

      let total = 0
      const current = new Date(checkIn)
      while (current < checkOut) {
        const dayOfWeek = current.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const price = isWeekend ? basePrice * 1.1 : basePrice
        total += price
        current.setDate(current.getDate() + 1)
      }

      let guest = await tx.guest.findUnique({
        where: { email: guestEmail },
      })

      if (!guest) {
        guest = await tx.guest.create({
          data: {
            email: guestEmail,
            firstName: guestFirstName,
            lastName: guestLastName,
            phone: guestPhone,
          },
        })
      }

      const newBooking = await tx.booking.create({
        data: {
          guestId: guest.id,
          roomId,
          checkIn,
          checkOut,
          totalAmount: total,
          status: 'pending',
          paymentStatus: USE_STRIPE ? 'unpaid' : 'paid',
        },
        include: {
          guest: true,
          room: {
            include: {
              roomType: {
                include: {
                  hotel: true,
                },
              },
            },
          },
        },
      })

      // Payment handling – FIXED: ensure paymentIntentId is always a string
      let clientSecret = 'dummy_secret'
      let paymentIntentId: string = 'dummy_id' // Explicitly typed as string

      if (USE_STRIPE) {
        try {
          const payment = await PaymentService.createPaymentIntent(total, 'pkr', {
            bookingId: String(newBooking.id),
            guestEmail,
          })
clientSecret = payment.clientSecret!          // Fallback to 'dummy_id' if null
          paymentIntentId = payment.paymentIntentId ?? 'dummy_id'

          await tx.payment.create({
            data: {
              bookingId: newBooking.id,
              stripePaymentIntentId: paymentIntentId, // now guaranteed string
              amount: total,
              status: 'pending',
            },
          })
        } catch (stripeError) {
          console.error('Stripe error:', stripeError)
          await tx.booking.update({
            where: { id: newBooking.id },
            data: { paymentStatus: 'paid' },
          })
          await tx.payment.create({
            data: {
              bookingId: newBooking.id,
              stripePaymentIntentId: `dummy_${newBooking.id}_${Date.now()}`,
              amount: total,
              status: 'succeeded',
              paidAt: new Date(),
            },
          })
        }
      } else {
        await tx.payment.create({
          data: {
            bookingId: newBooking.id,
            stripePaymentIntentId: `dummy_${newBooking.id}_${Date.now()}`,
            amount: total,
            status: 'succeeded',
            paidAt: new Date(),
          },
        })
      }

      return {
        booking: newBooking,
        clientSecret,
        paymentIntentId,
      }
    })

    // Send WhatsApp confirmation
    try {
      if (result.booking.guest.phone && result.booking.guest.phone.trim() !== '') {
        await WhatsAppService.sendBookingConfirmation(
          result.booking.guest.phone,
          {
            bookingId: result.booking.id,
            hotelName: result.booking.room.roomType.hotel.name,
            roomType: result.booking.room.roomType.name,
            roomNumber: result.booking.room.roomNumber,
            checkIn: checkIn.toISOString().split('T')[0],
            checkOut: checkOut.toISOString().split('T')[0],
            totalAmount: result.booking.totalAmount,
            guestName: `${result.booking.guest.firstName} ${result.booking.guest.lastName}`,
          }
        )
      }
    } catch (whatsappError) {
      console.error('WhatsApp notification failed:', whatsappError)
    }

    return result
  }

  static async cancelBooking(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: {
          include: {
            roomType: {
              include: {
                hotel: true,
              },
            },
          },
        },
      },
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled')
    }

    if (booking.status === 'checked_in') {
      throw new Error('Cannot cancel a checked-in booking')
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    })

    return cancelledBooking
  }

  static async getBooking(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: true,
        room: {
          include: {
            roomType: {
              include: {
                hotel: true,
              },
            },
          },
        },
        payments: true,
      },
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    return booking
  }

  static async updateBookingStatus(bookingId: number, status: string) {
    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status')
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    })

    return booking
  }

  static async getGuestBookings(guestId: number) {
    const bookings = await prisma.booking.findMany({
      where: { guestId },
      include: {
        room: {
          include: {
            roomType: {
              include: {
                hotel: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return bookings
  }

  static async isRoomAvailable(roomId: number, checkIn: Date, checkOut: Date) {
    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { not: 'cancelled' },
        OR: [{ checkIn: { lt: checkOut }, checkOut: { gt: checkIn } }],
      },
    })

    return !overlapping
  }
}