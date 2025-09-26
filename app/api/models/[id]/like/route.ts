import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateUser } from '@/lib/auth/jwt'

// POST /api/models/[id]/like - Like or unlike a model
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await authenticateUser(req)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if model exists
    const model = await prisma.model.findUnique({
      where: { id: params.id }
    })
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }
    
    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_modelId: {
          userId: authUser.userId,
          modelId: params.id
        }
      }
    })
    
    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: authUser.userId,
          modelId: params.id
        }
      })
      
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like model error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
