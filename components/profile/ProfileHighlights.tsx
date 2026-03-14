"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle, X, Users } from "lucide-react";

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

export default function ProfileHighlights({ highlights }: ProfileHighlightsProps) {
    const [selectedItem, setSelectedItem] = useState<HighlightItem | null>(null);

    if (!highlights || highlights.length === 0) return null;

    return (
        <div className="mb-10 text-foreground">
            <div className="px-6 mb-4">
                <h3 className="text-xl font-bold tracking-tight text-foreground">Highlights</h3>
            </div>

            <div className="flex overflow-x-auto gap-4 px-6 pb-4 scrollbar-hide snap-x snap-mandatory">
                {highlights.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => item.video_url && setSelectedItem(item)}
                        className={`min-w-[200px] w-[200px] snap-start group relative flex-shrink-0 ${item.video_url ? "cursor-pointer" : ""}`}
                    >
                        <div className="aspect-video w-full relative rounded-xl overflow-hidden bg-muted shadow-lg border border-white/5">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                                    unoptimized={isYouTubeThumbnail(item.image)}
                                />
                            ) : item.video_url && getYouTubeId(item.video_url) ? (
                                <Image
                                    unoptimized
                                    src={`https://img.youtube.com/vi/${getYouTubeId(item.video_url)}/hqdefault.jpg`}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                    <PlayCircle className="w-8 h-8 text-white/30" />
                                </div>
                            )}
                            {item.video_url && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                    <PlayCircle className="w-10 h-10 text-white/90 drop-shadow-md" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                {item.year && (
                                    <span className="text-[10px] text-primary/80 font-mono px-1.5 py-0.5 bg-primary/20 rounded mb-1 inline-block">
                                        {item.year}
                                    </span>
                                )}
                                <h4 className="font-semibold text-sm text-white line-clamp-2 drop-shadow-md">{item.title}</h4>
                                {item.description && (
                                    <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{item.description}</p>
                                )}
                            </div>
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
