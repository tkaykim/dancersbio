import ProfileHeader from "@/components/profile/ProfileHeader";
import MediaGrid from "@/components/profile/MediaGrid";
import CareerTimeline from "@/components/profile/CareerTimeline";
import ViralFooterCard from "@/components/layout/ViralFooterCard";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const revalidate = 0; // Disable caching to ensure fresh profile data


export default async function ProfilePage({ params }: PageProps) {
    const { id } = await params;

    // Fetch dancer data
    const { data: dancer, error: dancerError } = await supabase
        .from('dancers')
        .select('*')
        .eq('id', id)
        .single();

    if (dancerError || !dancer) {
        return notFound();
    }

    // Fetch career data
    const { data: careers, error: careersError } = await supabase
        .from('careers')
        .select('*')
        .eq('dancer_id', id)
        .order('date', { ascending: false });

    // Transform careers data to match component format
    const groupedCareers: Record<string, any[]> = {};
    (careers || []).forEach((career) => {
        if (!groupedCareers[career.type]) {
            groupedCareers[career.type] = [];
        }
        groupedCareers[career.type].push({
            id: career.id.toString(),
            year: new Date(career.date).getFullYear().toString(),
            title: career.title,
            description: career.details?.role || career.details?.achievement || '',
            image: career.details?.thumbnail || ''
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
