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

    const roomTypes = await prisma.roomType.findMany({
      include: {
        hotel: true,
        rooms: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, roomTypes })
  } catch (error) {
    console.error('GET rooms error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}