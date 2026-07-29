"use client"

import { useState, useRef } from 'react'

interface ImageUploadProps {
  onUpload: (url: string) => void
  folder?: string
  label?: string
  existingImage?: string
}

export default function ImageUpload({ 
  onUpload, 
  folder = 'hotels', 
  label = 'Upload Image', 
  existingImage 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingImage || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setPreview(data.url)
        onUpload(data.url)
      } else {
        alert('Upload failed')
      }
    } catch (error) {
      alert('Upload error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Choose Image'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {preview && (
          <div className="relative w-20 h-20 border rounded overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}