"use client";

import { CheckCircle2, MapPin, Share2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
    dancer: {
        id: string;
        name: string;
        role: string;
        image: string;
        isVerified: boolean;
        isClaimed: boolean;
        location: string;
        stats: { followers: string; views: string };
    };
}

export default function ProfileHeader({ dancer }: ProfileHeaderProps) {
    const router = useRouter();

    // Tidal Style: Full Bleed Hero with Centered Content
    return (
        <div className="relative w-full mb-8">
            {/* Hero Section */}
            <div className="h-[420px] w-full relative group">
                {dancer.image ? (
                    <Image
                        src={dancer.image}
                        alt={dancer.name}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                        <div className="text-white/20 font-bold text-6xl uppercase tracking-widest opacity-50">
                            {dancer.name.slice(0, 2)}
                        </div>
                    </div>
                )}

                {/* Cinematic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-black/20" />

                {/* Top Actions */}
                <div className="absolute top-4 left-4 flex gap-2 z-30 pt-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition border border-white/10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute top-4 right-4 flex gap-2 z-30 pt-4">
                    <button className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition border border-white/10">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Bottom Aligned */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col items-center text-center pb-4">

                    {/* Title */}
                    <h1 className="text-4xl font-extrabold text-white flex items-center gap-2 mb-8 tracking-tight drop-shadow-md">
                        {dancer.name}
                        {dancer.isVerified && (
                            <CheckCircle2 className="w-6 h-6 text-blue-400 fill-blue-900/40" />
                        )}
                    </h1>

                    {/* Subtitle / Role */}
                    {/* <p className="text-sm font-medium text-white/70 mb-6 uppercase tracking-wider">{dancer.role}</p> */}

                    {/* Main Action Buttons (Proprosal / Portfolio) */}
                    <div className="flex gap-2.5 w-full justify-center max-w-[240px] mb-8">
                        <Link href={`/proposal/${dancer.id}`} className="flex-1 bg-white text-black h-9 rounded-full font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            Proposal
                        </Link>
                        <button className="flex-1 bg-white/10 backdrop-blur-md text-white border border-white/10 h-9 rounded-full font-bold text-[11px] uppercase tracking-wider hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                            Portfolio
                        </button>
                    </div>

                    {/* Icon Row (Follow, Location, Fans) - Minimal */}
                    {/* <div className="flex items-center gap-8 text-white/60">
                        <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white transition-colors">
                            <div className="border border-current rounded-full w-6 h-6 flex items-center justify-center text-lg leading-none pb-0.5">+</div>
                            <span className="text-[10px] font-medium">Follow</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white transition-colors">
                            <MapPin className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{dancer.location}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white transition-colors">
                            <span className="text-sm font-bold text-white">{dancer.stats.followers}</span>
                            <span className="text-[10px] font-medium">Fans</span>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* Claim Banner (if needed) */}
            {!dancer.isClaimed && (
                <div className="mx-6 mt-0 mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex justify-between items-center animate-pulse">
                    <div>
                        <p className="text-xs text-primary font-bold mb-0.5">Are you {dancer.name}?</p>
                        <p className="text-[10px] text-primary/70">Take control of this profile.</p>
                    </div>
                    <Link href={`/onboarding/claim?id=${dancer.id}`} className="text-xs bg-primary text-black px-4 py-2 rounded-full font-bold hover:opacity-80 transition-opacity">
                        Claim Access
                    </Link>
                </div>
            )}
        </div>
    );
}
