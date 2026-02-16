"use client";

import { CheckCircle2, MapPin, Share2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InstagramIcon, XTwitterIcon, YoutubeIcon } from "./SocialLinksInput";
import type { SocialLinks } from "@/lib/supabase";

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
        socialLinks?: SocialLinks | null;
    };
}

function getSocialUrl(platform: string, value: string): string {
    // If user already entered a full URL, use it as-is
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }
    // Strip leading @ if present
    const clean = value.replace(/^@/, "");
    switch (platform) {
        case "instagram":
            return `https://www.instagram.com/${clean}`;
        case "twitter":
            return `https://x.com/${clean}`;
        case "youtube":
            // If it starts with @, it's a channel handle
            if (value.startsWith("@")) {
                return `https://www.youtube.com/${value}`;
            }
            return `https://www.youtube.com/${clean}`;
        default:
            return value;
    }
}

export default function ProfileHeader({ dancer }: ProfileHeaderProps) {
    const router = useRouter();
    const socialLinks = dancer.socialLinks;
    const hasSocialLinks = socialLinks && (socialLinks.instagram || socialLinks.twitter || socialLinks.youtube);

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

                    {/* Social Links */}
                    {hasSocialLinks && (
                        <div className="flex items-center gap-3 mb-5">
                            {socialLinks.instagram && (
                                <a
                                    href={getSocialUrl("instagram", socialLinks.instagram)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 border border-white/10"
                                    title={`Instagram: @${socialLinks.instagram}`}
                                >
                                    <InstagramIcon className="w-4 h-4" />
                                </a>
                            )}
                            {socialLinks.twitter && (
                                <a
                                    href={getSocialUrl("twitter", socialLinks.twitter)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 border border-white/10"
                                    title={`X: @${socialLinks.twitter}`}
                                >
                                    <XTwitterIcon className="w-4 h-4" />
                                </a>
                            )}
                            {socialLinks.youtube && (
                                <a
                                    href={getSocialUrl("youtube", socialLinks.youtube)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 border border-white/10"
                                    title={`YouTube: ${socialLinks.youtube}`}
                                >
                                    <YoutubeIcon className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    )}

                    {/* Main Action Buttons */}
                    <div className="flex gap-2.5 w-full justify-center max-w-[260px] mb-8">
                        <Link href={`/my/proposals/new?dancer_id=${dancer.id}`} className="flex-1 bg-white text-black h-9 rounded-full font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            제안하기
                        </Link>
                        <button className="flex-1 bg-white/10 backdrop-blur-md text-white border border-white/10 h-9 rounded-full font-bold text-[11px] uppercase tracking-wider hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                            포트폴리오
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

            {/* Claim Banner */}
            {!dancer.isClaimed && (
                <div className="mx-6 mt-0 mb-3 p-4 bg-primary/10 border border-primary/20 rounded-xl flex justify-between items-center animate-pulse">
                    <div>
                        <p className="text-xs text-primary font-bold mb-0.5">본인의 프로필인가요?</p>
                        <p className="text-[10px] text-primary/70">소유권을 요청하여 직접 관리하세요.</p>
                    </div>
                    <Link href={`/onboarding/claim?id=${dancer.id}`} className="text-xs bg-primary text-black px-4 py-2 rounded-full font-bold hover:opacity-80 transition-opacity">
                        소유권 요청
                    </Link>
                </div>
            )}

            {/* Manager Request Banner */}
            <div className="mx-6 mt-0 mb-6 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl flex justify-between items-center">
                <div>
                    <p className="text-xs text-blue-400 font-bold mb-0.5">이 댄서의 매니저인가요?</p>
                    <p className="text-[10px] text-blue-400/60">매니저 권한을 요청할 수 있습니다.</p>
                </div>
                <Link href={`/onboarding/claim?id=${dancer.id}&mode=manager`} className="text-xs bg-blue-500 text-white px-4 py-2 rounded-full font-bold hover:opacity-80 transition-opacity">
                    매니저 요청
                </Link>
            </div>
        </div>
    );
}
