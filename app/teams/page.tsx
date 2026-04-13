"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Team } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { Search, Users, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function TeamsListPage() {
    const [teams, setTeams] = useState<(Team & { member_count: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        const { data, error } = await supabase
            .from("teams")
            .select(`
                *,
                team_members (id)
            `)
            .eq("is_verified", true)
            .order("name", { ascending: true });

        if (!error && data) {
            setTeams(
                data.map((t: any) => ({
                    ...t,
                    member_count: t.team_members?.length || 0,
                }))
            );
        }
        setLoading(false);
    };

    const filtered = query.trim()
        ? teams.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
        : teams;

    return (
        <div className="min-h-screen bg-background pb-24">
            <PageHeader title="Teams" />

            <div className="px-6 pt-4 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="팀/크루 검색..."
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
                        <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-sm">
                            {query ? "검색 결과가 없습니다" : "등록된 팀이 없습니다"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filtered.map((team) => (
                            <Link
                                key={team.id}
                                href={`/team/${team.slug || team.id}`}
                                className="group"
                            >
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2">
                                    {team.profile_img ? (
                                        <Image
                                            src={team.profile_img}
                                            alt={team.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-white/20 font-bold text-3xl uppercase">
                                                {team.name.slice(0, 2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                                <div className="px-1">
                                    <p className="text-sm font-semibold text-white flex items-center gap-1 truncate">
                                        {team.name}
                                        {team.is_verified && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-900/40 flex-shrink-0" />
                                        )}
                                    </p>
                                    <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
                                        <span className="flex items-center gap-0.5">
                                            <Users className="w-3 h-3" />
                                            {team.member_count}
                                        </span>
                                        {team.location && (
                                            <span className="flex items-center gap-0.5">
                                                <MapPin className="w-3 h-3" />
                                                {team.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
