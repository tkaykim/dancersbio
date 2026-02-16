import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, type Dancer } from "@/lib/supabase";
import type { DancerCategory } from "@/app/page";

const SPECIALTY_LABELS: Record<string, string> = {
    choreo: "안무",
    broadcast: "방송",
    battle: "배틀",
    workshop: "워크샵",
    judge: "심사",
    performance: "공연",
};

interface PortraitGridProps {
    category?: DancerCategory;
}

export default function PortraitGrid({ category = "all" }: PortraitGridProps) {
    const [dancers, setDancers] = useState<Dancer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDancers() {
            setLoading(true);

            const { data, error } = await supabase.rpc('get_dancers_by_category', {
                category,
                lim: 30,
            });

            if (error) {
                console.error('Error fetching dancers:', error);
                setDancers([]);
            } else {
                const verified = ((data as Dancer[]) || []).filter((d: any) => d.is_verified !== false)
                setDancers(verified);
            }
            setLoading(false);
        }

        fetchDancers();
    }, [category]);

    const sectionTitle = category === "battler"
        ? "Battle Dancers"
        : category === "choreographer"
            ? "Choreographers"
            : "Discover Dancers";

    if (loading) {
        return (
            <div className="px-6 pb-10">
                <h2 className="text-lg font-bold mb-4">{sectionTitle}</h2>
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-neutral-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (dancers.length === 0) {
        return (
            <div className="px-6 pb-10">
                <h2 className="text-lg font-bold mb-4">{sectionTitle}</h2>
                <div className="flex flex-col items-center justify-center py-16 text-white/40">
                    <p className="text-sm">해당 카테고리의 댄서가 아직 없습니다</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 pb-10">
            <h2 className="text-lg font-bold mb-4">{sectionTitle}</h2>
            <div className="grid grid-cols-2 gap-4">
                {dancers.map((dancer) => {
                    const primarySpecialty = dancer.specialties?.[0];
                    return (
                        <Link
                            key={dancer.id}
                            href={`/profile/${dancer.slug || dancer.id}`}
                            className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-900"
                        >
                            {/* Image Rendering */}
                            {dancer.profile_img ? (
                                <Image
                                    src={dancer.profile_img}
                                    alt={dancer.stage_name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                                    <span className="text-6xl opacity-20 font-bold uppercase">{dancer.stage_name[0]}</span>
                                </div>
                            )}

                            {/* Primary Specialty Badge */}
                            {primarySpecialty && (
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white/80 text-[10px] font-medium rounded-full border border-white/10">
                                        {SPECIALTY_LABELS[primarySpecialty] || primarySpecialty}
                                    </span>
                                </div>
                            )}

                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />

                            {/* Text Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                                <h3 className="text-white font-bold text-base mb-1 group-hover:text-primary transition-colors">
                                    {dancer.stage_name}
                                </h3>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {dancer.genres?.slice(0, 2).map((genre) => (
                                        <span key={genre} className="text-[10px] text-white/60">
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                                {dancer.is_verified && (
                                    <span className="text-[10px] text-primary">✓ Verified</span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
