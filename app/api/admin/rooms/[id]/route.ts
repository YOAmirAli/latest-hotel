import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/get-user'
import { roomTypeSchema } from '@/lib/validations/auth.schema'
import { errorResponse, jsonResponse } from '@/lib/utils/helpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status, auth } = requireAuth(request, ['admin'])
  if (error || !auth) return errorResponse(error!, status)

  const { id } = await params
  const roomTypeId = Number(id)
  if (Number.isNaN(roomTypeId)) return errorResponse('Invalid room type id', 400)

  const existing = await prisma.roomType.findUnique({ where: { id: roomTypeId } })
  if (!existing) return errorResponse('Room type not found', 404)

  const body = await request.json()
  const parsed = roomTypeSchema.partial().safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400)
  }

  const roomType = await prisma.roomType.update({
    where: { id: roomTypeId },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.basePrice !== undefined && { basePrice: parsed.data.basePrice }),
      ...(parsed.data.capacity !== undefined && { capacity: parsed.data.capacity }),
      ...(parsed.data.amenities !== undefined && { amenities: parsed.data.amenities }),
      ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl || null }),
    },
    include: { hotel: { select: { id: true, name: true } }, rooms: true },
  })

  return jsonResponse({ success: true, roomType })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status, auth } = requireAuth(_request, ['admin'])
  if (error || !auth) return errorResponse(error!, status)

  const { id } = await params
  const roomTypeId = Number(id)
  if (Number.isNaN(roomTypeId)) return errorResponse('Invalid room type id', 400)

  const roomCount = await prisma.room.count({ where: { roomTypeId } })
  if (roomCount > 0) {
    return errorResponse('Cannot delete room type with assigned rooms. Delete or reassign rooms first.', 400)
  }

  await prisma.roomType.delete({ where: { id: roomTypeId } })
  return jsonResponse({ success: true, message: 'Room type deleted' })
}
