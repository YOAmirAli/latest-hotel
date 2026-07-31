import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/services/booking.service'
import { z } from 'zod'

const createBookingSchema = z.object({
  guestEmail: z.string().email(),
  guestFirstName: z.string().min(1),
  guestLastName: z.string().min(1),
  guestPhone: z.string().optional(),
  roomId: z.number().int().positive(),
  checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid check-in date',
  }),
  checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid check-out date',
  }),
  guests: z.number().int().positive().default(2),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid data' },
        { status: 400 }
      )
    }

    const data = {
      ...parsed.data,
      checkIn: new Date(parsed.data.checkIn),
      checkOut: new Date(parsed.data.checkOut),
    }

    const result = await BookingService.createBooking(data)

    return NextResponse.json({
      success: true,
      data: {
        bookingId: result.booking.id,
        clientSecret: result.clientSecret,
        totalAmount: result.booking.totalAmount,
      },
    })
  } catch (error: any) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    )
  }
}