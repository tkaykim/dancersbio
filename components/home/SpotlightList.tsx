"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const SPOTLIGHT_ITEMS = [
    { id: 1, title: "Super Shy Draft", artist: "J-Ho", slug: "j-ho", image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=200&h=200&fit=crop" },
    { id: 2, title: "Smoke Challenge", artist: "Bada Lee", slug: "bada-lee", image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=200&h=200&fit=crop" },
    { id: 3, title: "Gold Gold Gold", artist: "Lia Kim", slug: "lia-kim", image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=200&h=200&fit=crop" },
    { id: 4, title: "Power Intro", artist: "Just Jerk", slug: "j-ho", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=200&h=200&fit=crop" },
];

export default function SpotlightList() {
    return (
        <div className="w-full py-4">
            <div className="px-6 mb-4 flex justify-between items-baseline">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Spotlighted Uploads
                        <span className="text-white/40 border border-white/40 rounded-full w-4 h-4 text-[10px] flex items-center justify-center">i</span>
                    </h2>
                    <p className="text-xs text-white/50 mt-1">Independent works selected by our team</p>
                </div>
                <span className="text-sm font-bold text-white/40">View all</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-6">
                {SPOTLIGHT_ITEMS.map((item) => (
                    <Link key={item.id} href={`/profile/${item.slug}`} className="flex gap-3 group cursor-pointer">
                        <div className="relative w-12 h-12 shrink-0 rounded bg-neutral-800 overflow-hidden">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:opacity-80 transition-opacity"
                            />
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                            <h4 className="font-bold text-sm text-white truncate pr-1">{item.title}</h4>
                            <p className="text-xs text-white/50 truncate flex items-center gap-1">
                                {item.artist}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center">
                            <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
