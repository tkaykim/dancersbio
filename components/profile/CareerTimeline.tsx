"use client";

import { Trophy, Tv, Users, Star, GraduationCap, Mic2, PlayCircle, MoreHorizontal } from "lucide-react";
import Image from "next/image";

type CareerItem = {
    id: string;
    year: string;
    title: string;
    description?: string;
    image?: string;
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
    const categories: CareerCategory[] = [
        { id: "choreography", label: "Music Videos & Choreography", icon: Star, items: careers.choreography || [], type: 'carousel' },
        { id: "broadcast", label: "Broadcast", icon: Tv, items: careers.broadcast || [], type: 'carousel' },
        { id: "performance", label: "Live Performance", icon: Users, items: careers.performance || [], type: 'list' },
        { id: "award", label: "Awards", icon: Trophy, items: careers.award || [], type: 'list' },
        { id: "judging", label: "Judging", icon: Mic2, items: careers.judging || [], type: 'list' },
        { id: "teaching", label: "Teaching", icon: GraduationCap, items: careers.teaching || [], type: 'list' },
    ];

    return (
        <div className="space-y-10 mb-20 text-foreground">
            {categories.map((category) => {
                if (category.items.length === 0) return null;

                return (
                    <div key={category.id} className="space-y-4">
                        {/* Minimal Section Header - No Icons */}
                        <div className="px-6 flex justify-between items-baseline">
                            <h3 className="text-xl font-bold tracking-tight text-foreground">{category.label}</h3>
                            <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">View all</button>
                        </div>

                        {/* Layout Content */}
                        {category.type === 'carousel' ? (
                            /* Tidal Style Horizontal Carousel */
                            <div className="flex overflow-x-auto gap-4 px-6 pb-4 scrollbar-hide snap-x">
                                {category.items.map((item) => (
                                    <div key={item.id} className="min-w-[200px] w-[200px] snap-start group cursor-pointer relative">
                                        <div className="aspect-video w-full relative rounded overflow-hidden bg-muted mb-3 shadow-none">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                                    <PlayCircle className="w-8 h-8 text-white/30" />
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
                                        <div key={item.id} className="group flex items-center gap-4 py-3 hover:bg-neutral-500/5 -mx-2 px-2 rounded-md transition-colors cursor-pointer">
                                            <span className="flex w-4 justify-center text-sm text-muted-foreground font-medium">{index + 1}</span>

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
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
