import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateUser } from '@/lib/auth/jwt'
import { z } from 'zod'

// POST /api/models/[id]/comments - Add a comment
const commentSchema = z.object({
  content: z.string().min(1).max(500)
})

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
    
    const body = await req.json()
    const validatedData = commentSchema.parse(body)
    
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        userId: authUser.userId,
        modelId: params.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })
    
    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Add comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
