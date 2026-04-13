"use client";

import { CheckCircle2, MapPin, Share2, ChevronLeft, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBackWithFallback } from "@/lib/useBackWithFallback";
import { useToast } from "@/components/push/ToastContext";
import { InstagramIcon, XTwitterIcon, YoutubeIcon } from "./SocialLinksInput";
import type { SocialLinks } from "@/lib/supabase";

interface TeamInfo {
    id: string;
    name: string;
    slug: string | null;
    profile_img: string | null;
    is_verified: boolean;
}

interface AgencyInfo {
    id: string;
    name: string;
    is_primary: boolean;
}

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
        teams?: TeamInfo[];
        agencies?: AgencyInfo[];
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
    const { showToast } = useToast();
    const handleBack = useBackWithFallback("/");
    const socialLinks = dancer.socialLinks;

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "";
        try {
            await navigator.clipboard.writeText(url);
            showToast("클립보드에 프로필 링크가 복사되었습니다");
        } catch {
            showToast("복사에 실패했습니다.");
        }
    };
    const hasSocialLinks = socialLinks && (socialLinks.instagram || socialLinks.twitter || socialLinks.youtube);

    // Tidal Style: Full Bleed Hero with Centered Content
    return (
        <div className="relative w-full mb-8">
            {/* Hero Section */}
            <div className="h-[420px] md:h-[520px] w-full relative group">
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
                <div className="absolute top-0 left-4 flex gap-2 z-30 pt-header-safe">
                    <button
                        onClick={handleBack}
                        className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition border border-white/10"
                        aria-label="뒤로 가기"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute top-0 right-4 flex gap-2 z-30 pt-header-safe">
                    <button
                        type="button"
                        onClick={handleShare}
                        className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition border border-white/10"
                        aria-label="프로필 링크 공유"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Bottom Aligned */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 z-20 flex flex-col items-center text-center">

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white flex items-center gap-2 mb-1 tracking-tight drop-shadow-md">
                        {dancer.name}
                        {dancer.isVerified && (
                            <CheckCircle2 className="w-5 h-5 md:w-7 md:h-7 text-blue-400 fill-blue-900/40" />
                        )}
                    </h1>

                    {/* Agencies */}
                    {dancer.agencies && dancer.agencies.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
                            {dancer.agencies.map((agency) => (
                                <Link
                                    key={agency.id}
                                    href={`/agency/${agency.id}`}
                                    className="flex items-center gap-1 text-xs md:text-sm text-white/50 hover:text-white/70 transition-colors"
                                >
                                    <Building2 className="w-3 h-3" />
                                    {agency.name}
                                </Link>
                            ))}
                        </div>
                    ) : null}

                    {/* Teams */}
                    {dancer.teams && dancer.teams.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
                            {dancer.teams.map((team) => (
                                <Link
                                    key={team.id}
                                    href={`/team/${team.slug || team.id}`}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-xs text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors border border-white/5"
                                >
                                    {team.name}
                                </Link>
                            ))}
                        </div>
                    ) : null}

                    {(!dancer.agencies || dancer.agencies.length === 0) && (!dancer.teams || dancer.teams.length === 0) && <div className="mb-3" />}

                    {/* SNS + Action Buttons in one row */}
                    <div className="flex items-center gap-2 mb-4">
                        {hasSocialLinks && (
                            <>
                                {socialLinks.instagram && (
                                    <a
                                        href={getSocialUrl("instagram", socialLinks.instagram)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 md:p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
                                        title={`Instagram: @${socialLinks.instagram}`}
                                    >
                                        <InstagramIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </a>
                                )}
                                {socialLinks.twitter && (
                                    <a
                                        href={getSocialUrl("twitter", socialLinks.twitter)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 md:p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
                                        title={`X: @${socialLinks.twitter}`}
                                    >
                                        <XTwitterIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </a>
                                )}
                                {socialLinks.youtube && (
                                    <a
                                        href={getSocialUrl("youtube", socialLinks.youtube)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 md:p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
                                        title={`YouTube: ${socialLinks.youtube}`}
                                    >
                                        <YoutubeIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </a>
                                )}
                                <div className="w-px h-5 bg-white/15 mx-1" />
                            </>
                        )}
                        {/* 제안하기 버튼 숨김 (기능 유지) */}
                        {false && (
                            <Link href={`/my/proposals/new?dancer_id=${dancer.id}`} className="bg-white text-black h-8 px-5 rounded-full font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center">
                                제안하기
                            </Link>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
