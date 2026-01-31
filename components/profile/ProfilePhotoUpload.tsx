'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadProfilePhoto, validateFile } from '@/lib/upload'

interface ProfilePhotoUploadProps {
    targetId: string // Changed from userId
    currentPhotoUrl?: string | null
    onUploadSuccess: (url: string) => void
}

export default function ProfilePhotoUpload({
    targetId,
    currentPhotoUrl,
    onUploadSuccess
}: ProfilePhotoUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)

        // Validate file
        const validation = validateFile(file, 5, ['image/jpeg', 'image/png', 'image/webp'])
        if (!validation.valid) {
            setError(validation.error!)
            return
        }

        // Show preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload
        setUploading(true)
        try {
            const url = await uploadProfilePhoto(targetId, file)
            onUploadSuccess(url)
        } catch (err: any) {
            setError(err.message || '업로드에 실패했습니다.')
            setPreview(currentPhotoUrl || null)
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-4">
            {/* Preview */}
            <div className="flex items-center gap-4">
                <div className="relative w-32 h-32 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center overflow-hidden">
                    {preview ? (
                        <>
                            <img
                                src={preview}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                            />
                            {uploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            )}
                        </>
                    ) : (
                        <ImageIcon className="w-12 h-12 text-white/20" />
                    )}
                </div>

                <div className="flex-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />

                    <div className="space-y-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-4 py-2 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            {preview ? '사진 변경' : '사진 업로드'}
                        </button>

                        {preview && !uploading && (
                            <button
                                onClick={handleRemove}
                                className="px-4 py-2 bg-neutral-800 text-white font-medium rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                제거
                            </button>
                        )}
                    </div>

                    <p className="text-white/40 text-xs mt-2">
                        JPG, PNG, WEBP (최대 5MB)
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
                    {error}
                </div>
            )}
        </div>
    )
}
