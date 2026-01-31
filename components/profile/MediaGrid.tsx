"use client";

import { PlayCircle } from "lucide-react";
import Image from "next/image";

interface MediaItem {
    id: string | number;
    type: string;
    thumbnail: string;
}

interface MediaGridProps {
    items?: MediaItem[];
}

export default function MediaGrid({ items }: MediaGridProps) {
    // Default Mock Data if no items provided
    const defaultItems = [
        { id: 1, type: "video", thumbnail: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=400&fit=crop" },
        { id: 2, type: "video", thumbnail: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&h=400&fit=crop" },
        { id: 3, type: "image", thumbnail: "https://images.unsplash.com/photo-1515524738708-327f6b0037a7?w=400&h=400&fit=crop" },
        { id: 4, type: "video", thumbnail: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=400&fit=crop" },
    ];

    const displayItems = items || defaultItems;

    return (
        <div className="px-6 mb-20">
            <h3 className="text-lg font-bold mb-4">Portfolio</h3>
            <div className="grid grid-cols-2 gap-3">
                {displayItems.map((item) => (
                    <div key={item.id} className="relative aspect-[4/5] bg-muted rounded-xl overflow-hidden group">
                        <Image
                            src={item.thumbnail}
                            alt="Portfolio item"
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {item.type === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                <PlayCircle className="w-10 h-10 text-white opacity-90" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
