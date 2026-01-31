'use client'

import { useState } from 'react'
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon, Video } from 'lucide-react'
import { uploadPortfolioMedia, validateFile } from '@/lib/upload'
import { isValidYouTubeUrl, extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube'
import YouTubeEmbed from './YouTubeEmbed'

interface MediaItem {
    id: string
    type: 'photo' | 'video' | 'youtube'
    url: string
    thumbnail?: string
    caption?: string
}

interface PortfolioMediaManagerProps {
    dancerId: string
    initialMedia?: MediaItem[]
    onMediaChange: (media: MediaItem[]) => void
}

export default function PortfolioMediaManager({
    dancerId,
    initialMedia = [],
    onMediaChange
}: PortfolioMediaManagerProps) {
    const [media, setMedia] = useState<MediaItem[]>(initialMedia)
    const [uploading, setUploading] = useState(false)
    const [youtubeUrl, setYoutubeUrl] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload')

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setError(null)
        setUploading(true)

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                // Validate
                const isVideo = file.type.startsWith('video/')
                const maxSize = isVideo ? 100 : 10
                const allowedTypes = isVideo
                    ? ['video/mp4', 'video/quicktime']
                    : ['image/jpeg', 'image/png', 'image/webp']

                const validation = validateFile(file, maxSize, allowedTypes)
                if (!validation.valid) {
                    throw new Error(validation.error)
                }

                // Upload
                const url = await uploadPortfolioMedia(dancerId, file)

                return {
                    id: Date.now().toString() + Math.random(),
                    type: isVideo ? 'video' as const : 'photo' as const,
                    url
                }
            })

            const newMedia = await Promise.all(uploadPromises)
            const updatedMedia = [...media, ...newMedia]
            setMedia(updatedMedia)
            onMediaChange(updatedMedia)
        } catch (err: any) {
            setError(err.message || '업로드에 실패했습니다.')
        } finally {
            setUploading(false)
        }
    }

    const handleAddYouTube = () => {
        setError(null)

        if (!youtubeUrl.trim()) return

        // Extract potential URLs/IDs using a regex that finds YouTube-like strings
        // This simple split helps processing pasted text blocks
        const tokens = youtubeUrl.split(/[\s,\n]+/)
        const validItems: MediaItem[] = []
        let addedCount = 0

        tokens.forEach(token => {
            if (!token) return

            const videoId = extractYouTubeId(token)
            if (videoId) {
                // Check for duplicates in current media
                const isDuplicate = media.some(m => m.type === 'youtube' && m.url && extractYouTubeId(m.url) === videoId)
                const isDuplicateInBatch = validItems.some(i => extractYouTubeId(i.url) === videoId)

                if (!isDuplicate && !isDuplicateInBatch) {
                    validItems.push({
                        id: Date.now().toString() + Math.random(),
                        type: 'youtube',
                        url: `https://www.youtube.com/watch?v=${videoId}`,
                        thumbnail: getYouTubeThumbnail(videoId)
                    })
                    addedCount++
                }
            }
        })

        if (addedCount === 0) {
            setError('유효한 YouTube 링크를 찾을 수 없거나 이미 추가된 영상입니다.')
            return
        }

        const updatedMedia = [...media, ...validItems]
        setMedia(updatedMedia)
        onMediaChange(updatedMedia)
        setYoutubeUrl('')
        alert(`${addedCount}개의 영상이 추가되었습니다.`)
    }

    const handleRemove = (id: string) => {
        const updatedMedia = media.filter(item => item.id !== id)
        setMedia(updatedMedia)
        onMediaChange(updatedMedia)
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-neutral-800">
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'upload'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-white/60 hover:text-white'
                        }`}
                >
                    <Upload className="inline-block w-4 h-4 mr-2" />
                    사진/영상 업로드
                </button>
                <button
                    onClick={() => setActiveTab('youtube')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'youtube'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-white/60 hover:text-white'
                        }`}
                >
                    <LinkIcon className="inline-block w-4 h-4 mr-2" />
                    YouTube 링크
                </button>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
                <div>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                        multiple
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="media-upload"
                    />
                    <label
                        htmlFor="media-upload"
                        className={`block w-full p-6 border-2 border-dashed border-neutral-800 rounded-lg text-center cursor-pointer hover:border-primary/50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
                        ) : (
                            <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                        )}
                        <p className="text-white font-medium mb-1 text-sm">
                            {uploading ? '업로드 중...' : '파일을 선택하거나 드래그하세요'}
                        </p>
                        <p className="text-white/40 text-xs">
                            사진: JPG, PNG, WEBP (최대 10MB) / 영상: MP4, MOV (최대 100MB)
                        </p>
                    </label>
                </div>
            )}

            {/* YouTube Tab */}
            {activeTab === 'youtube' && (
                <div className="space-y-3">
                    <div>
                        <textarea
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="URL 입력 (여러 개 가능)"
                            className="w-full h-24 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none mb-2"
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-white/40 text-xs">
                                텍스트 전체를 붙여넣으세요. 자동 추출됩니다.
                            </p>
                            <button
                                onClick={handleAddYouTube}
                                disabled={!youtubeUrl.trim()}
                                className="px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                추가하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
                    {error}
                </div>
            )}

            {/* Media Grid */}
            {media.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {media.map((item) => (
                        <div key={item.id} className="relative group aspect-square bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800">
                            {item.type === 'youtube' ? (
                                <img
                                    src={item.thumbnail || `https://img.youtube.com/vi/${extractYouTubeId(item.url)}/mqdefault.jpg`}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    alt="YouTube Thumbnail"
                                />
                            ) : item.type === 'photo' ? (
                                <img
                                    src={item.url}
                                    alt="Portfolio"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <video
                                    src={item.url + '#t=0.5'}
                                    className="w-full h-full object-cover"
                                    muted
                                    preload="metadata"
                                />
                            )}

                            {/* Delete Button */}
                            <button
                                onClick={() => handleRemove(item.id)}
                                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-red-500 transition-colors"
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>

                            {/* Type Icon Overlay */}
                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-white text-[10px] flex items-center gap-1 backdrop-blur-sm">
                                {item.type === 'photo' && <ImageIcon className="w-3 h-3" />}
                                {item.type === 'video' && <Video className="w-3 h-3" />}
                                {item.type === 'youtube' && <LinkIcon className="w-3 h-3" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {media.length === 0 && (
                <div className="text-center py-12 text-white/40">
                    아직 추가된 미디어가 없습니다.
                </div>
            )}
        </div>
    )
}
