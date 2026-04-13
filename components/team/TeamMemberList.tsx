"use client";

import Image from "next/image";
import Link from "next/link";

interface TeamMemberData {
    id: string;
    role: string | null;
    dancers: {
        id: string;
        stage_name: string;
        profile_img: string | null;
        slug: string | null;
    };
}

interface TeamMemberListProps {
    members: TeamMemberData[];
}

export default function TeamMemberList({ members }: TeamMemberListProps) {
    if (!members || members.length === 0) return null;

    return (
        <div className="px-6 mb-10">
            <h3 className="text-xl font-bold tracking-tight text-foreground mb-4">Members</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {members.map((member) => {
                    const dancer = member.dancers;
                    const profileUrl = `/profile/${dancer.slug || dancer.id}`;
                    return (
                        <Link
                            key={member.id}
                            href={profileUrl}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-neutral-800 ring-2 ring-white/5 group-hover:ring-primary/30 transition-all">
                                {dancer.profile_img ? (
                                    <Image
                                        src={dancer.profile_img}
                                        alt={dancer.stage_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/30 font-bold text-lg">
                                        {dancer.stage_name.slice(0, 1)}
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-xs md:text-sm font-medium text-white truncate max-w-[80px] md:max-w-[100px]">
                                    {dancer.stage_name}
                                </p>
                                {member.role && (
                                    <p className="text-[10px] text-white/40 truncate max-w-[80px]">
                                        {member.role}
                                    </p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
