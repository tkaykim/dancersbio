import { notFound } from "next/navigation";
import { getAgencyById, getDancersForAgency } from "@/lib/agencies";
import Image from "next/image";
import Link from "next/link";
import { Building2, Users, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import type { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const agency = await getAgencyById(id);
    if (!agency) return { title: "Dancers.bio" };
    const name = agency.company_name || agency.contact_person;
    return {
        title: `${name} | Dancers.bio`,
        description: agency.description || `${name} - Dancers.bio`,
    };
}

export const revalidate = 0;

export default async function AgencyProfilePage({ params }: PageProps) {
    const { id } = await params;
    const agency = await getAgencyById(id);

    if (!agency) return notFound();

    const dancers = await getDancersForAgency(id);
    const agencyName = agency.company_name || agency.contact_person;

    return (
        <div className="min-h-screen pb-20" style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}>
            <PageHeader title={agencyName} />

            <div className="max-w-[960px] mx-auto px-6 pt-6">
                {/* Agency Header */}
                <div className="flex items-start gap-4 mb-8">
                    <div
                        className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative"
                        style={{ background: 'var(--cue-surface-2)', border: '1px solid var(--cue-hairline)' }}
                    >
                        {agency.logo_url ? (
                            <Image src={agency.logo_url} alt={agencyName} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-8 h-8" style={{ color: 'var(--cue-ink-3)' }} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--cue-ink-3)',
                                marginBottom: 4,
                            }}
                        >
                            소속사
                        </div>
                        <h1
                            style={{
                                fontSize: 28,
                                fontWeight: 700,
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em',
                                color: 'var(--cue-ink)',
                            }}
                        >
                            {agencyName}
                        </h1>
                        {agency.description && (
                            <p style={{ fontSize: 13, color: 'var(--cue-ink-2)', marginTop: 8, lineHeight: 1.5 }} className="line-clamp-3">
                                {agency.description}
                            </p>
                        )}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                marginTop: 8,
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--cue-ink-3)',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Users className="w-3 h-3" />
                                소속 댄서 {dancers.length}명
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dancers */}
                <div>
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--cue-ink)',
                            marginBottom: 12,
                        }}
                    >
                        소속 댄서
                    </div>
                    {dancers.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', textAlign: 'center', padding: '40px 0' }}>
                            소속 댄서가 없습니다
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {dancers.map((d: any) => {
                                const dancer = d.dancers;
                                if (!dancer) return null;
                                return (
                                    <Link
                                        key={d.id}
                                        href={`/profile/${dancer.slug || dancer.id}`}
                                        className="group"
                                    >
                                        <div
                                            className="relative aspect-square rounded-xl overflow-hidden mb-2"
                                            style={{ background: 'var(--cue-surface-2)', border: '1px solid var(--cue-hairline)' }}
                                        >
                                            {dancer.profile_img ? (
                                                <Image
                                                    src={dancer.profile_img}
                                                    alt={dancer.stage_name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span style={{ color: 'var(--cue-ink-4)', fontWeight: 700, fontSize: 24 }}>
                                                        {dancer.stage_name?.slice(0, 2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <p
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: 'var(--cue-ink)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                padding: '0 4px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {dancer.stage_name}
                                            {dancer.is_verified && (
                                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--cue-accent)' }} />
                                            )}
                                        </p>
                                        {d.role && (
                                            <p
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--cue-ink-3)',
                                                    padding: '0 4px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {d.role}
                                            </p>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
