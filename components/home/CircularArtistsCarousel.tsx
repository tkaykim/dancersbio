"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const POPULAR_ARTISTS = [
    { id: "j-ho", name: "J-Ho", image: "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?w=400&h=400&fit=crop" },
    { id: "lia", name: "Lia Kim", image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=400&fit=crop" },
    { id: "bada", name: "Bada Lee", image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&h=400&fit=crop" },
    { id: "aiki", name: "Aiki", image: "https://images.unsplash.com/photo-1515524738708-327f6b0037a7?w=400&h=400&fit=crop" },
    { id: "noze", name: "Noze", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop" },
];

export default function CircularArtistsCarousel() {
    return (
        <div className="w-full py-4">
            <div className="px-6 mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Popular artists</h2>
                <div className="flex gap-1">
                    <button className="p-1 rounded-full bg-white/5 hover:bg-white/10 transition">
                        <ChevronRight className="w-4 h-4 text-white/50" />
                    </button>
                </div>
            </div>

            <div className="flex overflow-x-auto px-6 gap-6 pb-6 no-scrollbar snap-x">
                {POPULAR_ARTISTS.map((artist) => (
                    <Link
                        key={artist.id}
                        href={`/profile/${artist.id}`}
                        className="snap-start shrink-0 flex flex-col items-center gap-3 w-[120px] group"
                    >
                        <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border border-white/5 bg-neutral-900 group-hover:border-primary/50 transition-colors">
                            <Image
                                src={artist.image}
                                alt={artist.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="font-bold text-sm text-center text-white/90 group-hover:text-primary transition-colors">{artist.name}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
