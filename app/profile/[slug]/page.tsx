import ProfileHeader from "@/components/profile/ProfileHeader";
import MediaGrid from "@/components/profile/MediaGrid";
import CareerTimeline from "@/components/profile/CareerTimeline";
import ViralFooterCard from "@/components/layout/ViralFooterCard";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isEmbargoActive, isProjectPublic } from "@/lib/utils";

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
    const groupedCareers: Record<string, any[]> = {};
    (careers || []).forEach((career) => {
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

        groupedCareers[career.type].push({
            id: career.id.toString(),
            year,
            title: career.title,
            description,
            image: career.details?.thumbnail || '',
            video_url: career.details?.link || ''
        });
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
            <CareerTimeline careers={dancerData.careers} />
            <MediaGrid items={dancerData.media} />
            <ViralFooterCard />
            <div className="h-10" />
        </main>
    );
}
