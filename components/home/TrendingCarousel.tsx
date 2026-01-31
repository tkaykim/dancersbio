"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

// Mock Data with J-Ho
const TRENDING_DANCERS = [
    { id: "j-ho", name: "J-Ho", role: "Just Jerk Crew", image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=400&fit=crop" },
    { id: "lia", name: "Lia Kim", role: "1MILLION", image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=400&fit=crop" },
    { id: "bada", name: "Bada Lee", role: "BEBE", image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&h=400&fit=crop" },
    { id: "aiki", name: "Aiki", role: "Hook", image: "https://images.unsplash.com/photo-1515524738708-327f6b0037a7?w=400&h=400&fit=crop" },
];

export default function TrendingCarousel() {
    return (
        <div className="w-full py-2">
            <div className="px-6 mb-5 flex justify-between items-end">
                <h2 className="text-xl font-bold tracking-tight">Trending Artists</h2>
                <span className="text-xs text-muted-foreground font-medium hover:text-primary transition-colors cursor-pointer">View All</span>
            </div>

            <div className="flex overflow-x-auto px-6 gap-4 pb-6 no-scrollbar snap-x">
                {TRENDING_DANCERS.map((dancer) => (
                    <Link
                        key={dancer.id}
                        href={`/profile/${dancer.id}`}
                        className="snap-start shrink-0 flex flex-col w-[150px] group"
                    >
                        <div className="relative w-[150px] h-[150px] rounded-lg overflow-hidden mb-3 bg-muted shadow-sm">
                            <Image
                                src={dancer.image}
                                alt={dancer.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Verified Badge or Status */}
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Star className="w-3 h-3 text-primary fill-primary" />
                            </div>
                        </div>
                        <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{dancer.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{dancer.role}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
