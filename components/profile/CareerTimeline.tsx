"use client";

import { useState } from "react";
import { Trophy, Tv, Users, Star, GraduationCap, Mic2, PlayCircle, MoreHorizontal, X } from "lucide-react";
import Image from "next/image";
import CarouselWithDots from "@/components/ui/CarouselWithDots";

type CareerItem = {
    id: string;
    year: string;
    title: string;
    description?: string;
    image?: string;
    video_url?: string;
};

type CareerCategory = {
    id: string;
    label: string;
    // icon is kept for metadata but not shown in header for minimal look
    icon: React.ElementType;
    items: CareerItem[];
    type: 'carousel' | 'list';
};

interface CareerTimelineProps {
    careers: Record<string, CareerItem[]>;
}

export default function CareerTimeline({ careers }: CareerTimelineProps) {
    const [selectedItem, setSelectedItem] = useState<CareerItem | null>(null);

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleItemClick = (item: CareerItem) => {
        if (item.video_url) {
            setSelectedItem(item);
        }
    };

    const categories: CareerCategory[] = [
        { id: "choreo", label: "Music Videos & Choreography", icon: Star, items: careers.choreo || [], type: 'carousel' },
        { id: "broadcast", label: "Broadcast", icon: Tv, items: careers.broadcast || [], type: 'carousel' },
        { id: "performance", label: "Live Performance", icon: Users, items: careers.performance || [], type: 'list' },
        { id: "award", label: "Awards", icon: Trophy, items: careers.award || [], type: 'list' },
        { id: "judge", label: "Judging", icon: Mic2, items: careers.judge || [], type: 'list' },
        { id: "workshop", label: "Workshops", icon: GraduationCap, items: careers.workshop || [], type: 'list' },
        { id: "education", label: "Teaching & Education", icon: GraduationCap, items: careers.education || [], type: 'list' },
        { id: "other", label: "Other Activities", icon: MoreHorizontal, items: careers.other || [], type: 'list' },
    ];

    return (
        <div className="space-y-10 mb-20 text-foreground">
            {categories.map((category) => {
                if (category.items.length === 0) return null;

                // Prepare Mobile Items (Common for both types, styled as cards for consistency or type-specific)
                const mobileItems = category.items.map((item, index) => (
                    category.type === 'carousel' ? (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`relative aspect-video w-full rounded overflow-hidden bg-muted mb-2 shadow-none group ${item.video_url ? 'cursor-pointer' : ''}`}
                        >
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (item.video_url && getYouTubeId(item.video_url)) ? (
                                <Image
                                    unoptimized
                                    src={`https://img.youtube.com/vi/${getYouTubeId(item.video_url)}/hqdefault.jpg`}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                    <PlayCircle className="w-8 h-8 text-white/30" />
                                </div>
                            )}

                            {/* Play Overlay if Video Exists */}
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
                    ) : (
                        // List items converted to cards (horizontal swipe)
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`bg-neutral-800/50 p-4 rounded-xl border border-white/5 h-full flex flex-col justify-center ${item.video_url ? 'cursor-pointer hover:bg-neutral-800/80 transition-colors' : ''}`}
                        >
                            <div className="flex justify-end items-start mb-2">
                                {item.year && <span className="text-[10px] text-primary/60 font-mono px-1.5 py-0.5 bg-primary/10 rounded">{item.year}</span>}
                            </div>
                            <h4 className="font-medium text-sm text-white line-clamp-1 mb-1">{item.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                {item.description && <span className="line-clamp-1">{item.description}</span>}
                            </div>
                        </div>
                    )
                ));

                return (
                    <div key={category.id} className="space-y-4">
                        {/* Minimal Section Header - No Icons */}
                        <div className="px-6 flex justify-between items-baseline">
                            <h3 className="text-xl font-bold tracking-tight text-foreground">{category.label}</h3>
                            <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">View all</button>
                        </div>

                        {/* Mobile: Swipeable Carousel with Dots */}
                        <div className="block md:hidden px-2">
                            <CarouselWithDots items={mobileItems} />
                        </div>

                        {/* Desktop: Original Grid/List Layout */}
                        <div className="hidden md:block">
                            {category.type === 'carousel' ? (
                                /* Tidal Style Horizontal Carousel */
                                <div className="flex overflow-x-auto gap-4 px-6 pb-4 scrollbar-hide snap-x">
                                    {category.items.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleItemClick(item)}
                                            className={`min-w-[200px] w-[200px] snap-start group relative ${item.video_url ? 'cursor-pointer' : ''}`}
                                        >
                                            <div className="aspect-video w-full relative rounded overflow-hidden bg-muted mb-3 shadow-none">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                                                    />
                                                ) : (item.video_url && getYouTubeId(item.video_url)) ? (
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
                            ) : (
                                /* Tidal Style List (Top Tracks style - Minimal) */
                                <div className="px-6">
                                    <div className="flex flex-col">
                                        {category.items.map((item, index) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleItemClick(item)}
                                                className={`group flex items-center gap-4 py-3 hover:bg-neutral-500/5 -mx-2 px-2 rounded-md transition-colors ${item.video_url ? 'cursor-pointer' : ''}`}
                                            >
                                                {/* Numbering Removed */}

                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <h4 className="font-medium text-sm text-foreground truncate">{item.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        {item.description && <span className="truncate">{item.description}</span>}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {/* Year Badge - Minimal */}
                                                    <span className="text-[10px] text-muted-foreground/60 font-medium hidden sm:inline-block">{item.year}</span>
                                                    <button className="text-muted-foreground hover:text-foreground p-1">
                                                        {item.video_url ? <PlayCircle className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Video Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
                    <button className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors" onClick={() => setSelectedItem(null)}>
                        <X className="w-10 h-10" />
                    </button>

                    <div className="w-full max-w-4xl bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        {/* Video Player */}
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

                        {/* Video Details */}
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-1">{selectedItem.title}</h2>
                            <p className="text-sm text-neutral-400 mb-4">{selectedItem.description}</p>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm text-neutral-300">
                                    <Users className="w-4 h-4 text-primary" />
                                    <span>{selectedItem.description || "Role"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-neutral-300">
                                    <span className="w-4 h-4 flex items-center justify-center text-primary font-mono text-xs border border-primary/30 rounded">Y</span>
                                    <span>{selectedItem.year}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
