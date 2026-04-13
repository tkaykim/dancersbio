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
        <div className="min-h-screen bg-background text-foreground pb-20">
            <PageHeader title={agencyName} />

            <div className="max-w-[960px] mx-auto px-6 pt-6">
                {/* Agency Header */}
                <div className="flex items-start gap-4 mb-8">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0 relative">
                        {agency.logo_url ? (
                            <Image src={agency.logo_url} alt={agencyName} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-white/30" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-white">{agencyName}</h1>
                        {agency.description && (
                            <p className="text-sm text-white/50 mt-1 line-clamp-3">{agency.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                소속 댄서 {dancers.length}명
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dancers */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">소속 댄서</h2>
                    {dancers.length === 0 ? (
                        <p className="text-sm text-white/40 text-center py-10">소속 댄서가 없습니다</p>
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
                                        <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2">
                                            {dancer.profile_img ? (
                                                <Image
                                                    src={dancer.profile_img}
                                                    alt={dancer.stage_name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-white/20 font-bold text-2xl">
                                                        {dancer.stage_name?.slice(0, 2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-white flex items-center gap-1 truncate px-1">
                                            {dancer.stage_name}
                                            {dancer.is_verified && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-900/40 flex-shrink-0" />
                                            )}
                                        </p>
                                        {d.role && (
                                            <p className="text-[11px] text-white/40 px-1 truncate">{d.role}</p>
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
