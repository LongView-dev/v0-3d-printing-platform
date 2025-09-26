import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/users/[username] - Get user profile
export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            models: true,
            likes: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
