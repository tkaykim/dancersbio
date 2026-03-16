"use client";

import { useState } from "react";
import { Trophy, Tv, Users, Star, GraduationCap, Mic2, PlayCircle, MoreHorizontal, X } from "lucide-react";
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
    icon: React.ElementType;
    items: CareerItem[];
    type: 'carousel' | 'list';
    /** 리스트 타입일 때 모바일에서 한 슬라이드당 세로로 보여줄 개수 (기본 3) */
    listChunkSize?: number;
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
        { id: "choreo", label: "Music Videos & Choreography", icon: Star, items: careers.choreo || [], type: 'list', listChunkSize: 5 },
        { id: "broadcast", label: "Broadcast", icon: Tv, items: careers.broadcast || [], type: 'list', listChunkSize: 3 },
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

                const mobileCard = (item: CareerItem) => (
                    <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`bg-neutral-800/50 p-4 rounded-xl border border-white/5 flex flex-col justify-center ${item.video_url ? 'cursor-pointer hover:bg-neutral-800/80 transition-colors' : ''}`}
                    >
                        <div className="flex justify-between items-center mb-1 gap-2">
                            <h4 className="font-medium text-sm text-white line-clamp-1">{item.title}</h4>
                            {item.year && <span className="text-[10px] text-primary/60 font-mono px-1.5 py-0.5 bg-primary/10 rounded shrink-0">{item.year}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            {item.description && <span className="line-clamp-1">{item.description}</span>}
                        </div>
                    </div>
                );

                const listChunkSize = category.listChunkSize ?? 3;
                const mobileItems = (() => {
                    const chunks: CareerItem[][] = [];
                    for (let i = 0; i < category.items.length; i += listChunkSize) {
                        chunks.push(category.items.slice(i, i + listChunkSize));
                    }
                    return chunks.map((chunk, chunkIndex) => (
                        <div key={chunkIndex} className="flex flex-col gap-3">
                            {chunk.map((item) => mobileCard(item))}
                        </div>
                    ));
                })();

                return (
                    <div key={category.id} className="space-y-4">
                        <div className="px-6 flex justify-between items-baseline">
                            <h3 className="text-xl font-bold tracking-tight text-foreground">{category.label}</h3>
                        </div>

                        {/* Mobile: Swipeable Carousel */}
                        <div className="block md:hidden px-2">
                            <CarouselWithDots items={mobileItems} />
                        </div>

                        {/* Desktop: 리스트 레이아웃 - 텍스트 잘림 없음 */}
                        <div className="hidden md:block px-6">
                            <div className="rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
                                {category.items.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className={`flex items-center gap-4 px-5 py-3.5 bg-neutral-800/30 ${item.video_url ? 'cursor-pointer hover:bg-neutral-800/60 transition-colors' : ''}`}
                                    >
                                        {item.year && (
                                            <span className="text-xs text-primary/70 font-mono px-2 py-0.5 bg-primary/10 rounded shrink-0 min-w-[48px] text-center">
                                                {item.year}
                                            </span>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-white">{item.title}</h4>
                                            {item.description && (
                                                <p className="text-xs text-white/40 mt-0.5">{item.description}</p>
                                            )}
                                        </div>
                                        {item.video_url && (
                                            <PlayCircle className="w-5 h-5 text-white/30 shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
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
