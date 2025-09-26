import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateUser } from '@/lib/auth/jwt'
import { z } from 'zod'

// GET /api/models - Get all public models or user's models
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const userId = searchParams.get('userId') || ''
    const myModels = searchParams.get('myModels') === 'true'
    
    const skip = (page - 1) * limit
    
    let where: any = {}
    
    if (myModels) {
      const authUser = await authenticateUser(req)
      if (!authUser) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      where.userId = authUser.userId
    } else if (userId) {
      where = {
        userId,
        isPublic: true
      }
    } else {
      where.isPublic = true
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const [models, total] = await Promise.all([
      prisma.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.model.count({ where })
    ])
    
    return NextResponse.json({
      models,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get models error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/models - Create a new model
const createModelSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  fileUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  format: z.string(),
  fileSize: z.number(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true)
})

export async function POST(req: NextRequest) {
  try {
    const authUser = await authenticateUser(req)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await req.json()
    const validatedData = createModelSchema.parse(body)
    
    const model = await prisma.model.create({
      data: {
        ...validatedData,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        userId: authUser.userId
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
    
    return NextResponse.json({ model }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Create model error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
