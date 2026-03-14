import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileHighlights from "@/components/profile/ProfileHighlights";
import MediaGrid from "@/components/profile/MediaGrid";
import CareerTimeline from "@/components/profile/CareerTimeline";
import ViralFooterCard from "@/components/layout/ViralFooterCard";
import ClaimRequestSection from "@/components/profile/ClaimRequestSection";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isEmbargoActive, isProjectPublic } from "@/lib/utils";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 0; // Disable caching to ensure fresh profile data


export default async function ProfilePage({ params }: PageProps) {
    const { slug } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    // Fetch dancer data
    const query = supabase
        .from('dancers')
        .select('*');

    if (isUuid) {
        query.eq('id', slug);
    } else {
        query.eq('slug', slug);
    }

    const { data: dancer, error: dancerError } = await query.single();

    if (dancerError || !dancer) {
        return notFound();
    }

    let agencyName: string | null = null;
    if (dancer.agency_id) {
        const { data: agency } = await supabase
            .from('clients')
            .select('company_name, contact_person')
            .eq('id', dancer.agency_id)
            .single();
        if (agency) {
            agencyName = agency.company_name || agency.contact_person;
        }
    }

    // Fetch career data
    const { data: careers, error: careersError } = await supabase
        .from('careers')
        .select('*')
        .eq('dancer_id', dancer.id)
        .order('date', { ascending: false });

    // 비공개(private) 프로젝트에서 자동 생성된 경력은 공개 프로필에서 숨김
    // details.project_id가 있는 경력은 해당 프로젝트의 visibility를 확인
    const projectLinkedCareers = (careers || []).filter(c => c.details?.project_id)
    const projectIds = [...new Set(projectLinkedCareers.map(c => c.details.project_id))]

    let privateProjectIds = new Set<string>()
    if (projectIds.length > 0) {
        const { data: projects } = await supabase
            .from('projects')
            .select('id, visibility, embargo_date')
            .in('id', projectIds)

        if (projects) {
            // 엠바고 만료된 private 프로젝트는 자동으로 public 전환 (lazy update)
            const autoPublishIds: string[] = []

            for (const proj of projects) {
                const embargoStillActive = isEmbargoActive(proj.embargo_date)
                const effectivelyPublic = isProjectPublic(proj.visibility, proj.embargo_date)

                if (!effectivelyPublic) {
                    // 아직 비공개 (엠바고 진행 중이거나 수동 비공개)
                    privateProjectIds.add(proj.id)
                } else if (proj.visibility === 'private' && proj.embargo_date && !embargoStillActive) {
                    // 엠바고 만료됨 → DB에서 visibility를 'public'으로 자동 갱신
                    autoPublishIds.push(proj.id)
                }
            }

            // 엠바고 만료된 프로젝트를 자동 공개 전환 (백그라운드)
            if (autoPublishIds.length > 0) {
                await supabase
                    .from('projects')
                    .update({ visibility: 'public' })
                    .in('id', autoPublishIds)
            }
        }
    }

    // Transform careers data to match component format
    // 주의: 금액 정보(fee, budget, contract_amount 등)는 절대 포함하지 않음
    // 공개 여부(is_public)가 true인 경력만 프로필에 노출
    const groupedCareers: Record<string, any[]> = {};
    (careers || []).forEach((career) => {
        if (career.is_public !== true) return
        // 비공개/엠바고 프로젝트의 경력은 스킵
        if (career.details?.project_id && privateProjectIds.has(career.details.project_id)) {
            return
        }

        if (!groupedCareers[career.type]) {
            groupedCareers[career.type] = [];
        }
        // year: details.year 우선, 없으면 date 컬럼에서 추출
        const yearFromDetails = career.details?.year
        const yearFromDate = career.date ? new Date(career.date).getFullYear().toString() : ''
        const year = yearFromDetails || yearFromDate
        // 공개 프로필에서는 PM 여부를 표기하지 않음 (내부 데이터에는 유지)
        const rawRole = career.details?.role || career.details?.achievement || ''
        const description = rawRole.replace(/\s*\(PM\)\s*·?\s*/g, ' · ').replace(/\s*·\s*$/, '').trim() || rawRole

        // video_url: 실제 영상 링크만. 채널 URL은 사용하지 않음 (썸네일 불가)
        const rawUrl = career.details?.youtube_url || career.details?.link || '';
        const isRealVideo = /youtube\.com\/watch\?v=|youtu\.be\//.test(rawUrl);
        const videoUrl = isRealVideo ? rawUrl : '';
        // 썸네일: DB에 있으면 사용, 없으면 YouTube URL에서 추출 (항상 영상이 있으면 썸네일 노출)
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
            video_url: videoUrl
        });
    });

    // 영상 URL이 있는 경력을 앞에, 없는 경력은 맨 뒤로 정렬 (같은 그룹 내에서는 연도 내림차순)
    const hasRealVideo = (item: { video_url?: string }) =>
      !!item.video_url && /youtube\.com\/watch\?v=|youtu\.be\//.test(item.video_url);
    Object.keys(groupedCareers).forEach((type) => {
        groupedCareers[type].sort((a, b) => {
            const aHas = hasRealVideo(a);
            const bHas = hasRealVideo(b);
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            // 같은 그룹(둘 다 URL 있음 또는 둘 다 없음)이면 연도 내림차순
            const yearA = parseInt(a.year || '0', 10);
            const yearB = parseInt(b.year || '0', 10);
            return yearB - yearA;
        });
    });

    // 대표 경력(Highlights): is_public && is_representative 이고, 비공개 프로젝트 제외
    const highlightCareers = (careers || []).filter(
        (c) =>
            c.is_public === true &&
            c.is_representative === true &&
            !(c.details?.project_id && privateProjectIds.has(c.details.project_id))
    );
    const highlights = highlightCareers.map((career) => {
        const yearFromDetails = career.details?.year;
        const yearFromDate = career.date ? new Date(career.date).getFullYear().toString() : '';
        const year = yearFromDetails || yearFromDate;
        const rawRole = career.details?.role || career.details?.achievement || '';
        const description = rawRole.replace(/\s*\(PM\)\s*·?\s*/g, ' · ').replace(/\s*·\s*$/, '').trim() || rawRole;
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
        };
    });
    // 연도 내림차순, 영상 있는 항목 우선
    highlights.sort((a, b) => {
        const aHas = !!a.video_url;
        const bHas = !!b.video_url;
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return parseInt(b.year || '0', 10) - parseInt(a.year || '0', 10);
    });

    // Transform dancer data to match component format
    const dancerData = {
        id: dancer.id,
        name: dancer.stage_name,
        role: dancer.specialties?.join(' • ') || 'Dancer',
        image: dancer.profile_img || '',
        isVerified: dancer.is_verified,
        isClaimed: !!dancer.owner_id,
        location: dancer.location || 'Seoul',
        stats: { followers: '0', views: '0' },
        socialLinks: dancer.social_links || null,
        agencyName,
        careers: groupedCareers,
        media: Array.isArray(dancer.portfolio) ? dancer.portfolio.map((item: any) => ({
            id: item.id,
            type: item.type,
            url: item.url,
            thumbnail: item.thumbnail || item.url // Use url as thumbnail for images if not provided
        })) : []
    };

    return (
        <main className="w-full min-h-screen pb-20 bg-background text-foreground">
            <ProfileHeader dancer={dancerData} />
            <ProfileHighlights highlights={highlights} />
            <CareerTimeline careers={dancerData.careers} />
            <MediaGrid items={dancerData.media} />
            <ViralFooterCard />
            <ClaimRequestSection dancerId={dancer.id} />
            <div className="h-10" />
        </main>
    );
}
