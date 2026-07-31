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

    const registrations = await prisma.hotelRegistration.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        processedByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        hotel: true,
      },
    })

    return NextResponse.json({ success: true, data: registrations })
  } catch (error) {
    console.error('Registrations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}