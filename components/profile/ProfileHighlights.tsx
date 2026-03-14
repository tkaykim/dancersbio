"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle, X, Users } from "lucide-react";
import CarouselWithDots from "@/components/ui/CarouselWithDots";

export type HighlightItem = {
    id: string;
    year: string;
    title: string;
    description?: string;
    image?: string;
    video_url?: string;
};

interface ProfileHighlightsProps {
    highlights: HighlightItem[];
}

function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
}

const isYouTubeThumbnail = (src: string) => src?.includes("img.youtube.com");

function HighlightCard({
    item,
    onClick,
    className = "",
}: {
    item: HighlightItem;
    onClick: () => void;
    className?: string;
}) {
    return (
        <div
            onClick={item.video_url ? onClick : undefined}
            className={`relative aspect-video w-full rounded overflow-hidden bg-muted group ${item.video_url ? "cursor-pointer" : ""} ${className}`}
        >
            {item.image ? (
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                    unoptimized={isYouTubeThumbnail(item.image)}
                />
            ) : item.video_url && getYouTubeId(item.video_url) ? (
                <Image
                    unoptimized
                    src={`https://img.youtube.com/vi/${getYouTubeId(item.video_url)}/hqdefault.jpg`}
                    alt={item.title}
                    fill
                    className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
            ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <PlayCircle className="w-8 h-8 text-white/30" />
                </div>
            )}
            {item.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <PlayCircle className="w-10 h-10 text-white/80" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                <h4 className="font-medium text-sm text-white line-clamp-1">{item.title}</h4>
                <p className="text-xs text-white/60 line-clamp-1">{item.description}</p>
            </div>
        </div>
    );
}

export default function ProfileHighlights({ highlights }: ProfileHighlightsProps) {
    const [selectedItem, setSelectedItem] = useState<HighlightItem | null>(null);

    if (!highlights || highlights.length === 0) return null;

    const mobileItems = highlights.map((item) => (
        <HighlightCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
    ));

    return (
        <div className="space-y-4 mb-20 text-foreground">
            <div className="px-6 flex justify-between items-baseline">
                <h3 className="text-xl font-bold tracking-tight text-foreground">Highlights</h3>
            </div>

            {/* Mobile: same as Music Videos & Choreography - full-width carousel */}
            <div className="block md:hidden px-2">
                <CarouselWithDots items={mobileItems} />
            </div>

            {/* Desktop: same as Music Videos & Choreography - horizontal carousel, min-w-[200px] */}
            <div className="hidden md:flex overflow-x-auto gap-4 px-6 pb-4 scrollbar-hide snap-x">
                {highlights.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => item.video_url && setSelectedItem(item)}
                        className={`min-w-[200px] w-[200px] snap-start group relative ${item.video_url ? "cursor-pointer" : ""}`}
                    >
                        <div className="aspect-video w-full relative rounded overflow-hidden bg-muted mb-3 shadow-none">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                                    unoptimized={isYouTubeThumbnail(item.image)}
                                />
                            ) : item.video_url && getYouTubeId(item.video_url) ? (
                                <Image
                                    unoptimized
                                    src={`https://img.youtube.com/vi/${getYouTubeId(item.video_url)}/hqdefault.jpg`}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                    <PlayCircle className="w-8 h-8 text-white/30" />
                                </div>
                            )}
                            {item.video_url && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                                    <PlayCircle className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-0.5 px-0.5">
                            <h4 className="font-medium text-sm leading-tight text-foreground line-clamp-1">{item.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Video Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedItem(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
                        onClick={() => setSelectedItem(null)}
                    >
                        <X className="w-10 h-10" />
                    </button>
                    <div
                        className="w-full max-w-4xl bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="aspect-video w-full bg-black">
                            {selectedItem.video_url && getYouTubeId(selectedItem.video_url) ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedItem.video_url)}?autoplay=1`}
                                    className="w-full h-full"
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/50">
                                    Video not available
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-1">{selectedItem.title}</h2>
                            <p className="text-sm text-neutral-400 mb-4">{selectedItem.description}</p>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm text-neutral-300">
                                    <Users className="w-4 h-4 text-primary" />
                                    <span>{selectedItem.description || "—"}</span>
                                </div>
                                {selectedItem.year && (
                                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                                        <span className="w-4 h-4 flex items-center justify-center text-primary font-mono text-xs border border-primary/30 rounded">
                                            Y
                                        </span>
                                        <span>{selectedItem.year}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
