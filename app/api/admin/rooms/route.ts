import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/get-user'
import { errorResponse, jsonResponse } from '@/lib/utils/helpers'

export async function GET(request: NextRequest) {
  try {
    const { error, status, auth } = requireAuth(request, ['admin'])
    if (error || !auth) return errorResponse(error!, status)

    const roomTypes = await prisma.roomType.findMany({
      include: {
        hotel: { select: { id: true, name: true, city: true } },
        rooms: {
          orderBy: { roomNumber: 'asc' },
        },
      },
      orderBy: { id: 'desc' },
    })

    return jsonResponse({ success: true, roomTypes })
  } catch (error) {
    console.error('Admin rooms GET error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, status, auth } = requireAuth(request, ['admin'])
    if (error || !auth) return errorResponse(error!, status)

    const body = await request.json()
    const { hotelId, name, description, basePrice, capacity, imageUrl } = body

    if (!hotelId || !name || basePrice === undefined) {
      return errorResponse('hotelId, name, and basePrice are required', 400)
    }

    const roomType = await prisma.roomType.create({
      data: {
        hotelId: Number(hotelId),
        name,
        description: description || null,
        basePrice: Number(basePrice),
        capacity: Number(capacity || 2),
        imageUrl: imageUrl || null,
      },
      include: {
        hotel: { select: { id: true, name: true, city: true } },
        rooms: true,
      },
    })

    return jsonResponse({ success: true, roomType }, 201)
  } catch (error) {
    console.error('Admin rooms POST error:', error)
    return errorResponse('Failed to create room type', 500)
  }
}