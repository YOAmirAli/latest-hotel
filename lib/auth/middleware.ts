import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './jwt'

// Public routes (no auth needed)
const publicPaths = [
  '/',
  '/rooms',
  '/booking',
  '/booking/success',
  '/register-hotel',
  '/login',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/register-hotel',
  '/api/rooms/availability',
  '/api/rooms/featured',
  '/api/bookings', // ✅ ADDED THIS
]

// Role-based route access
const roleRoutes = {
  admin: ['/admin', '/api/admin'],
  hotel_manager: ['/manager', '/api/manager'],
  staff: ['/staff', '/api/staff'],
}

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next()
  }

  // Get token
  const token = request.cookies.get('token')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = verifyToken(token)
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check role-based access
  for (const [role, paths] of Object.entries(roleRoutes)) {
    if (paths.some(path => pathname.startsWith(path))) {
      if (payload.role !== role && payload.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // Attach user to headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', String(payload.userId))
  requestHeaders.set('x-user-role', payload.role)
  if (payload.hotelId) {
    requestHeaders.set('x-hotel-id', String(payload.hotelId))
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}