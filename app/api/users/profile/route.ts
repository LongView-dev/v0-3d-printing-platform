import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateUser } from '@/lib/auth/jwt'
import { hashPassword } from '@/lib/auth/password'
import { z } from 'zod'

// PATCH /api/users/profile - Update current user profile
const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional()
})

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await authenticateUser(req)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await req.json()
    const validatedData = updateProfileSchema.parse(body)
    
    // If email is being changed, check if it's already taken
    if (validatedData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })
      
      if (existingUser && existingUser.id !== authUser.userId) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }
    
    // Hash password if provided
    let hashedPassword = undefined
    if (validatedData.password) {
      hashedPassword = await hashPassword(validatedData.password)
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        name: validatedData.name,
        bio: validatedData.bio,
        avatar: validatedData.avatar,
        email: validatedData.email,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true
      }
    })
    
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/profile - Delete current user account
export async function DELETE(req: NextRequest) {
  try {
    const authUser = await authenticateUser(req)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Delete user and all related data (cascade delete)
    await prisma.user.delete({
      where: { id: authUser.userId }
    })
    
    const response = NextResponse.json({ message: 'Account deleted successfully' })
    
    // Clear auth cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })
    
    return response
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
