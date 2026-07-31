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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [totalRegistrations, pendingRegistrations, approvedHotels, totalUsers, totalRooms] = await Promise.all([
      prisma.hotelRegistration.count(),
      prisma.hotelRegistration.count({ where: { status: 'pending' } }),
      prisma.hotel.count({ where: { status: 'approved' } }),
      prisma.user.count(),
      prisma.room.count(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalRegistrations,
        pendingRegistrations,
        approvedHotels,
        totalUsers,
        totalRooms,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}