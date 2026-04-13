"use client";

import { extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/youtube";

interface TeamRepresentativeVideoProps {
    url: string | null;
    teamName: string;
}

export default function TeamRepresentativeVideo({ url, teamName }: TeamRepresentativeVideoProps) {
    if (!url) return null;

    const videoId = extractYouTubeId(url);
    if (!videoId) return null;

    const embedUrl = getYouTubeEmbedUrl(videoId);

    return (
        <div className="px-6 mb-10">
            <h3 className="text-xl font-bold tracking-tight text-foreground mb-4">Representative</h3>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                    src={embedUrl}
                    title={`${teamName} 대표영상`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </div>
        </div>
    );
}
