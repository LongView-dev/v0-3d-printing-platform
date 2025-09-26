import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth/jwt'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

const ALLOWED_FORMATS = ['stl', 'obj', 'glb', 'gltf', 'fbx', '3ds', 'ply']
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(req: NextRequest) {
  try {
    const authUser = await authenticateUser(req)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    const thumbnail = formData.get('thumbnail') as File | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }
    
    // Validate file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      )
    }
    
    // Create upload directories if they don't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'models')
    const thumbnailDir = join(process.cwd(), 'public', 'uploads', 'thumbnails')
    
    await mkdir(uploadDir, { recursive: true })
    await mkdir(thumbnailDir, { recursive: true })
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const modelFileName = `${timestamp}-${randomString}.${fileExtension}`
    const modelPath = join(uploadDir, modelFileName)
    
    // Save model file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(modelPath, buffer)
    
    let thumbnailUrl = null
    
    // Process thumbnail if provided
    if (thumbnail && thumbnail.size > 0) {
      try {
        const thumbnailBytes = await thumbnail.arrayBuffer()
        const thumbnailBuffer = Buffer.from(thumbnailBytes)
        
        const thumbnailFileName = `${timestamp}-${randomString}-thumb.webp`
        const thumbnailPath = join(thumbnailDir, thumbnailFileName)
        
        // Resize and optimize thumbnail
        await sharp(thumbnailBuffer)
          .resize(400, 400, {
            fit: 'cover',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toFile(thumbnailPath)
        
        thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`
      } catch (error) {
        console.error('Thumbnail processing error:', error)
        // Continue without thumbnail if processing fails
      }
    }
    
    const fileUrl = `/uploads/models/${modelFileName}`
    
    return NextResponse.json({
      fileUrl,
      thumbnailUrl,
      format: fileExtension,
      fileSize: file.size,
      fileName: file.name
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
