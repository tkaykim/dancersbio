"use client";

import { CheckCircle2, MapPin, Share2, ChevronLeft, Users, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useBackWithFallback } from "@/lib/useBackWithFallback";
import { useToast } from "@/components/push/ToastContext";
import { InstagramIcon, XTwitterIcon, YoutubeIcon } from "@/components/profile/SocialLinksInput";
import type { Team } from "@/lib/supabase";

function getSocialUrl(platform: string, value: string): string {
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    const clean = value.replace(/^@/, "");
    switch (platform) {
        case "instagram": return `https://www.instagram.com/${clean}`;
        case "twitter": return `https://x.com/${clean}`;
        case "youtube": return value.startsWith("@") ? `https://www.youtube.com/${value}` : `https://www.youtube.com/${clean}`;
        default: return value;
    }
}

interface AgencyInfo {
    id: string;
    name: string;
    is_primary: boolean;
}

interface TeamProfileHeaderProps {
    team: Team;
    memberCount: number;
    agencies?: AgencyInfo[];
}

export default function TeamProfileHeader({ team, memberCount, agencies }: TeamProfileHeaderProps) {
    const { showToast } = useToast();
    const handleBack = useBackWithFallback("/");
    const socialLinks = team.social_links;

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "";
        try {
            await navigator.clipboard.writeText(url);
            showToast("클립보드에 팀 프로필 링크가 복사되었습니다");
        } catch {
            showToast("복사에 실패했습니다.");
        }
    };

    const hasSocialLinks = socialLinks && (socialLinks.instagram || socialLinks.twitter || socialLinks.youtube);

    return (
        <div className="relative w-full mb-8">
            <div className="h-[420px] md:h-[520px] w-full relative group">
                {team.profile_img ? (
                    <Image
                        src={team.profile_img}
                        alt={team.name}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                        <div className="text-white/20 font-bold text-6xl uppercase tracking-widest opacity-50">
                            {team.name.slice(0, 2)}
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-black/20" />

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
                        aria-label="팀 프로필 링크 공유"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 z-20 flex flex-col items-center text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white flex items-center gap-2 mb-1 tracking-tight drop-shadow-md">
                        {team.name}
                        {team.is_verified && (
                            <CheckCircle2 className="w-5 h-5 md:w-7 md:h-7 text-blue-400 fill-blue-900/40" />
                        )}
                    </h1>

                    {agencies && agencies.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
                            {agencies.map((agency) => (
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
                    )}

                    {team.bio && (
                        <p className="text-xs md:text-sm text-white/60 mb-2 max-w-md line-clamp-2">
                            {team.bio}
                        </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-white/50 mb-3">
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {memberCount}명
                        </span>
                        {team.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {team.location}
                            </span>
                        )}
                        {team.founded_date && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(team.founded_date).getFullYear()}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        {hasSocialLinks && (
                            <>
                                {socialLinks.instagram && (
                                    <a
                                        href={getSocialUrl("instagram", socialLinks.instagram)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 md:p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
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
                                    >
                                        <YoutubeIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
