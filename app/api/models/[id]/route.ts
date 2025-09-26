import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateUser } from '@/lib/auth/jwt'
import { z } from 'zod'

// GET /api/models/[id] - Get a single model
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const model = await prisma.model.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }
    
    // Check if model is private and user is not the owner
    const authUser = await authenticateUser(req)
    if (!model.isPublic && model.userId !== authUser?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Increment view count
    await prisma.model.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } }
    })
    
    // Parse tags if exists
    const modelData = {
      ...model,
      tags: model.tags ? JSON.parse(model.tags) : [],
      isLiked: authUser ? model.likes.some(like => like.userId === authUser.userId) : false
    }
    
    return NextResponse.json({ model: modelData })
  } catch (error) {
    console.error('Get model error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/models/[id] - Update a model
const updateModelSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional()
})

export async function PATCH(
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
    
    // Check if user owns the model
    const model = await prisma.model.findUnique({
      where: { id: params.id }
    })
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }
    
    if (model.userId !== authUser.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const body = await req.json()
    const validatedData = updateModelSchema.parse(body)
    
    const updatedModel = await prisma.model.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })
    
    return NextResponse.json({ model: updatedModel })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Update model error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/models/[id] - Delete a model
export async function DELETE(
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
    
    // Check if user owns the model
    const model = await prisma.model.findUnique({
      where: { id: params.id }
    })
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }
    
    if (model.userId !== authUser.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Delete the model (likes and comments will be cascade deleted)
    await prisma.model.delete({
      where: { id: params.id }
    })
    
    // TODO: Delete actual files from storage
    
    return NextResponse.json({ message: 'Model deleted successfully' })
  } catch (error) {
    console.error('Delete model error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
