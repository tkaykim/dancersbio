/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
            return match[1]
        }
    }

    return null
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'maxres' = 'maxres'): string {
    const qualityMap = {
        default: 'default',
        hq: 'hqdefault',
        maxres: 'maxresdefault'
    }

    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
    return extractYouTubeId(url) !== null
}
