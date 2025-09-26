import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, getTokenFromRequest } from './lib/auth/jwt'

// Protected routes that require authentication
const protectedPaths = [
  '/api/auth/me',
  '/api/models/create',
  '/api/upload',
  '/api/users/profile',
]

// Routes that should apply authentication if available
const optionalAuthPaths = [
  '/api/models',
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Check if path requires authentication
  const isProtected = protectedPaths.some(p => path.startsWith(p))
  const isOptionalAuth = optionalAuthPaths.some(p => path.startsWith(p))
  
  // Handle CORS for API routes
  if (path.startsWith('/api/')) {
    // Create response with CORS headers
    const response = NextResponse.next()
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }
    
    // Verify authentication for protected routes
    if (isProtected) {
      const token = getTokenFromRequest(request)
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401, headers: response.headers }
        )
      }
      
      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401, headers: response.headers }
        )
      }
    }
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
