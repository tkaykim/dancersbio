import { supabase } from './supabase'

/**
 * Upload profile photo to Supabase Storage
 */
/**
 * Upload profile photo to Supabase Storage
 */
export async function uploadProfilePhoto(
    id: string, // Changed from userId to generic id (dancerId)
    file: File
): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${id}/profile_${timestamp}.${fileExt}` // Unique path per dancer & time
    const filePath = `${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false // No need to upsert since filename is unique
        })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath)

    return publicUrl
}

/**
 * Upload portfolio media to Supabase Storage
 */
export async function uploadPortfolioMedia(
    dancerId: string,
    file: File
): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${dancerId}/${timestamp}.${fileExt}`

    const { data, error } = await supabase.storage
        .from('portfolio-media')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(fileName)

    return publicUrl
}

/**
 * Delete file from storage
 */
export async function deleteStorageFile(
    bucket: 'profile-photos' | 'portfolio-media',
    filePath: string
): Promise<void> {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

    if (error) throw error
}

/**
 * Validate file size and type
 */
export function validateFile(
    file: File,
    maxSizeMB: number,
    allowedTypes: string[]
): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`
        }
    }

    // Check file type
    const fileType = file.type
    if (!allowedTypes.includes(fileType)) {
        return {
            valid: false,
            error: `허용된 파일 형식: ${allowedTypes.join(', ')}`
        }
    }

    return { valid: true }
}
