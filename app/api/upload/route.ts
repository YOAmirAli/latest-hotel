import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'hotels'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory
    const uploadDir = path.join(process.cwd(), 'public/uploads', folder)
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}.${ext}`
    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)

    const publicPath = `/uploads/${folder}/${filename}`
    return NextResponse.json({ success: true, url: publicPath })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}