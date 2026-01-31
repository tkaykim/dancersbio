"use client";

import Link from "next/link";
import { Play } from "lucide-react";

export default function FeaturedHero() {
    return (
        <div className="w-full px-4 pt-6 pb-6">
            <h1 className="text-2xl font-bold mb-4 px-2">Home</h1>

            {/* Main Featured Card - Tidal 'Headliners' Style */}
            <Link href="/profile/j-ho" className="block w-full aspect-[4/5] sm:aspect-video relative rounded-3xl overflow-hidden bg-[#111] border border-white/10 group cursor-pointer">
                {/* Background Pattern/Image */}
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=800&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 pb-12">
                    <div className="space-y-1 mb-6">
                        <p className="text-3xl font-black text-white tracking-widest uppercase opacity-30 leading-none">DANCERS</p>
                        <p className="text-3xl font-black text-white tracking-widest uppercase opacity-70 leading-none">ORIGINAL</p>
                        <p className="text-5xl font-black text-primary tracking-tighter uppercase leading-none drop-shadow-2xl">
                            TRENDING
                        </p>
                        <p className="text-5xl font-black text-primary tracking-tighter uppercase leading-none drop-shadow-2xl">
                            ARTISTS
                        </p>
                    </div>

                    <div className="max-w-[240px]">
                        <p className="text-sm font-semibold text-white/90 leading-tight mb-8">
                            Meet the top choreographers redefining the K-Pop scene right now.
                        </p>
                    </div>

                    <button className="bg-primary text-black px-8 py-3.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <Play className="w-4 h-4 fill-current" />
                        View Collection
                    </button>
                </div>
            </Link>
        </div>
    );
}
