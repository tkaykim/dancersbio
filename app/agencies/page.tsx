"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { Building2, Search, Users, Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

interface AgencyRow {
    id: string;
    company_name: string | null;
    contact_person: string;
    logo_url: string | null;
    description: string | null;
    dancer_count: number;
}

export default function AgenciesListPage() {
    const [agencies, setAgencies] = useState<AgencyRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        const { data, error } = await supabase
            .from("clients")
            .select(`
                id, company_name, contact_person, logo_url, description,
                dancer_agencies (id)
            `)
            .eq("type", "agency")
            .order("company_name", { ascending: true });

        if (!error && data) {
            setAgencies(
                data.map((a: any) => ({
                    ...a,
                    dancer_count: a.dancer_agencies?.length || 0,
                }))
            );
        }
        setLoading(false);
    };

    const filtered = query.trim()
        ? agencies.filter((a) => {
            const name = a.company_name || a.contact_person;
            return name.toLowerCase().includes(query.toLowerCase());
        })
        : agencies;

    return (
        <div className="min-h-screen bg-background pb-24">
            <PageHeader title="Agencies" />

            <div className="px-6 pt-4 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="소속사 검색..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                    />
                </div>
            </div>

            <div className="px-6 pt-2">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-sm">
                            {query ? "검색 결과가 없습니다" : "등록된 소속사가 없습니다"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((agency) => {
                            const name = agency.company_name || agency.contact_person;
                            return (
                                <Link
                                    key={agency.id}
                                    href={`/agency/${agency.id}`}
                                    className="flex items-center gap-4 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:bg-neutral-800/50 transition-colors"
                                >
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0 relative">
                                        {agency.logo_url ? (
                                            <Image src={agency.logo_url} alt={name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-white/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{name}</p>
                                        {agency.description && (
                                            <p className="text-xs text-white/40 line-clamp-1 mt-0.5">{agency.description}</p>
                                        )}
                                        <span className="text-[11px] text-white/30 flex items-center gap-1 mt-1">
                                            <Users className="w-3 h-3" />
                                            댄서 {agency.dancer_count}명
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
