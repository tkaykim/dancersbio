import TeamProfileHeader from "@/components/team/TeamProfileHeader";
import TeamRepresentativeVideo from "@/components/team/TeamRepresentativeVideo";
import TeamMemberList from "@/components/team/TeamMemberList";
import ProfileHighlights from "@/components/profile/ProfileHighlights";
import CareerTimeline from "@/components/profile/CareerTimeline";
import MediaGrid from "@/components/profile/MediaGrid";
import ViralFooterCard from "@/components/layout/ViralFooterCard";
import { notFound } from "next/navigation";
import { getTeamBySlug, getTeamCareers } from "@/lib/teams";
import { getAgenciesForTeam } from "@/lib/agencies";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";
import type { Metadata } from "next";

interface PageProps {
    params: Promise<{ slug: string }>;
}

function getBaseUrl(): string {
    if (typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }
    if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "https://dancersbio.vercel.app";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const team = await getTeamBySlug(slug);
    if (!team) return { title: "Dancers.bio" };

    const title = `${team.name} | Dancers.bio`;
    const description = team.bio || `${team.name} - Dancers.bio`;
    const baseUrl = getBaseUrl();
    const imageUrl =
        team.profile_img?.startsWith("http") ? team.profile_img
        : team.profile_img ? `${baseUrl}${team.profile_img.startsWith("/") ? "" : "/"}${team.profile_img}`
        : undefined;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `${baseUrl}/team/${slug}`,
            siteName: "Dancers.bio",
            type: "profile",
            ...(imageUrl && {
                images: [{ url: imageUrl, width: 1200, height: 630, alt: team.name }],
            }),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...(imageUrl && { images: [imageUrl] }),
        },
    };
}

export const revalidate = 0;

export default async function TeamProfilePage({ params }: PageProps) {
    const { slug } = await params;
    const team = await getTeamBySlug(slug);

    if (!team) {
        return notFound();
    }

    const careers = await getTeamCareers(team.id);

    const teamAgencies = await getAgenciesForTeam(team.id);
    const agencies = teamAgencies
        .filter(ta => ta.clients)
        .map(ta => ({
            id: ta.agency_id,
            name: ta.clients.company_name || ta.clients.contact_person,
            is_primary: ta.is_primary,
        }));

    const activeMembers = (team.team_members || []).filter(m => m.is_active);

    // Build grouped careers (same logic as dancer profile)
    const groupedCareers: Record<string, any[]> = {};
    (careers || []).forEach((career) => {
        if (career.is_public !== true) return;

        if (!groupedCareers[career.type]) {
            groupedCareers[career.type] = [];
        }
        const yearFromDate = career.date ? (career.date.length === 4 ? career.date : new Date(career.date).getFullYear().toString()) : '';
        const year = career.details?.year || yearFromDate;
        const description = career.details?.role || career.details?.achievement || '';

        const rawUrl = career.details?.youtube_url || career.details?.link || '';
        const isRealVideo = /youtube\.com\/watch\?v=|youtu\.be\//.test(rawUrl);
        const videoUrl = isRealVideo ? rawUrl : '';
        const videoId = videoUrl ? extractYouTubeId(videoUrl) : null;
        const thumbnailUrl =
            (career.details?.thumbnail && String(career.details.thumbnail).trim()) ||
            (videoId ? getYouTubeThumbnail(videoId, 'hq') : '');

        groupedCareers[career.type].push({
            id: career.id.toString(),
            year,
            title: career.title,
            description,
            image: thumbnailUrl,
            video_url: videoUrl,
            sort_order: career.sort_order ?? 0,
        });
    });

    const hasRealVideo = (item: { video_url?: string }) =>
        !!item.video_url && /youtube\.com\/watch\?v=|youtu\.be\//.test(item.video_url);
    Object.keys(groupedCareers).forEach((type) => {
        groupedCareers[type].sort((a, b) => {
            const orderA = a.sort_order ?? 0;
            const orderB = b.sort_order ?? 0;
            if (orderA !== orderB) return orderB - orderA;
            const aHas = hasRealVideo(a);
            const bHas = hasRealVideo(b);
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            return parseInt(b.year || '0', 10) - parseInt(a.year || '0', 10);
        });
    });

    // Highlights: is_public && is_representative
    const highlights = (careers || [])
        .filter(c => c.is_public && c.is_representative)
        .map((career) => {
            const yearFromDate = career.date ? (career.date.length === 4 ? career.date : new Date(career.date).getFullYear().toString()) : '';
            const year = career.details?.year || yearFromDate;
            const description = career.details?.role || career.details?.achievement || '';
            const rawUrl = career.details?.youtube_url || career.details?.link || '';
            const isRealVideo = /youtube\.com\/watch\?v=|youtu\.be\//.test(rawUrl);
            const videoUrl = isRealVideo ? rawUrl : '';
            const videoId = videoUrl ? extractYouTubeId(videoUrl) : null;
            const thumbnailUrl =
                (career.details?.thumbnail && String(career.details.thumbnail).trim()) ||
                (videoId ? getYouTubeThumbnail(videoId, 'hq') : '');
            return {
                id: career.id.toString(),
                year,
                title: career.title,
                description,
                image: thumbnailUrl || undefined,
                video_url: videoUrl || undefined,
                sort_order: career.sort_order ?? 0,
            };
        })
        .sort((a, b) => {
            const orderA = a.sort_order ?? 0;
            const orderB = b.sort_order ?? 0;
            if (orderA !== orderB) return orderB - orderA;
            if (!!a.video_url !== !!b.video_url) return a.video_url ? -1 : 1;
            return parseInt(b.year || '0', 10) - parseInt(a.year || '0', 10);
        });

    const media = Array.isArray(team.portfolio)
        ? team.portfolio.map((item: any) => ({
            id: item.id,
            type: item.type,
            url: item.url,
            thumbnail: item.thumbnail || item.url,
        }))
        : [];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="w-full max-w-[960px] mx-auto pb-20">
                <TeamProfileHeader team={team} memberCount={activeMembers.length} agencies={agencies} />
                <TeamRepresentativeVideo url={team.representative_video} teamName={team.name} />
                <ProfileHighlights highlights={highlights} />
                <TeamMemberList members={activeMembers} />
                <CareerTimeline careers={groupedCareers} />
                <MediaGrid items={media} />
                <ViralFooterCard />
                <div className="h-10" />
            </main>
        </div>
    );
}
