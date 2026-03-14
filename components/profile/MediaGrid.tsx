"use client";

import { useState, useCallback, useEffect } from "react";
import { PlayCircle, X } from "lucide-react";
import Image from "next/image";
import { extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/youtube";

interface MediaItem {
    id: string | number;
    type: string;
    thumbnail: string;
    url?: string;
}

interface MediaGridProps {
    items?: MediaItem[];
}

export default function MediaGrid({ items }: MediaGridProps) {
    const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

    const openLightbox = useCallback((item: MediaItem) => {
        setLightboxItem(item);
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxItem(null);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [closeLightbox]);

    // Default mock data if no items provided
    const defaultItems: MediaItem[] = [
        { id: 1, type: "video", thumbnail: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=400&fit=crop" },
        { id: 2, type: "video", thumbnail: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&h=400&fit=crop" },
        { id: 3, type: "image", thumbnail: "https://images.unsplash.com/photo-1515524738708-327f6b0037a7?w=400&h=400&fit=crop" },
        { id: 4, type: "video", thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=400&fit=crop" },
    ];

    const displayItems = items?.length ? items : defaultItems;
    const isYouTube = (item: MediaItem) => item.type === "youtube" || (item.url && /youtube\.com|youtu\.be/.test(item.url));

    if (items && items.length === 0) return null;

    return (
        <div className="px-4 sm:px-6 mb-20">
            <h3 className="text-lg font-bold mb-4">Portfolio</h3>

            {/* 갤러리 그리드: 여러 개가 한눈에 보이도록 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {displayItems.map((item) => {
                    const thumb = item.thumbnail || item.url || "";
                    const mediaUrl = item.url || thumb;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => openLightbox({ ...item, url: mediaUrl })}
                            className="relative aspect-square bg-neutral-900 rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                        >
                            <Image
                                src={thumb}
                                alt="Portfolio"
                                fill
                                sizes="(max-width: 640px) 50vw, 33vw"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {(item.type === "video" || item.type === "youtube" || isYouTube(item)) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors pointer-events-none">
                                    <PlayCircle className="w-10 h-10 text-white opacity-90" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 라이트박스: 클릭 시 크게 보기 */}
            {lightboxItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={closeLightbox}
                    role="dialog"
                    aria-modal="true"
                    aria-label="미디어 확대 보기"
                >
                    <button
                        type="button"
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="닫기"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div
                        className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {lightboxItem.type === "youtube" || (lightboxItem.url && /youtube\.com|youtu\.be/.test(lightboxItem.url)) ? (
                            <YouTubeLightbox url={lightboxItem.url!} />
                        ) : lightboxItem.type === "video" ? (
                            <video
                                src={lightboxItem.url}
                                controls
                                autoPlay
                                className="max-w-full max-h-[85vh] rounded-lg object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <div className="relative w-full max-h-[85vh] flex items-center justify-center">
                                <Image
                                    src={lightboxItem.url || lightboxItem.thumbnail}
                                    alt="Portfolio"
                                    width={1200}
                                    height={900}
                                    className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                    unoptimized={lightboxItem.url?.startsWith("blob:") || lightboxItem.thumbnail?.startsWith("blob:")}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function YouTubeLightbox({ url }: { url: string }) {
    const videoId = extractYouTubeId(url);
    const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) + "?autoplay=1" : null;
    if (!embedUrl) return null;
    return (
        <div className="relative w-full aspect-video max-w-4xl rounded-lg overflow-hidden bg-black">
            <iframe
                src={embedUrl}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
            />
        </div>
    );
}
