import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, type Dancer } from "@/lib/supabase";
import type { DancerCategory } from "@/app/page";
import { CueEyebrow, CueSerif } from "@/components/cue";

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
                // Photo-first: profiles with a profile_img come before those without,
                // preserving the RPC's existing order within each group.
                const withPhoto = verified.filter((d: any) => d.profile_img)
                const withoutPhoto = verified.filter((d: any) => !d.profile_img)
                setDancers([...withPhoto, ...withoutPhoto]);
            }
            setLoading(false);
        }

        fetchDancers();
    }, [category]);

    const sectionLabel = category === "battler" ? "01 · BATTLE" : category === "choreographer" ? "02 · CHOREO" : "00 · DISCOVER"
    const sectionTitle = category === "battler" ? "Battle dancers" : category === "choreographer" ? "Choreographers" : "Discover dancers"

    return (
        <div style={{ padding: '16px 20px 28px' }}>
            <div style={{ marginBottom: 16 }}>
                <CueEyebrow>{sectionLabel}</CueEyebrow>
                <div style={{ marginTop: 4 }}>
                    <CueSerif size={26}>
                        {sectionTitle}<span style={{ color: 'var(--cue-accent)' }}>.</span>
                    </CueSerif>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            style={{
                                aspectRatio: '3/4',
                                background: 'var(--cue-surface-2)',
                                borderRadius: 14,
                                animation: 'cue-pulse 1.4s ease-in-out infinite',
                            }}
                        />
                    ))}
                    <style>{`@keyframes cue-pulse { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }`}</style>
                </div>
            ) : dancers.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: 'var(--cue-ink-3)' }}>
                    <p style={{ fontSize: 13 }}>해당 카테고리의 댄서가 아직 없습니다</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {dancers.map((dancer) => {
                        const primarySpecialty = dancer.specialties?.[0];
                        return (
                            <Link
                                key={dancer.id}
                                href={`/profile/${dancer.slug || dancer.id}`}
                                style={{
                                    position: 'relative',
                                    aspectRatio: '3/4',
                                    borderRadius: 14,
                                    overflow: 'hidden',
                                    background: 'var(--cue-surface-2)',
                                    border: '1px solid var(--cue-hairline)',
                                    display: 'block',
                                    textDecoration: 'none',
                                }}
                            >
                                {dancer.profile_img ? (
                                    <Image
                                        src={dancer.profile_img}
                                        alt={dancer.stage_name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--cue-ink-4)',
                                            fontSize: 64,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {dancer.stage_name[0]}
                                    </div>
                                )}

                                {primarySpecialty && (
                                    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
                                        <span
                                            style={{
                                                padding: '3px 8px',
                                                background: 'rgba(11,11,13,0.7)',
                                                backdropFilter: 'blur(8px)',
                                                color: 'var(--cue-ink-2)',
                                                fontSize: 11,
                                                fontWeight: 500,
                                                borderRadius: 999,
                                                border: '1px solid var(--cue-hairline)',
                                                letterSpacing: 0.1,
                                            }}
                                        >
                                            {SPECIALTY_LABELS[primarySpecialty] || primarySpecialty}
                                        </span>
                                    </div>
                                )}

                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to bottom, transparent 50%, rgba(14,14,12,0.92))',
                                    }}
                                />

                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, zIndex: 2 }}>
                                    <div style={{ color: 'var(--cue-ink)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                                        {dancer.stage_name}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {dancer.genres?.slice(0, 2).map((genre) => (
                                            <span key={genre} style={{ fontSize: 10, color: 'var(--cue-ink-3)' }}>
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                    {dancer.is_verified && (
                                        <span style={{ fontSize: 10, color: 'var(--cue-accent)', marginTop: 4, display: 'inline-block' }}>
                                            ✓ Verified
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
