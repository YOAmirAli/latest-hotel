import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find guest linked to user
    const guest = await prisma.guest.findFirst({
      where: { email: user.email },
    })

    if (!guest) {
      return NextResponse.json({ data: [] })
    }

    const bookings = await prisma.booking.findMany({
      where: { guestId: guest.id },
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

    return NextResponse.json({ success: true, data: bookings })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}