import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { generateToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const loginSchema = z.object({
  emailOrUsername: z.string(),
  password: z.string()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = loginSchema.parse(body)
    
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.emailOrUsername },
          { username: validatedData.emailOrUsername }
        ]
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    })
    
    // Return user data and token
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar
      },
      token
    })
    
    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
