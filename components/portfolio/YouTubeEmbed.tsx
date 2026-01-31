'use client'

import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube'
import { useState } from 'react'
import { Play } from 'lucide-react'

interface YouTubeEmbedProps {
    url: string
    title?: string
    className?: string
    showThumbnail?: boolean
}

export default function YouTubeEmbed({
    url,
    title = 'YouTube video',
    className = '',
    showThumbnail = true
}: YouTubeEmbedProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const videoId = extractYouTubeId(url)

    if (!videoId) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center">
                <p className="text-red-500 text-sm">잘못된 YouTube URL입니다</p>
            </div>
        )
    }

    const embedUrl = getYouTubeEmbedUrl(videoId)
    const thumbnailUrl = getYouTubeThumbnail(videoId)

    if (showThumbnail && !isPlaying) {
        return (
            <div
                className={`relative cursor-pointer group ${className}`}
                onClick={() => setIsPlaying(true)}
            >
                <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-black fill-black ml-1" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative ${className}`} style={{ paddingBottom: '56.25%' }}>
            <iframe
                src={`${embedUrl}?autoplay=${isPlaying ? 1 : 0}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg"
            />
        </div>
    )
}
